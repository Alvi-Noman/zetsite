// Lets a merchant connect their zetsite store to zetsales — a real OAuth
// authorization-code flow (consent screen + single-use code + server-to-server
// token exchange), the same shape Shopify's own OAuth apps use, but scoped to
// one static, trusted partner ("zetsales") rather than a full multi-tenant
// OAuth-client registry, since these are two products the same person owns.
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../utils/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const AUTH_CODE_TTL_MS = 5 * 60 * 1000;
const TOKEN_PREFIX = 'zsi_live_';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isAllowedRedirectUri(redirectUri: string): boolean {
  const allowed = process.env.ZETSALES_REDIRECT_URI;
  return !!allowed && redirectUri === allowed;
}

function serializeConnection(doc: any) {
  return {
    id: doc._id.toString(),
    appId: doc.appId,
    webhookUrl: doc.webhookUrl ?? null,
    status: doc.status,
    createdAt: doc.createdAt,
    revokedAt: doc.revokedAt ?? null,
  };
}

// Step 1: the consent screen (in the builder frontend) calls this to validate
// the redirect_uri it was handed and to show which store it's connecting.
export async function authorizeInfo(req: AuthenticatedRequest, res: Response) {
  const redirectUri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : '';
  if (!isAllowedRedirectUri(redirectUri)) {
    res.status(400).json({ success: false, message: 'Unrecognized redirect_uri' });
    return;
  }
  if (!req.user!.store) {
    res.status(400).json({ success: false, message: 'No store found for this account' });
    return;
  }
  res.json({ success: true, storeName: req.user!.store.name });
}

// Step 2: merchant clicks Approve on the consent screen — mint a single-use
// code, hand it back to the frontend to redirect the browser with.
export async function authorize(req: AuthenticatedRequest, res: Response) {
  const redirectUri = typeof req.body?.redirectUri === 'string' ? req.body.redirectUri : '';
  const state = typeof req.body?.state === 'string' ? req.body.state.slice(0, 200) : '';
  if (!isAllowedRedirectUri(redirectUri)) {
    res.status(400).json({ success: false, message: 'Unrecognized redirect_uri' });
    return;
  }
  if (!req.user!.store) {
    res.status(400).json({ success: false, message: 'No store found for this account' });
    return;
  }

  const code = crypto.randomBytes(24).toString('hex');
  const db = getDb();
  await db.collection('integration_auth_codes').insertOne({
    code,
    storeId: new ObjectId(req.user!.store.id),
    redirectUri,
    used: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + AUTH_CODE_TTL_MS),
  });

  const url = new URL(redirectUri);
  url.searchParams.set('code', code);
  if (state) url.searchParams.set('state', state);
  res.json({ success: true, redirectUrl: url.toString() });
}

// Step 3: zetsales' backend calls this server-to-server (never the browser)
// to exchange the one-time code for a long-lived access token.
export async function token(req: Request, res: Response) {
  const sharedSecret = req.headers['x-integration-secret'];
  if (!process.env.ZETSALES_INTEGRATION_SECRET || sharedSecret !== process.env.ZETSALES_INTEGRATION_SECRET) {
    res.status(401).json({ success: false, message: 'Invalid integration secret' });
    return;
  }

  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  const redirectUri = typeof req.body?.redirectUri === 'string' ? req.body.redirectUri : '';
  if (!code || !isAllowedRedirectUri(redirectUri)) {
    res.status(400).json({ success: false, message: 'Invalid code or redirect_uri' });
    return;
  }

  const db = getDb();
  const authCode = await db.collection('integration_auth_codes').findOne({ code, used: false, redirectUri });
  if (!authCode || authCode.expiresAt < new Date()) {
    res.status(400).json({ success: false, message: 'Code is invalid or expired' });
    return;
  }
  await db.collection('integration_auth_codes').updateOne({ _id: authCode._id }, { $set: { used: true } });

  const store = await db.collection('stores').findOne({ _id: authCode.storeId });
  if (!store) {
    res.status(404).json({ success: false, message: 'Store not found' });
    return;
  }

  const accessToken = TOKEN_PREFIX + crypto.randomBytes(32).toString('hex');
  await db.collection('integration_connections').updateOne(
    { storeId: store._id, appId: 'zetsales' },
    {
      $set: { accessTokenHash: hashToken(accessToken), status: 'connected' },
      $setOnInsert: { storeId: store._id, appId: 'zetsales', createdAt: new Date() },
      $unset: { revokedAt: '' },
    },
    { upsert: true },
  );

  res.json({
    success: true,
    accessToken,
    storeId: store._id.toString(),
    storeName: store.name,
    storeSlug: store.slug,
  });
}

export async function listConnections(req: AuthenticatedRequest, res: Response) {
  if (!req.user!.store) {
    res.json({ success: true, connections: [] });
    return;
  }
  const db = getDb();
  const connections = await db
    .collection('integration_connections')
    .find({ storeId: new ObjectId(req.user!.store.id) })
    .toArray();
  res.json({ success: true, connections: connections.map(serializeConnection) });
}

export async function deleteConnection(req: AuthenticatedRequest, res: Response) {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid id' });
    return;
  }
  if (!req.user!.store) {
    res.status(404).json({ success: false, message: 'Connection not found' });
    return;
  }
  const db = getDb();
  const result = await db.collection('integration_connections').updateOne(
    { _id: new ObjectId(req.params.id), storeId: new ObjectId(req.user!.store.id) },
    { $set: { status: 'revoked', revokedAt: new Date() }, $unset: { accessTokenHash: '' } },
  );
  if (result.matchedCount === 0) {
    res.status(404).json({ success: false, message: 'Connection not found' });
    return;
  }
  res.json({ success: true });
}

// Lets zetsales register where it wants webhooks delivered, once connected.
export async function registerWebhook(req: Request, res: Response) {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
  if (!bearerToken) {
    res.status(401).json({ success: false, message: 'Missing bearer token' });
    return;
  }
  const webhookUrl = typeof req.body?.webhookUrl === 'string' ? req.body.webhookUrl : '';
  const events = Array.isArray(req.body?.events) ? req.body.events.filter((e: unknown) => typeof e === 'string') : [];
  if (!webhookUrl) {
    res.status(400).json({ success: false, message: 'webhookUrl is required' });
    return;
  }

  const db = getDb();
  const result = await db.collection('integration_connections').updateOne(
    { accessTokenHash: hashToken(bearerToken), status: 'connected' },
    { $set: { webhookUrl, webhookEvents: events } },
  );
  if (result.matchedCount === 0) {
    res.status(401).json({ success: false, message: 'Invalid or revoked token' });
    return;
  }
  res.json({ success: true });
}

// Internal, unauthenticated — api-service's outbound webhook dispatcher
// calls this (by storeId, not token) to find where to push live change
// events, caching the result briefly.
export async function getConnectionByStoreId(req: Request, res: Response) {
  if (!ObjectId.isValid(req.params.storeId)) {
    res.status(400).json({ success: false, message: 'Invalid storeId' });
    return;
  }
  const db = getDb();
  const connection = await db
    .collection('integration_connections')
    .findOne({ storeId: new ObjectId(req.params.storeId), status: 'connected' });
  res.json({
    success: true,
    webhookUrl: connection?.webhookUrl ?? null,
    webhookEvents: connection?.webhookEvents ?? [],
  });
}

// Internal, unauthenticated (network-trust only, same model as
// domainController.ts's resolveDomain) — api-service's integration auth
// middleware calls this on every request needing an integration token,
// caching the result briefly.
export async function verifyIntegrationToken(req: Request, res: Response) {
  const tokenHash = typeof req.query.token === 'string' ? req.query.token : '';
  if (!tokenHash) {
    res.status(400).json({ success: false, message: 'token is required' });
    return;
  }
  const db = getDb();
  const connection = await db.collection('integration_connections').findOne({ accessTokenHash: tokenHash, status: 'connected' });
  if (!connection) {
    res.status(404).json({ success: false, message: 'Invalid or revoked token' });
    return;
  }
  res.json({
    success: true,
    connectionId: connection._id.toString(),
    storeId: connection.storeId.toString(),
    webhookUrl: connection.webhookUrl ?? null,
    webhookEvents: connection.webhookEvents ?? [],
  });
}
