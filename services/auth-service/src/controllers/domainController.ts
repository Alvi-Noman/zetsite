import type { Request, Response } from 'express';
import { promises as dns } from 'dns';
import { ObjectId } from 'mongodb';
import { getDb } from '../utils/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const MAX_DOMAINS_PER_STORE = 5;

function normalizeDomain(input: string): string | null {
  let host = input.trim().toLowerCase();
  // Accept a pasted URL as well as a bare hostname — Shopify's own "Connect
  // existing domain" field does the same.
  host = host.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  if (!/^[a-z0-9]([a-z0-9-]{0,62}\.)+[a-z]{2,}$/.test(host)) return null;
  return host;
}

function rootDomain(): string {
  return (process.env.SITE_ROOT_DOMAIN || '').toLowerCase();
}

function isReserved(domain: string): boolean {
  const root = rootDomain();
  if (!root) return false;
  return domain === root || domain.endsWith(`.${root}`);
}

function serializeDomain(doc: any) {
  return {
    id: doc._id.toString(),
    domain: doc.domain,
    status: doc.status,
    createdAt: doc.createdAt,
    verifiedAt: doc.verifiedAt ?? null,
  };
}

export async function listDomains(req: AuthenticatedRequest, res: Response) {
  const db = getDb();
  const storeId = new ObjectId(req.user!.store!.id);
  const domains = await db.collection('custom_domains').find({ storeId }).sort({ createdAt: -1 }).toArray();
  res.json({ success: true, domains: domains.map(serializeDomain), cnameTarget: rootDomain() });
}

export async function addDomain(req: AuthenticatedRequest, res: Response) {
  const raw = typeof req.body?.domain === 'string' ? req.body.domain : '';
  const domain = normalizeDomain(raw);
  if (!domain) {
    res.status(400).json({ success: false, message: 'Enter a valid domain, e.g. shop.example.com' });
    return;
  }
  if (isReserved(domain)) {
    res.status(400).json({ success: false, message: 'That domain is reserved by the platform' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.store!.id);

  const existingForStore = await db.collection('custom_domains').countDocuments({ storeId });
  if (existingForStore >= MAX_DOMAINS_PER_STORE) {
    res.status(400).json({ success: false, message: `You can connect up to ${MAX_DOMAINS_PER_STORE} domains` });
    return;
  }

  const claimed = await db.collection('custom_domains').findOne({ domain });
  if (claimed) {
    res.status(409).json({ success: false, message: 'This domain is already connected to a store' });
    return;
  }

  const result = await db.collection('custom_domains').insertOne({
    storeId,
    domain,
    status: 'pending',
    createdAt: new Date(),
    verifiedAt: null,
  });

  const doc = await db.collection('custom_domains').findOne({ _id: result.insertedId });
  res.status(201).json({ success: true, domain: serializeDomain(doc) });
}

// Checks whether the domain's DNS actually points at this platform yet.
// - Subdomain-style (shop.example.com): a CNAME record pointing anywhere
//   under our root domain is sufficient — Caddy's routing decision is made
//   from the request's Host header, not from where DNS resolves to, so any
//   hostname on the platform works as a CNAME target.
// - Apex/root-style (example.com): apex records can't be a CNAME per DNS
//   spec, so instead this compares the domain's own A records against the
//   platform root domain's A records — if they match, it's pointed at the
//   same server, without needing a separately hardcoded platform IP.
async function checkDnsConnected(domain: string): Promise<boolean> {
  const root = rootDomain();
  if (!root) return false;

  try {
    const cnames = await dns.resolveCname(domain);
    if (cnames.some((c) => c.toLowerCase().replace(/\.$/, '') === root || c.toLowerCase().endsWith(`.${root}`))) {
      return true;
    }
  } catch {
    // no CNAME — fall through to the A-record apex check
  }

  try {
    const [domainIps, rootIps] = await Promise.all([dns.resolve4(domain), dns.resolve4(root)]);
    return domainIps.some((ip) => rootIps.includes(ip));
  } catch {
    return false;
  }
}

export async function verifyDomain(req: AuthenticatedRequest, res: Response) {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid id' });
    return;
  }
  const db = getDb();
  const storeId = new ObjectId(req.user!.store!.id);
  const doc = await db.collection('custom_domains').findOne({ _id: new ObjectId(req.params.id), storeId });
  if (!doc) {
    res.status(404).json({ success: false, message: 'Domain not found' });
    return;
  }

  const connected = await checkDnsConnected(doc.domain);
  if (!connected) {
    res.json({
      success: true,
      verified: false,
      message: "DNS doesn't point here yet — this can take a few minutes to a few hours to propagate after you update it.",
    });
    return;
  }

  await db
    .collection('custom_domains')
    .updateOne({ _id: doc._id }, { $set: { status: 'verified', verifiedAt: new Date() } });
  res.json({ success: true, verified: true });
}

export async function deleteDomain(req: AuthenticatedRequest, res: Response) {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid id' });
    return;
  }
  const db = getDb();
  const storeId = new ObjectId(req.user!.store!.id);
  const result = await db.collection('custom_domains').deleteOne({ _id: new ObjectId(req.params.id), storeId });
  if (result.deletedCount === 0) {
    res.status(404).json({ success: false, message: 'Domain not found' });
    return;
  }
  res.json({ success: true });
}

// Internal, unauthenticated lookup used by api-service and the storefront
// app to resolve a request's Host header to a store when it isn't a
// `*.<rootDomain>` subdomain — i.e. it's a connected custom domain.
export async function resolveDomain(req: Request, res: Response) {
  const host = typeof req.query.host === 'string' ? req.query.host.toLowerCase().split(':')[0] : '';
  if (!host) {
    res.status(400).json({ success: false, message: 'host is required' });
    return;
  }

  const db = getDb();
  const doc = await db.collection('custom_domains').findOne({ domain: host, status: 'verified' });
  if (!doc) {
    res.status(404).json({ success: false, message: 'No store connected to this domain' });
    return;
  }

  const store = await db.collection('stores').findOne({ _id: doc.storeId });
  if (!store) {
    res.status(404).json({ success: false, message: 'Store not found' });
    return;
  }

  res.json({ success: true, slug: store.slug });
}

// Caddy's on_demand_tls "ask" directive calls this before issuing a
// certificate — a connected-but-not-yet-verified domain doesn't get one,
// closing off cert issuance as a way to probe/claim domains you don't
// control.
export async function isDomainConnected(domain: string): Promise<boolean> {
  const db = getDb();
  const doc = await db.collection('custom_domains').findOne({ domain: domain.toLowerCase(), status: 'verified' });
  return !!doc;
}
