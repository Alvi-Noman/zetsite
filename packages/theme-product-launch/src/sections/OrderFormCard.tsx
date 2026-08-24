import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { useOrderForm, money } from './useOrderForm.js';

export interface OrderFormCardSettings {
  productId: string;
}

export const orderFormCardSchema: SectionSchema = {
  type: 'orderFormCard',
  label: 'Order form (card)',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Complete your order', size: 'md' } }],
  fields: [{ key: 'productId', type: 'product', label: 'Product', default: '', tab: 'content' }],
  defaultSettings: { productId: '' },
};

export function OrderFormCard({ settings, storeSlug, renderBlocks }: SectionComponentProps<OrderFormCardSettings>) {
  const f = useOrderForm(storeSlug, settings.productId);

  return (
    <section id="order" className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div className="mb-4 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
        {f.status === 'sent' ? (
          <p className="rounded-lg border border-yellow-100 bg-yellow-50 px-6 py-8 text-center text-sm font-semibold text-yellow-800">
            {f.checkout?.successMessage || "Order received — we'll be in touch to confirm."}
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2.5">
              <span className="truncate text-sm font-semibold text-neutral-900">
                {f.product?.title ?? 'Select a product'}
                {f.variant ? <span className="font-normal text-neutral-500"> · {f.variant.label}</span> : null}
              </span>
              <span className="text-sm font-bold text-neutral-900">{money(f.currency, f.total)}</span>
            </div>
            {f.hasVariants && f.product!.variants.length > 1 ? (
              <div className="mb-3 flex flex-wrap gap-2">
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
            <form onSubmit={f.handleSubmit} className="space-y-3">
              <input required placeholder="Full name" value={f.name} onChange={(e) => f.setName(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
              <input required type="tel" placeholder="Phone number" value={f.phone} onChange={(e) => f.setPhone(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
              <textarea required rows={2} placeholder="Delivery address" value={f.address} onChange={(e) => f.setAddress(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
              <div className="flex gap-2">
                {f.shippingOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => f.setShippingIndex(i)}
                    className={`flex-1 rounded-md border px-2 py-2 text-xs font-medium ${i === f.shippingIndex ? 'border-yellow-600 bg-yellow-50 text-yellow-800' : 'border-neutral-300 text-neutral-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-neutral-500">{f.checkout?.codLabel || 'Cash on delivery'}</p>
              {f.status === 'error' && f.error ? <p className="text-sm font-medium text-yellow-700">{f.error}</p> : null}
              <button
                type="submit"
                disabled={f.status === 'submitting' || f.outOfStock}
                className="w-full rounded-md bg-yellow-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-800 disabled:opacity-60"
              >
                {f.outOfStock ? 'Out of stock' : f.status === 'submitting' ? 'Placing order…' : f.checkout?.submitButtonText || 'Place order'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
