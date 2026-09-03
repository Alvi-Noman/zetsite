import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchStorefrontOrder,
  trackPixelPurchase,
  type StorefrontOrderConfirmation,
  type CheckoutSettings,
} from '@zetsite/theme-kit';

function money(currency: string, value: number): string {
  return `${currency || '৳'}${value.toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Estimated delivery is presentational only — no ETA is stored per order —
// so this gives shoppers a plausible COD delivery window without pretending
// to be a real carrier estimate tied to the chosen shipping option.
function estimatedDeliveryRange(createdAt: string): string {
  const start = new Date(createdAt);
  const from = new Date(start);
  from.setDate(from.getDate() + 3);
  const to = new Date(start);
  to.setDate(to.getDate() + 7);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(from)} – ${fmt(to)}`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OrderConfirmationPage({ storeSlug }: { storeSlug: string }) {
  const { orderId } = useParams<{ orderId: string }>();
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'error' } | { status: 'ready'; order: StorefrontOrderConfirmation; checkout: CheckoutSettings }
  >({ status: 'loading' });

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    fetchStorefrontOrder(storeSlug, orderId).then((data) => {
      if (cancelled) return;
      if (data) setState({ status: 'ready', order: data.order, checkout: data.checkout });
      else setState({ status: 'error' });
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, orderId]);

  // `eventId` = order.id, matching the id sent to Meta's Conversions API by
  // storefrontRoutes.ts's POST /:slug/orders handler, so both the browser
  // pixel and the server-side event dedupe into one Purchase conversion
  // instead of Meta double-counting the sale.
  const purchaseTracked = useRef(false);
  useEffect(() => {
    if (state.status !== 'ready' || purchaseTracked.current) return;
    purchaseTracked.current = true;
    trackPixelPurchase(state.order.id, state.order.total, 'BDT');
  }, [state]);

  if (state.status === 'loading') {
    return <div className="px-6 py-20 text-center text-neutral-400">Loading your order…</div>;
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-lg font-semibold text-neutral-900">We couldn't find that order</p>
        <p className="mt-2 text-sm text-neutral-500">
          The link may be incorrect, or the order may belong to a different store.
        </p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800">
          Continue shopping
        </Link>
      </div>
    );
  }

  const { order, checkout } = state;
  const currency = checkout.currency || '৳';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
          <CheckIcon />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-neutral-900 sm:text-3xl">Order confirmed</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {checkout.successMessage || "Thanks — we'll be in touch to confirm your order."}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-4 text-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Order number</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-neutral-900">#{order.id.slice(-8).toUpperCase()}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Order date</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Estimated delivery</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900">{estimatedDeliveryRange(order.createdAt)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-neutral-200">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="text-sm font-bold text-neutral-900">Order summary</h2>
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          {order.product.image ? (
            <img src={order.product.image} alt={order.product.title} className="h-16 w-16 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-md bg-neutral-100" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {order.product.title}
              {order.variantLabel ? <span className="font-normal text-neutral-500"> · {order.variantLabel}</span> : null}
            </p>
            <p className="text-xs text-neutral-500">Qty {order.quantity}</p>
          </div>
          <p className="text-sm font-semibold text-neutral-900">{money(currency, order.subtotal)}</p>
        </div>
        <dl className="space-y-2 border-t border-neutral-200 px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd className="font-medium text-neutral-900">{money(currency, order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Shipping ({order.shippingLabel || 'Standard delivery'})</dt>
            <dd className="font-medium text-neutral-900">{money(currency, order.shippingCost)}</dd>
          </div>
        </dl>
        <div className="flex justify-between border-t border-neutral-200 px-5 py-4">
          <p className="text-sm font-bold text-neutral-900">Total</p>
          <p className="text-base font-black text-neutral-900">{money(currency, order.total)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 px-5 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-500">Delivery details</h3>
          <p className="mt-2 text-sm font-semibold text-neutral-900">{order.customer.name}</p>
          <p className="text-sm text-neutral-600">{order.customer.phone}</p>
          {order.customer.email ? <p className="text-sm text-neutral-600">{order.customer.email}</p> : null}
          <p className="mt-1 text-sm text-neutral-600">{order.customer.address}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 px-5 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-500">Payment method</h3>
          <p className="mt-2 text-sm font-semibold text-neutral-900">{checkout.codLabel || 'Cash on delivery'}</p>
          <p className="mt-1 text-sm text-neutral-600">Pay when your order arrives.</p>
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-neutral-50 px-5 py-4 text-sm text-neutral-600">
        <span className="font-semibold text-neutral-900">What happens next: </span>
        we'll call {order.customer.phone} to confirm your order before it ships. Keep an eye on your phone.
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-block rounded-md bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
