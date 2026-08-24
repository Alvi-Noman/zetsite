import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { useOrderForm, money } from './useOrderForm.js';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface OrderFormStepsSettings {
  productId: string;
}

export const orderFormStepsSchema: SectionSchema = {
  type: 'orderFormSteps',
  label: 'Order form (two-step)',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Complete your order', size: 'md' } }],
  fields: [{ key: 'productId', type: 'product', label: 'Product', default: '', tab: 'content' }],
  defaultSettings: { productId: '' },
};

export function OrderFormSteps({ settings, storeSlug, renderBlocks }: SectionComponentProps<OrderFormStepsSettings>) {
  const f = useOrderForm(storeSlug, settings.productId);
  const [step, setStep] = useState<1 | 2>(1);

  if (f.status === 'sent') {
    return (
      <section id="order" className="mx-auto max-w-lg px-4 py-12">
        <p className="rounded-lg border border-yellow-100 bg-yellow-50 px-6 py-8 text-center text-sm font-semibold text-yellow-800">
          {f.checkout?.successMessage || "Order received — we'll be in touch to confirm."}
        </p>
      </section>
    );
  }

  return (
    <section id="order" className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-6">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400">
        <span className={step === 1 ? 'text-neutral-900' : ''}>1. Product</span>
        <span>—</span>
        <span className={step === 2 ? 'text-neutral-900' : ''}>2. Delivery</span>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3">
            {f.product?.media?.[0]?.url ? (
              <ResponsiveImage src={f.product.media[0].url} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-md bg-neutral-200" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{f.product?.title ?? 'Select a product'}</p>
              <p className="text-xs text-neutral-500">
                {money(f.currency, f.price)} each
                {f.outOfStock ? <span className="ml-1.5 font-semibold text-yellow-700">Out of stock</span> : null}
              </p>
            </div>
          </div>
          {f.hasVariants && f.product!.variants.length > 1 ? (
            <div>
              <span className="mb-1 block text-xs font-semibold text-neutral-600">Options</span>
              <div className="flex flex-wrap gap-2">
                {f.product!.variants.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => f.setVariantIndex(i)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${i === f.variantIndex ? 'border-yellow-700 bg-yellow-700 text-white' : 'border-neutral-300 text-neutral-700'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div>
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Quantity</span>
            <div className="inline-flex items-center rounded-md border border-neutral-300">
              <button type="button" onClick={() => f.setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">−</button>
              <span className="w-10 text-center text-sm font-semibold text-neutral-900">{f.quantity}</span>
              <button type="button" onClick={() => f.setQuantity((q) => Math.min(99, q + 1))} className="px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">+</button>
            </div>
          </div>
          <div className="space-y-2">
            {f.shippingOptions.map((opt, i) => (
              <label key={i} className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-sm ${i === f.shippingIndex ? 'border-yellow-600 bg-yellow-50' : 'border-neutral-300'}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="shipping" checked={i === f.shippingIndex} onChange={() => f.setShippingIndex(i)} />
                  {opt.label}
                </span>
                <span className="font-semibold text-neutral-900">{money(f.currency, opt.cost || 0)}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={f.outOfStock}
            onClick={() => setStep(2)}
            className="w-full rounded-md bg-yellow-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {f.outOfStock ? 'Out of stock' : `Continue — ${money(f.currency, f.total)}`}
          </button>
        </div>
      ) : (
        <form onSubmit={f.handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Full name</span>
            <input required value={f.name} onChange={(e) => f.setName(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Phone number</span>
            <input required type="tel" value={f.phone} onChange={(e) => f.setPhone(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Delivery address</span>
            <textarea required rows={3} value={f.address} onChange={(e) => f.setAddress(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
          </label>
          <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600">
            {f.checkout?.codLabel || 'Cash on delivery'} — pay when your order arrives.
          </p>
          {f.status === 'error' && f.error ? <p className="text-sm font-medium text-yellow-700">{f.error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="rounded-md border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
              Back
            </button>
            <button
              type="submit"
              disabled={f.status === 'submitting' || f.outOfStock}
              className="flex-1 rounded-md bg-yellow-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-800 disabled:opacity-60"
            >
              {f.outOfStock ? 'Out of stock' : f.status === 'submitting' ? 'Placing order…' : f.checkout?.submitButtonText || 'Place order'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
