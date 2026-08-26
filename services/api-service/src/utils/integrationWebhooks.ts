// Pushes live product/order change events out to a connected integration
// (currently just zetsales) — the outbound half of the OAuth connection set
// up in auth-service's integrationController.ts. Mirrors zetsales' own
// inbound-webhook HMAC convention exactly (HMAC-SHA256 of the raw JSON body,
// base64-encoded) so its receiver needs no new verification style.
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4002';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface ConnectionInfo {
  webhookUrl: string | null;
  webhookEvents: string[];
}

const cache = new Map<string, { info: ConnectionInfo | null; expiresAt: number }>();

async function lookupConnection(storeId: string): Promise<ConnectionInfo | null> {
  const cached = cache.get(storeId);
  if (cached && cached.expiresAt > Date.now()) return cached.info;

  let info: ConnectionInfo | null = null;
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/integrations/internal/connections/${storeId}`);
    if (response.ok) {
      const data = (await response.json()) as { success: boolean; webhookUrl: string | null; webhookEvents: string[] };
      info = { webhookUrl: data.webhookUrl, webhookEvents: data.webhookEvents ?? [] };
    }
  } catch {
    info = null;
  }

  cache.set(storeId, { info, expiresAt: Date.now() + CACHE_TTL_MS });
  return info;
}

// Fire-and-forget by design (same pattern as the existing Meta CAPI dispatch
// in storefrontRoutes.ts) — a slow or unreachable partner webhook must never
// block or fail the merchant's own request.
export function dispatchIntegrationWebhook(storeId: ObjectId | string, event: string, data: unknown): void {
  const id = storeId.toString();
  lookupConnection(id)
    .then((connection) => {
      if (!connection?.webhookUrl || !connection.webhookEvents.includes(event)) return;
      const secret = process.env.ZETSITE_WEBHOOK_SECRET;
      if (!secret) return;

      const body = JSON.stringify({ event, storeId: id, data });
      const signature = crypto.createHmac('sha256', secret).update(body).digest('base64');

      return fetch(connection.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-ZetSite-Hmac-Sha256': signature },
        body,
      }).catch(() => {});
    })
    .catch(() => {});
}
