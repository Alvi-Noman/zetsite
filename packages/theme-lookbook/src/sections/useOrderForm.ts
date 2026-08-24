import { useEffect, useRef, useState } from 'react';
import {
  fetchStorefrontProduct,
  fetchStorefrontCheckoutSettings,
  fetchStorefrontShippingSettings,
  submitStorefrontOrder,
  createIdempotencyKey,
  useAbandonedCheckoutDraft,
  type StorefrontProduct,
  type CheckoutSettings,
  type ShippingSettings,
} from '@zetsite/theme-kit';

export function money(currency: string, value: number): string {
  return `${currency || '$'}${value.toFixed(2)}`;
}

// Shared by every Order form design variant — currency, shipping, COD label,
// submit text, and success message always come from the store's global
// checkout settings, and the product is always live-linked via productId.
// Every design variant must use this hook rather than re-implementing it, so
// that global checkout settings stay the single source of truth everywhere.
export function useOrderForm(storeSlug: string, productId: string) {
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [checkout, setCheckout] = useState<CheckoutSettings | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [variantIndex, setVariantIndex] = useState(0);
  const [shippingIndex, setShippingIndex] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — real shoppers never see or fill this
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  // Stable across retries of the same submission attempt so a resubmit
  // (double-click, back/forward) replays the original order server-side
  // instead of creating a duplicate.
  const idempotencyKeyRef = useRef(createIdempotencyKey());

  useEffect(() => {
    let cancelled = false;
    if (!productId) {
      setProduct(null);
      return;
    }
    fetchStorefrontProduct(storeSlug, productId).then((p) => {
      if (!cancelled) setProduct(p);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, productId]);

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

  const currency = checkout?.currency || '$';
  const shippingOptions = shippingSettings?.options?.length ? shippingSettings.options : [{ label: 'Inside Dhaka', cost: 0 }];
  const hasVariants = !!product?.variants?.length;
  const variant = hasVariants ? product!.variants[variantIndex] : undefined;
  const price = variant?.price ?? product?.price ?? 0;
  const outOfStock = hasVariants && typeof variant?.available === 'number' && variant.available <= 0;
  const shipping = shippingOptions[shippingIndex] ?? shippingOptions[0];
  const subtotal = price * quantity;
  const total = subtotal + (shipping?.cost ?? 0);

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

  return {
    product,
    checkout,
    quantity,
    setQuantity,
    hasVariants,
    variant,
    variantIndex,
    setVariantIndex,
    outOfStock,
    shippingIndex,
    setShippingIndex,
    name,
    setName,
    phone,
    setPhone,
    address,
    setAddress,
    website,
    setWebsite,
    status,
    error,
    currency,
    shippingOptions,
    price,
    shipping,
    subtotal,
    total,
    handleSubmit,
  };
}
