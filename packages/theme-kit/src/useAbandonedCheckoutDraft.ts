import { useEffect, useRef } from 'react';

export interface AbandonedCheckoutDraft {
  key: string;
  productId: string;
  variantIndex: number | null;
  quantity: number;
  name: string;
  phone: string;
  address: string;
  shippingLabel: string;
  shippingCost: number;
}

const DEBOUNCE_MS = 1200;

function sendDraft(storeSlug: string, draft: AbandonedCheckoutDraft, useBeacon: boolean) {
  const url = `/api/v1/storefront/${storeSlug}/abandoned-checkout`;
  const body = JSON.stringify(draft);
  if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    // sendBeacon survives page teardown (back navigation, tab close) in a way
    // a normal fetch does not — the browser guarantees delivery even after
    // the page is gone, which is exactly the "went back without confirming"
    // case this exists to catch. It can only send POST, hence this endpoint
    // being POST rather than PUT despite being an upsert.
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    return;
  }
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}

/**
 * Tracks an in-progress checkout as an "abandoned checkout" draft once the
 * shopper has typed a phone number, so a merchant can follow up even if the
 * shopper leaves before placing the order. Saves are debounced on normal
 * edits and flushed immediately via sendBeacon when the tab is hidden or the
 * page is navigated away from (covers browser back, closing the tab, etc).
 *
 * Call `markConverted()` right when a real order submission succeeds, before
 * navigating to the confirmation page — otherwise the pagehide/visibility
 * flush that fires during that navigation would re-create the draft the
 * server just deleted.
 */
export function useAbandonedCheckoutDraft(storeSlug: string, draft: AbandonedCheckoutDraft) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const draftRef = useRef(draft);
  const convertedRef = useRef(false);
  draftRef.current = draft;

  useEffect(() => {
    if (convertedRef.current) return;
    if (!draft.phone.trim() || !draft.productId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!convertedRef.current) sendDraft(storeSlug, draftRef.current, false);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    storeSlug,
    draft.productId,
    draft.variantIndex,
    draft.quantity,
    draft.name,
    draft.phone,
    draft.address,
    draft.shippingLabel,
    draft.shippingCost,
  ]);

  useEffect(() => {
    function flush() {
      if (convertedRef.current) return;
      if (!draftRef.current.phone.trim() || !draftRef.current.productId) return;
      sendDraft(storeSlug, draftRef.current, true);
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') flush();
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [storeSlug]);

  return {
    markConverted: () => {
      convertedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    },
  };
}
