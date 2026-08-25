// Server-side leg of Meta's dual Pixel + Conversions API tracking
// (https://developers.facebook.com/docs/marketing-api/conversions-api). Meta
// itself recommends running both: the browser pixel for fast client-side
// signal, and this server call so events survive ad blockers / ITP cookie
// loss, deduplicated against the browser event via a shared `event_id`. This
// posts directly to the Graph API — no SDK dependency needed for a handful
// of fields.
import { createHash } from 'node:crypto';
import type { Request } from 'express';
import type { PixelSettings } from '../routes/pixelSettingsRoutes.js';

const GRAPH_API_VERSION = 'v21.0';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// Meta requires email/phone hashed as normalized lowercase (email) or
// digits-only (phone) SHA-256 — un-normalized hashes just fail to match.
function hashEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  return normalized ? sha256(normalized) : null;
}

function hashPhone(phone: string): string | null {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits ? sha256(digits) : null;
}

function clientIp(req: Request): string | undefined {
  // Trust the leftmost X-Forwarded-For hop (set by our own Caddy/nginx edge)
  // over req.ip, which can resolve to the proxy's address in this topology.
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return first?.trim() || req.ip;
}

export type CapiEventName = 'AddToCart' | 'ViewContent' | 'InitiateCheckout' | 'Purchase';

export interface CapiEventInput {
  eventName: CapiEventName;
  eventId: string;
  eventSourceUrl: string;
  value: number;
  currency: string;
  contentIds: string[];
  numItems: number;
  customerPhone?: string;
  customerEmail?: string;
}

// Fire-and-forget: tracking should never fail or slow down the request it's
// attached to, so callers should not await this on the critical path
// (log-and-continue instead).
export async function sendCapiEvent(settings: PixelSettings, req: Request, input: CapiEventInput): Promise<void> {
  if (!settings.enabled || !settings.pixelId || !settings.capiAccessToken) return;

  const userData: Record<string, unknown> = {
    client_ip_address: clientIp(req),
    client_user_agent: req.headers['user-agent'],
  };
  const fbp = req.cookies?._fbp;
  const fbc = req.cookies?._fbc;
  if (typeof fbp === 'string' && fbp) userData.fbp = fbp;
  if (typeof fbc === 'string' && fbc) userData.fbc = fbc;
  if (input.customerEmail) {
    const hashed = hashEmail(input.customerEmail);
    if (hashed) userData.em = [hashed];
  }
  if (input.customerPhone) {
    const hashed = hashPhone(input.customerPhone);
    if (hashed) userData.ph = [hashed];
  }

  const body = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: input.currency,
          value: input.value,
          content_ids: input.contentIds,
          content_type: 'product',
          num_items: input.numItems,
        },
      },
    ],
    ...(settings.testEventCode ? { test_event_code: settings.testEventCode } : {}),
  };

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${settings.pixelId}/events?access_token=${encodeURIComponent(settings.capiAccessToken)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[metaCapi] ${input.eventName} event rejected (${res.status}): ${text}`);
    }
  } catch (err) {
    console.error(`[metaCapi] ${input.eventName} event request failed:`, err);
  }
}
