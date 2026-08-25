// Client half of Meta's dual Pixel + Conversions API tracking (server half:
// services/api-service/src/utils/metaCapi.ts). Lives in theme-kit rather
// than the storefront app because ProductOrderPanel — the one buy-form
// shared by every theme — needs to fire ViewContent/InitiateCheckout here
// too; keeping a single module means all four event types share the same
// init/queue state instead of racing across separate copies.
declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; callMethod?: unknown };
    _fbq?: unknown;
  }
}

let initialized = false;
// App.tsx's pixel-settings fetch and a page's own event calls (e.g.
// OrderConfirmationPage's Purchase, ProductOrderPanel's ViewContent) race
// independently — a call arriving before init completes queues here instead
// of being silently dropped, and flushes once initMetaPixel runs. If the
// store has no pixel configured at all, initMetaPixel never runs and this
// queue is simply never flushed, which is correct (no pixel to send to).
let pendingCalls: (() => void)[] = [];

export function initMetaPixel(pixelId: string) {
  if (initialized || !pixelId || typeof window === 'undefined') return;
  initialized = true;

  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode!.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq!('init', pixelId);
  window.fbq!('track', 'PageView');

  const queued = pendingCalls;
  pendingCalls = [];
  queued.forEach((call) => call());
}

function callOrQueue(fire: () => void) {
  if (typeof window === 'undefined') return;
  if (!initialized || !window.fbq) {
    pendingCalls.push(fire);
    return;
  }
  fire();
}

// Call on every client-side route change once the pixel is initialized — the
// snippet above only fires the first PageView automatically.
export function trackPixelPageView() {
  callOrQueue(() => window.fbq!('track', 'PageView'));
}

// `eventId` must match the id sent server-side to metaCapi.ts's
// sendCapiEvent so Meta deduplicates the browser and server events into a
// single conversion instead of double-counting.
export function trackPixelViewContent(eventId: string, contentId: string, value: number, currency: string) {
  callOrQueue(() =>
    window.fbq!(
      'track',
      'ViewContent',
      { content_ids: [contentId], content_type: 'product', value, currency },
      { eventID: eventId },
    ),
  );
}

// Single-page landing funnels have no literal cart — the industry-standard
// substitute is firing AddToCart on the "Order now"/"Buy now" CTA click that
// scrolls the shopper down to the order form, since that's the first
// deliberate "I want this" action in the funnel.
export function trackPixelAddToCart(eventId: string, contentId: string, value: number, currency: string) {
  callOrQueue(() =>
    window.fbq!(
      'track',
      'AddToCart',
      { content_ids: [contentId], content_type: 'product', value, currency },
      { eventID: eventId },
    ),
  );
}

export function trackPixelInitiateCheckout(
  eventId: string,
  contentId: string,
  value: number,
  currency: string,
  numItems: number,
) {
  callOrQueue(() =>
    window.fbq!(
      'track',
      'InitiateCheckout',
      { content_ids: [contentId], content_type: 'product', value, currency, num_items: numItems },
      { eventID: eventId },
    ),
  );
}

export function trackPixelPurchase(eventId: string, value: number, currency: string) {
  callOrQueue(() => window.fbq!('track', 'Purchase', { value, currency }, { eventID: eventId }));
}
