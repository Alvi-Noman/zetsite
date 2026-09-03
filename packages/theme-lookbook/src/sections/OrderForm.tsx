import { useEffect, useRef, useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  fetchStorefrontProduct,
  fetchStorefrontCheckoutSettings,
  fetchStorefrontShippingSettings,
  submitStorefrontOrder,
  sendStorefrontPixelEvent,
  trackPixelViewContent,
  trackPixelInitiateCheckout,
  createIdempotencyKey,
  useAbandonedCheckoutDraft,
  ResponsiveImage,
  type StorefrontProduct,
  type CheckoutSettings,
  type ShippingSettings,
} from '@zetsite/theme-kit';

// Meta's pixel/CAPI value+currency fields want an ISO 4217 code, not the
// display symbol (e.g. "৳") CheckoutSettings.currency holds — this
// storefront only ever prices in Taka today.
const PIXEL_CURRENCY = 'BDT';

export interface OrderFormSettings {
  productId: string;
}

// Everything about this form besides *which product* it's for — currency,
// shipping rates, COD wording, the submit button label, the success message
// — comes from the store's single global checkout configuration (Storefront
// → Checkout in the builder), not from per-section settings. Every landing
// page shares the same checkout, edited in exactly one place.
export const orderFormSchema: SectionSchema = {
  type: 'orderForm',
  label: 'Order form',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Complete your order', size: 'md' } }],
  fields: [
    // Value is a product *handle* — same convention PickerField/FeaturedCollection
    // use for the 'product'/'collection' field types (see FieldRow.tsx).
    { key: 'productId', type: 'product', label: 'Product', default: '', tab: 'content' },
  ],
  defaultSettings: { productId: '' },
};

function money(currency: string, value: number): string {
  return `${currency || '৳'}${value.toFixed(2)}`;
}

export function OrderForm({ settings, storeSlug, renderBlocks }: SectionComponentProps<OrderFormSettings>) {
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [checkout, setCheckout] = useState<CheckoutSettings | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [variantIndex, setVariantIndex] = useState(0);
  const [shippingIndex, setShippingIndex] = useState(0);
  const [name, setNameState] = useState('');
  const [phone, setPhoneState] = useState('');
  const [email, setEmailState] = useState('');
  const [address, setAddressState] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — real shoppers never see or fill this
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const idempotencyKeyRef = useRef(createIdempotencyKey());

  useEffect(() => {
    let cancelled = false;
    if (!settings.productId) {
      setProduct(null);
      return;
    }
    fetchStorefrontProduct(storeSlug, settings.productId).then((p) => {
      if (!cancelled) setProduct(p);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, settings.productId]);

  useEffect(() => {
    setVariantIndex(0);
  }, [product?.id]);

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

  // ViewContent — fired once the product resolves, matching the id sent to
  // the server-side CAPI event so Meta dedupes the two into one event.
  useEffect(() => {
    if (!product) return;
    const eventId = createIdempotencyKey();
    const value = product.price ?? 0;
    trackPixelViewContent(eventId, product.id, value, PIXEL_CURRENCY);
    sendStorefrontPixelEvent(storeSlug, {
      eventName: 'ViewContent',
      eventId,
      contentIds: [product.id],
      value,
      numItems: 1,
    });
  }, [storeSlug, product?.id]);

  const currency = checkout?.currency || '৳';
  const shippingOptions = shippingSettings?.options?.length ? shippingSettings.options : [{ label: 'Inside Dhaka', cost: 0 }];
  const hasVariants = !!product?.variants?.length;
  const variant = hasVariants ? product!.variants[variantIndex] : undefined;
  const price = variant?.price ?? product?.price ?? 0;
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
    if (checkoutStartedRef.current || !product) return;
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
  function setEmail(v: string) {
    markCheckoutStarted();
    setEmailState(v);
  }
  function setAddress(v: string) {
    markCheckoutStarted();
    setAddressState(v);
  }

  const { markConverted } = useAbandonedCheckoutDraft(storeSlug, {
    key: idempotencyKeyRef.current,
    productId: product?.id ?? '',
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
    if (!product) {
      setError('This product is unavailable right now.');
      setStatus('error');
      return;
    }
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
      <section id="order" className="mx-auto max-w-3xl px-4 py-12">
        <p className="rounded-lg border border-yellow-100 bg-yellow-50 px-6 py-8 text-center text-sm font-semibold text-yellow-800">
          {checkout?.successMessage || "Order received — we'll be in touch to confirm."}
        </p>
      </section>
    );
  }

  return (
    <section id="order" className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-4 lg:col-span-3">
          {/* Honeypot: hidden from real shoppers via CSS + tabIndex, only a bot filling every field blindly will populate it. */}
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

          {hasVariants && product!.variants.length > 1 ? (
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Options</span>
              <div className="flex flex-wrap gap-2">
                {product!.variants.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setVariantIndex(i)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      i === variantIndex ? 'border-yellow-700 bg-yellow-700 text-white' : 'border-neutral-300 text-neutral-700'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              {outOfStock ? <p className="mt-1.5 text-xs font-medium text-yellow-700">Out of stock</p> : null}
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Phone number</span>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none"
            />
          </label>
          {checkout?.collectEmail ? (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-neutral-600">Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none"
              />
            </label>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Delivery address</span>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none"
            />
          </label>

          <div>
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Quantity</span>
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
          </div>

          {shippingOptions.length > 0 ? (
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Shipping</span>
              <div className="space-y-2">
                {shippingOptions.map((opt, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-sm ${
                      i === shippingIndex ? 'border-yellow-600 bg-yellow-50' : 'border-neutral-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        checked={i === shippingIndex}
                        onChange={() => setShippingIndex(i)}
                      />
                      {opt.label}
                    </span>
                    <span className="font-semibold text-neutral-900">{money(currency, opt.cost || 0)}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600">
            {checkout?.codLabel || 'Cash on delivery'} — pay when your order arrives.
          </p>

          {status === 'error' && error ? <p className="text-sm font-medium text-yellow-700">{error}</p> : null}

          <button
            type="submit"
            disabled={status === 'submitting' || outOfStock}
            className="w-full rounded-md bg-yellow-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-800 disabled:opacity-60"
          >
            {outOfStock ? 'Out of stock' : status === 'submitting' ? 'Placing order…' : checkout?.submitButtonText || 'Place order'}
          </button>
        </form>

        <div className="min-w-0 lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="mb-4 text-sm font-bold text-neutral-900">Order summary</h3>
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
              {product?.media?.[0]?.url ? (
                <ResponsiveImage
                  src={product.media[0].url}
                  alt={product.title}
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-md bg-neutral-200" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {product?.title ?? 'Select a product for this section'}
                  {variant ? <span className="font-normal text-neutral-500"> · {variant.label}</span> : null}
                </p>
                {product ? (
                  <p className="text-xs text-neutral-500">
                    {product.compareAtPrice != null && product.compareAtPrice > price ? (
                      <span className="mr-1.5 line-through">{money(currency, product.compareAtPrice)}</span>
                    ) : null}
                    {money(currency, price)} each
                  </p>
                ) : null}
              </div>
            </div>
            <dl className="space-y-2 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal ({quantity}x)</dt>
                <dd className="font-medium text-neutral-900">{money(currency, subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Shipping ({shipping?.label ?? '—'})</dt>
                <dd className="font-medium text-neutral-900">{money(currency, shipping?.cost ?? 0)}</dd>
              </div>
            </dl>
            <div className="flex justify-between border-t border-neutral-200 pt-4">
              <dt className="text-sm font-bold text-neutral-900">Total</dt>
              <dd className="text-lg font-black text-yellow-700">{money(currency, total)}</dd>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
