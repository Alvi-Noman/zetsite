import type { PageMeta, PageSection } from '@zetsite/shared';

export interface StorefrontVariant {
  label: string;
  values: string[];
  price?: number;
  sku?: string;
  available: number;
  image?: string | null;
}

export interface StorefrontProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  media: { url: string; type: string; name?: string }[];
  price?: number;
  compareAtPrice?: number;
  variants: StorefrontVariant[];
  collections: string[];
}

export interface StorefrontCollection {
  id: string;
  name: string;
  handle: string;
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, { credentials: 'omit' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Used when the storefront is loaded from a hostname that isn't a
// `*.<rootDomain>` subdomain — i.e. a merchant's connected custom domain —
// since the store slug can't be read off an arbitrary hostname the way it
// can off a subdomain.
export async function fetchStoreSlugByHost(host: string): Promise<string | null> {
  const data = await get<{ success: boolean; slug: string }>(
    `/api/v1/storefront/resolve-domain?host=${encodeURIComponent(host)}`,
  );
  return data?.slug ?? null;
}

export async function fetchStorefrontProducts(storeSlug: string): Promise<StorefrontProduct[]> {
  const data = await get<{ success: boolean; products: StorefrontProduct[] }>(
    `/api/v1/storefront/${storeSlug}/products`,
  );
  return data?.products ?? [];
}

export async function fetchStorefrontCollection(
  storeSlug: string,
  handle: string,
): Promise<{ collection: StorefrontCollection; products: StorefrontProduct[] } | null> {
  if (!handle) return null;
  const data = await get<{
    success: boolean;
    collection: StorefrontCollection;
    products: StorefrontProduct[];
  }>(`/api/v1/storefront/${storeSlug}/collections/${handle}`);
  if (!data) return null;
  return { collection: data.collection, products: data.products };
}

export async function fetchStorefrontCollections(storeSlug: string): Promise<StorefrontCollection[]> {
  const data = await get<{ success: boolean; collections: StorefrontCollection[] }>(
    `/api/v1/storefront/${storeSlug}/collections`,
  );
  return data?.collections ?? [];
}

export interface PreviewPageResponse {
  page: string;
  sections: PageSection[];
  meta: PageMeta | null;
  themeId: string;
}

export async function fetchPreviewPage(
  storeSlug: string,
  page: string,
  token: string,
): Promise<PreviewPageResponse | null> {
  return get<PreviewPageResponse>(`/api/v1/storefront/${storeSlug}/preview/${page}?token=${encodeURIComponent(token)}`);
}

export async function fetchStorefrontThemeId(storeSlug: string): Promise<string> {
  const data = await get<{ success: boolean; themeId: string }>(`/api/v1/storefront/${storeSlug}/theme`);
  return data?.themeId ?? 'minimal';
}

export async function fetchStorefrontProduct(
  storeSlug: string,
  handle: string,
): Promise<StorefrontProduct | null> {
  const data = await get<{ success: boolean; product: StorefrontProduct }>(
    `/api/v1/storefront/${storeSlug}/products/${handle}`,
  );
  return data?.product ?? null;
}

export async function submitStorefrontForm(
  storeSlug: string,
  formName: string,
  fields: Record<string, string>,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/storefront/${storeSlug}/form-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formName, fields }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * The one, store-wide checkout configuration every landing page's order
 * form reads from — edited once in the builder's Settings > Checkout page
 * (see checkoutSettingsRoutes.ts), never per-page or per-theme. Delivery
 * zones/rates live separately in ShippingSettings (Settings > Shipping and
 * delivery) rather than here, matching Shopify's own split.
 */
export interface CheckoutSettings {
  currency: string;
  codLabel: string;
  submitButtonText: string;
  successMessage: string;
}

const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  currency: '৳',
  codLabel: 'Cash on delivery',
  submitButtonText: 'Place order',
  successMessage: "Order received — we'll be in touch to confirm.",
};

export async function fetchStorefrontCheckoutSettings(storeSlug: string): Promise<CheckoutSettings> {
  const data = await get<{ success: boolean; settings: CheckoutSettings }>(
    `/api/v1/storefront/${storeSlug}/checkout-settings`,
  );
  return data?.settings ?? DEFAULT_CHECKOUT_SETTINGS;
}

export interface ShippingOption {
  label: string;
  cost: number;
}

/**
 * The one, store-wide set of delivery zones/rates every checkout surface
 * reads from — edited once in the builder's Settings > Shipping and
 * delivery page (see shippingSettingsRoutes.ts). Defaults to "Inside Dhaka" /
 * "Outside Dhaka" (the two zones nearly every Bangladesh COD store prices
 * delivery by) until a merchant customizes it.
 */
export interface ShippingSettings {
  options: ShippingOption[];
}

const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  options: [
    { label: 'Inside Dhaka', cost: 0 },
    { label: 'Outside Dhaka', cost: 0 },
  ],
};

export async function fetchStorefrontShippingSettings(storeSlug: string): Promise<ShippingSettings> {
  const data = await get<{ success: boolean; settings: ShippingSettings }>(
    `/api/v1/storefront/${storeSlug}/shipping-settings`,
  );
  return data?.settings ?? DEFAULT_SHIPPING_SETTINGS;
}

export interface StorefrontPixelSettings {
  enabled: boolean;
  pixelId: string;
}

const DEFAULT_PIXEL_SETTINGS: StorefrontPixelSettings = { enabled: false, pixelId: '' };

// Store-wide Meta Pixel id, used by App.tsx to inject the base fbq('init')
// + PageView tag across Home/Product/Collection/order-confirmation pages
// (landing pages use their own per-page pixel override instead — see
// LandingPage.tsx). The matching server-side Conversions API access token
// never appears here — it's read directly from the database by api-service.
export async function fetchStorefrontPixelSettings(storeSlug: string): Promise<StorefrontPixelSettings> {
  const data = await get<{ success: boolean; pixel: StorefrontPixelSettings }>(
    `/api/v1/storefront/${storeSlug}/pixel-settings`,
  );
  return data?.pixel ?? DEFAULT_PIXEL_SETTINGS;
}

// Server-side leg for the two funnel events fired ahead of Purchase —
// ViewContent (product page view) and InitiateCheckout (order form
// submitted) — sent alongside the matching client-side fbq() call in
// metaPixel.ts so both dedupe into one event via the shared eventId. Fired
// without awaiting by callers; failures are swallowed by the endpoint
// itself, never surfaced to the shopper.
export async function sendStorefrontPixelEvent(
  storeSlug: string,
  input: {
    eventName: 'AddToCart' | 'ViewContent' | 'InitiateCheckout';
    eventId: string;
    contentIds: string[];
    value: number;
    numItems: number;
    customerPhone?: string;
  },
): Promise<void> {
  try {
    await fetch(`/api/v1/storefront/${storeSlug}/pixel-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    /* best-effort — a dropped tracking call should never surface to the shopper */
  }
}

export interface StorefrontOrderPayload {
  productId: string;
  variantIndex?: number | null;
  landingPageId?: string | null;
  quantity: number;
  name: string;
  phone: string;
  address: string;
  shippingLabel: string;
  shippingCost: number;
  // Stable per-submission key so a retried request (double-click, browser
  // back/forward, flaky network) replays the original order instead of
  // creating a duplicate. Generate once per form attempt and reuse it across
  // retries of that same attempt.
  idempotencyKey: string;
  // Hidden honeypot field — must stay empty; only a bot filling every input
  // blindly would populate it.
  website?: string;
}

export async function submitStorefrontOrder(
  storeSlug: string,
  payload: StorefrontOrderPayload,
): Promise<{ ok: boolean; message?: string; orderId?: string }> {
  try {
    const res = await fetch(`/api/v1/storefront/${storeSlug}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) return { ok: true, orderId: data?.orderId };
    return { ok: false, message: data?.message ?? 'Could not place order' };
  } catch {
    return { ok: false, message: 'Could not place order' };
  }
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface StorefrontOrderConfirmation {
  id: string;
  product: { title: string; handle: string; image: string | null };
  variantLabel: string | null;
  quantity: number;
  customer: { name: string; phone: string; address: string };
  shippingLabel: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  status: 'new' | 'confirmed' | 'shipped' | 'cancelled';
  createdAt: string;
}

export async function fetchStorefrontOrder(
  storeSlug: string,
  orderId: string,
): Promise<{ order: StorefrontOrderConfirmation; checkout: CheckoutSettings } | null> {
  const data = await get<{ success: boolean; order: StorefrontOrderConfirmation; checkout: CheckoutSettings }>(
    `/api/v1/storefront/${storeSlug}/orders/${orderId}`,
  );
  if (!data) return null;
  return { order: data.order, checkout: data.checkout };
}
