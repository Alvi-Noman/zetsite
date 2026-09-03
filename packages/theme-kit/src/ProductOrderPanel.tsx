import { useEffect, useRef, useState } from 'react';
import {
  fetchStorefrontCheckoutSettings,
  fetchStorefrontShippingSettings,
  submitStorefrontOrder,
  sendStorefrontPixelEvent,
  createIdempotencyKey,
  type StorefrontProduct,
  type StorefrontVariant,
  type CheckoutSettings,
  type ShippingSettings,
} from './api.js';
import { useAbandonedCheckoutDraft } from './useAbandonedCheckoutDraft.js';
import { trackPixelViewContent, trackPixelInitiateCheckout } from './metaPixel.js';

// Meta's pixel/CAPI value+currency fields want an ISO 4217 code, not the
// display symbol (e.g. "৳") stored in CheckoutSettings.currency — this
// storefront only ever prices in Taka today.
const PIXEL_CURRENCY = 'BDT';

function money(currency: string, value: number): string {
  return `${currency || '৳'}${value.toFixed(2)}`;
}

export interface ProductOrderPanelClassNames {
  /** Full class string for the primary submit/order button (bg, hover, rounding, weight, etc). */
  button: string;
  /** Text-color class for price emphasis, e.g. "text-emerald-700". */
  accentText: string;
  /** Full literal focus-state class for text inputs, e.g. "focus:border-emerald-600" — must be a
   * complete class string (not built by string interpolation) so Tailwind's content scanner in the
   * theme package that supplies it can see and generate it. */
  accentFocus: string;
}

export interface ProductOrderPanelProps {
  storeSlug: string;
  product: StorefrontProduct;
  variant: StorefrontVariant | undefined;
  variantIndex: number;
  classNames: ProductOrderPanelClassNames;
}

/**
 * The single real "buy" surface on a storefront product page — every theme's
 * ProductTemplate renders this in place of a plain, unwired "Order now"
 * button so the standard Home -> Collection -> Product browsing path has a
 * working checkout (previously only landing pages built with an OrderForm
 * section could actually take an order). Mirrors OrderForm.tsx's fields and
 * submission contract (variant-aware pricing/stock, idempotency key,
 * honeypot) so both entry points behave identically server-side.
 */
export function ProductOrderPanel({ storeSlug, product, variant, variantIndex, classNames }: ProductOrderPanelProps) {
  const [checkout, setCheckout] = useState<CheckoutSettings | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [shippingIndex, setShippingIndex] = useState(0);
  const [name, setNameState] = useState('');
  const [phone, setPhoneState] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddressState] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — real shoppers never see or fill this
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const idempotencyKeyRef = useRef(createIdempotencyKey());

  useEffect(() => {
    let cancelled = false;
    fetchStorefrontCheckoutSettings(storeSlug).then((c) => {
      if (!cancelled) setCheckout(c);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  useEffect(() => {
    let cancelled = false;
    fetchStorefrontShippingSettings(storeSlug).then((s) => {
      if (!cancelled) setShippingSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  // ViewContent — fired once per product page view, matching the id sent to
  // the server-side CAPI event below so Meta dedupes the two into one event.
  useEffect(() => {
    const eventId = createIdempotencyKey();
    const value = variant?.price ?? product.price ?? 0;
    trackPixelViewContent(eventId, product.id, value, PIXEL_CURRENCY);
    sendStorefrontPixelEvent(storeSlug, {
      eventName: 'ViewContent',
      eventId,
      contentIds: [product.id],
      value,
      numItems: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug, product.id]);

  const currency = checkout?.currency || '৳';
  const shippingOptions = shippingSettings?.options?.length ? shippingSettings.options : [{ label: 'Inside Dhaka', cost: 0 }];
  const hasVariants = product.variants.length > 0;
  const price = variant?.price ?? product.price ?? 0;
  const outOfStock = hasVariants && typeof variant?.available === 'number' && variant.available <= 0;
  const shipping = shippingOptions[shippingIndex] ?? shippingOptions[0];
  const subtotal = price * quantity;
  const total = subtotal + (shipping?.cost ?? 0);

  // InitiateCheckout — fired the moment the shopper starts filling in the
  // order form (first keystroke in any of name/phone/address), not on
  // submit. Someone who fills the form but abandons before submitting is a
  // valuable retargeting audience that a submit-time-only event would miss
  // entirely, so this fires as early as real purchase intent shows up.
  const checkoutStartedRef = useRef(false);
  function markCheckoutStarted() {
    if (checkoutStartedRef.current) return;
    checkoutStartedRef.current = true;
    const eventId = createIdempotencyKey();
    trackPixelInitiateCheckout(eventId, product.id, total, PIXEL_CURRENCY, quantity);
    sendStorefrontPixelEvent(storeSlug, {
      eventName: 'InitiateCheckout',
      eventId,
      contentIds: [product.id],
      value: total,
      numItems: quantity,
      customerPhone: phone,
    });
  }
  function setName(v: string) {
    markCheckoutStarted();
    setNameState(v);
  }
  function setPhone(v: string) {
    markCheckoutStarted();
    setPhoneState(v);
  }
  function setAddress(v: string) {
    markCheckoutStarted();
    setAddressState(v);
  }

  const { markConverted } = useAbandonedCheckoutDraft(storeSlug, {
    key: idempotencyKeyRef.current,
    productId: product.id,
    variantIndex: hasVariants ? variantIndex : null,
    quantity,
    name,
    phone,
    address,
    shippingLabel: shipping?.label ?? '',
    shippingCost: shipping?.cost ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (outOfStock) {
      setError('This item is out of stock.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setError('');
    const result = await submitStorefrontOrder(storeSlug, {
      productId: product.id,
      variantIndex: hasVariants ? variantIndex : null,
      quantity,
      name,
      phone,
      email,
      address,
      shippingLabel: shipping?.label ?? '',
      shippingCost: shipping?.cost ?? 0,
      idempotencyKey: idempotencyKeyRef.current,
      website,
    });
    if (result.ok && result.orderId) {
      markConverted();
      window.location.href = `/order-confirmed/${result.orderId}?store=${encodeURIComponent(storeSlug)}`;
    } else if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('error');
      setError(result.message ?? 'Could not place order. Please try again.');
    }
  }

  if (status === 'sent') {
    return (
      <p className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-6 text-center text-sm font-semibold text-neutral-800">
        {checkout?.successMessage || "Order received — we'll be in touch to confirm."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <input
        type="text"
        name="zts_hp_check"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none ${classNames.accentFocus}`}
        />
        <input
          required
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none ${classNames.accentFocus}`}
        />
      </div>
      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none ${classNames.accentFocus}`}
      />
      <textarea
        required
        rows={2}
        placeholder="Delivery address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className={`w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none ${classNames.accentFocus}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-md border border-neutral-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold text-neutral-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {shippingOptions.length > 1 ? (
          <select
            value={shippingIndex}
            onChange={(e) => setShippingIndex(Number(e.target.value))}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {shippingOptions.map((opt, i) => (
              <option key={i} value={i}>
                {opt.label} — {money(currency, opt.cost || 0)}
              </option>
            ))}
          </select>
        ) : null}

        <span className={`ml-auto text-sm font-bold ${classNames.accentText}`}>{money(currency, total)}</span>
      </div>

      <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600">
        {checkout?.codLabel || 'Cash on delivery'} — pay when your order arrives.
      </p>

      {status === 'error' && error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <button type="submit" disabled={status === 'submitting' || outOfStock} className={`w-full ${classNames.button}`}>
        {outOfStock ? 'Out of stock' : status === 'submitting' ? 'Placing order…' : checkout?.submitButtonText || 'Order now'}
      </button>
    </form>
  );
}
