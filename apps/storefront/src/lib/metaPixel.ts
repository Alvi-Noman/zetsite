// Client half of Meta's dual Pixel + Conversions API tracking (server half:
// services/api-service/src/utils/metaCapi.ts). Kept separate from
// LandingPage.tsx's own inline injector since this one is store-wide,
// initialized once at the app root rather than per-page.
declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; callMethod?: unknown };
    _fbq?: unknown;
  }
}

let initialized = false;
// App.tsx's pixel-settings fetch and a page's own event calls (e.g.
// OrderConfirmationPage's Purchase) race independently — a call arriving
// before init completes queues here instead of being silently dropped, and
// flushes once initMetaPixel runs. If the store has no pixel configured at
// all, initMetaPixel never runs and this queue is simply never flushed,
// which is correct (no pixel to send to).
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

// Call on every client-side route change once the pixel is initialized — the
// snippet above only fires the first PageView automatically.
export function trackPixelPageView() {
  if (typeof window === 'undefined') return;
  if (!initialized || !window.fbq) {
    pendingCalls.push(trackPixelPageView);
    return;
  }
  window.fbq('track', 'PageView');
}

// `eventId` must match the order id sent server-side to metaCapi.ts's
// sendPurchaseCapiEvent so Meta deduplicates the browser and server events
// into a single conversion instead of double-counting the sale. Queued
// rather than dropped if the pixel hasn't finished initializing yet — a full
// page navigation to the confirmation page and its pixel-settings fetch race
// independently.
export function trackPixelPurchase(eventId: string, value: number, currency: string) {
  if (typeof window === 'undefined') return;
  if (!initialized || !window.fbq) {
    pendingCalls.push(() => trackPixelPurchase(eventId, value, currency));
    return;
  }
  window.fbq('track', 'Purchase', { value, currency }, { eventID: eventId });
}
