import type { Request, Response, NextFunction } from 'express';
import type { StoreSummary } from '@zetsite/shared';

export interface StoreScopedRequest extends Request {
  store?: StoreSummary;
}

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4002';
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { store: StoreSummary | null; expiresAt: number }>();

async function lookupStoreBySlug(slug: string): Promise<StoreSummary | null> {
  const cached = cache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.store;
  }

  let store: StoreSummary | null = null;
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/internal/stores/by-slug/${encodeURIComponent(slug)}`);
    if (response.ok) {
      const data = (await response.json()) as { success: boolean; store?: StoreSummary };
      store = data.store ?? null;
    }
  } catch {
    store = null;
  }

  cache.set(slug, { store, expiresAt: Date.now() + CACHE_TTL_MS });
  return store;
}

export async function resolveStoreBySlug(req: StoreScopedRequest, res: Response, next: NextFunction) {
  const slug = req.params.slug;
  if (!slug || typeof slug !== 'string') {
    res.status(400).json({ success: false, message: 'Store slug is required' });
    return;
  }

  const store = await lookupStoreBySlug(slug);
  if (!store) {
    res.status(404).json({ success: false, message: 'Store not found' });
    return;
  }

  req.store = store;
  next();
}
