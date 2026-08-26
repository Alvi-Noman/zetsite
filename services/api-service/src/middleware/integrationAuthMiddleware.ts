// Authenticates requests from a connected external integration (currently
// zetsales) via a Bearer access token — modeled directly on
// storeSlugMiddleware.ts's pattern (internal call to auth-service + a short
// in-memory cache), kept entirely separate from requireAuth's merchant-login
// JWT so an integration token can never be mistaken for a browser session.
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export interface IntegrationScopedRequest extends Request {
  integration?: {
    connectionId: string;
    storeId: string;
  };
}

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4002';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface VerifyResult {
  connectionId: string;
  storeId: string;
}

const cache = new Map<string, { result: VerifyResult | null; expiresAt: number }>();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function verifyToken(tokenHash: string): Promise<VerifyResult | null> {
  const cached = cache.get(tokenHash);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  let result: VerifyResult | null = null;
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/integrations/internal/verify?token=${encodeURIComponent(tokenHash)}`);
    if (response.ok) {
      const data = (await response.json()) as { success: boolean; connectionId: string; storeId: string };
      result = { connectionId: data.connectionId, storeId: data.storeId };
    }
  } catch {
    result = null;
  }

  cache.set(tokenHash, { result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

export async function requireIntegrationToken(req: IntegrationScopedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing bearer token' });
    return;
  }

  const token = header.slice(7);
  const result = await verifyToken(hashToken(token));
  if (!result) {
    res.status(401).json({ success: false, message: 'Invalid or revoked token' });
    return;
  }

  req.integration = result;
  next();
}
