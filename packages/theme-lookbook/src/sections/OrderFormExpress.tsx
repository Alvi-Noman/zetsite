import { useState } from 'react';
import { X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { useOrderForm, money } from './useOrderForm.js';

export interface OrderFormExpressSettings {
  productId: string;
}

export const orderFormExpressSchema: SectionSchema = {
  type: 'orderFormExpress',
  label: 'Order form (express modal)',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Complete your order', size: 'md' } }],
  fields: [{ key: 'productId', type: 'product', label: 'Product', default: '', tab: 'content' }],
  defaultSettings: { productId: '' },
};

export function OrderFormExpress({ settings, storeSlug, renderBlocks }: SectionComponentProps<OrderFormExpressSettings>) {
  const f = useOrderForm(storeSlug, settings.productId);
  const [open, setOpen] = useState(false);

  return (
    <section id="order" className="mx-auto max-w-md px-4 py-12 text-center">
      <div className="mb-4">{renderBlocks?.((b) => b.type === 'heading')}</div>
      {f.product ? (
        <p className="mb-4 text-2xl font-black text-neutral-900">{money(f.currency, f.price)}</p>
      ) : null}
      {f.hasVariants && f.product!.variants.length > 1 ? (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {f.product!.variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => f.setVariantIndex(i)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${i === f.variantIndex ? 'border-yellow-700 bg-yellow-700 text-white' : 'border-neutral-300 text-neutral-700'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        disabled={f.outOfStock}
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-yellow-700 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {f.outOfStock ? 'Out of stock' : 'Buy now'}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Complete your order</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-neutral-400 hover:text-neutral-900">
                <X size={18} />
              </button>
            </div>
            {f.status === 'sent' ? (
              <p className="rounded-lg border border-yellow-100 bg-yellow-50 px-4 py-6 text-center text-sm font-semibold text-yellow-800">
                {f.checkout?.successMessage || "Order received — we'll be in touch to confirm."}
              </p>
            ) : (
              <form onSubmit={f.handleSubmit} className="space-y-3">
                <input required placeholder="Full name" value={f.name} onChange={(e) => f.setName(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
                <input required type="tel" placeholder="Phone number" value={f.phone} onChange={(e) => f.setPhone(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
                <textarea required rows={2} placeholder="Delivery address" value={f.address} onChange={(e) => f.setAddress(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
                <p className="text-xs text-neutral-500">
                  Total: {money(f.currency, f.total)}
                  {f.variant ? ` · ${f.variant.label}` : ''} · {f.checkout?.codLabel || 'Cash on delivery'}
                </p>
                {f.status === 'error' && f.error ? <p className="text-sm font-medium text-yellow-700">{f.error}</p> : null}
                <button
                  type="submit"
                  disabled={f.status === 'submitting' || f.outOfStock}
                  className="w-full rounded-md bg-yellow-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-800 disabled:opacity-60"
                >
                  {f.outOfStock ? 'Out of stock' : f.status === 'submitting' ? 'Placing order…' : f.checkout?.submitButtonText || 'Place order'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
