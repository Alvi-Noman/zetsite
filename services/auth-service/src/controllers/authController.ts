import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@zetsite/config/validateEnv';
import { getDb } from '../utils/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { isDomainConnected } from './domainController.js';

function signToken(id: string, email: string, storeId: string) {
  return jwt.sign({ id, email, storeId }, env.JWT_SECRET, { expiresIn: '7d' });
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createUniqueStoreSlug(db: ReturnType<typeof getDb>, name: string) {
  const base = slugify(name) || 'store';
  let slug = base;
  let suffix = 1;
  while (await db.collection('stores').findOne({ slug })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

async function findStoreBySlug(db: ReturnType<typeof getDb>, slug: string) {
  return db.collection('stores').findOne({ slug });
}

function extractSubdomain(host: string, rootDomain: string | undefined) {
  const hostname = host.split(':')[0].toLowerCase();
  if (rootDomain && hostname.endsWith(`.${rootDomain}`)) {
    return hostname.slice(0, -(rootDomain.length + 1));
  }
  const parts = hostname.split('.');
  return parts.length > 2 ? parts[0] : hostname;
}

// Caddy's on_demand_tls "ask" directive calls this before issuing a
// certificate for a subdomain OR a merchant's connected custom domain — only
// slugs that map to a real store, or domains verified as pointing here, get
// one.
export async function allowSubdomain(req: Request, res: Response) {
  const domain = (req.query.domain as string) || '';
  if (!domain) {
    res.status(400).end();
    return;
  }

  const rootDomain = process.env.SITE_ROOT_DOMAIN;
  const hostname = domain.split(':')[0].toLowerCase();
  const isPlatformSubdomain = !!rootDomain && (hostname === rootDomain || hostname.endsWith(`.${rootDomain}`));

  if (isPlatformSubdomain) {
    const slug = extractSubdomain(domain, rootDomain);
    const db = getDb();
    const store = await findStoreBySlug(db, slug);
    if (!store) {
      res.status(404).end();
      return;
    }
    res.status(200).end();
    return;
  }

  // Not a *.rootDomain request — only allow it if a merchant has connected
  // and verified this exact domain as a custom domain.
  const connected = await isDomainConnected(hostname);
  if (!connected) {
    res.status(404).end();
    return;
  }
  res.status(200).end();
}

// Internal, unauthenticated lookup used by api-service to resolve a store by
// its subdomain slug for public storefront routes. Not exposed publicly.
export async function getStoreBySlug(req: Request, res: Response) {
  const { slug } = req.params;
  const db = getDb();
  const store = await findStoreBySlug(db, slug);

  if (!store) {
    res.status(404).json({ success: false, message: 'Store not found' });
    return;
  }

  res.json({
    success: true,
    store: { id: store._id.toString(), name: store.name, slug: store.slug },
  });
}

function setAuthCookie(res: Response, token: string) {
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
}

function clearAuthCookie(res: Response) {
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  res.clearCookie('token', { ...(cookieDomain ? { domain: cookieDomain } : {}) });
}

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, storeName } = req.body;

    if (!email || !password || !storeName) {
      res
        .status(400)
        .json({ success: false, message: 'Email, password, and store name are required' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      return;
    }
    if (typeof storeName !== 'string' || storeName.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Store name must be at least 2 characters' });
      return;
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email is already registered' });
      return;
    }

    const slug = await createUniqueStoreSlug(db, storeName);
    const storeResult = await db.collection('stores').insertOne({
      name: storeName.trim(),
      slug,
      createdAt: new Date(),
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      email: normalizedEmail,
      password: hashedPassword,
      storeId: storeResult.insertedId,
      createdAt: new Date(),
    });

    await db
      .collection('stores')
      .updateOne({ _id: storeResult.insertedId }, { $set: { ownerId: result.insertedId } });

    const token = signToken(
      result.insertedId.toString(),
      normalizedEmail,
      storeResult.insertedId.toString(),
    );
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        email: normalizedEmail,
        store: { id: storeResult.insertedId.toString(), name: storeName.trim(), slug },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase();
    const user = await db.collection('users').findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const store = await db.collection('stores').findOne({ _id: user.storeId });

    const token = signToken(user._id.toString(), user.email, user.storeId?.toString() ?? '');
    setAuthCookie(res, token);

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        store: store ? { id: store._id.toString(), name: store.name, slug: store.slug } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.json({ success: true });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  res.json({ success: true, user: req.user });
}
