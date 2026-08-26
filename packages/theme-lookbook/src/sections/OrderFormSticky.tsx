import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import { useOrderForm, money } from './useOrderForm.js';

export interface OrderFormStickySettings {
  productId: string;
}

export const orderFormStickySchema: SectionSchema = {
  type: 'orderFormSticky',
  label: 'Order form (sticky sidebar)',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Complete your order', size: 'md' } }],
  fields: [{ key: 'productId', type: 'product', label: 'Product', default: '', tab: 'content' }],
  defaultSettings: { productId: '' },
};

export function OrderFormSticky({ settings, storeSlug, renderBlocks }: SectionComponentProps<OrderFormStickySettings>) {
  const f = useOrderForm(storeSlug, settings.productId);

  if (f.status === 'sent') {
    return (
      <section id="order" className="mx-auto max-w-3xl px-4 py-12">
        <p className="rounded-lg border border-yellow-100 bg-yellow-50 px-6 py-8 text-center text-sm font-semibold text-yellow-800">
          {f.checkout?.successMessage || "Order received — we'll be in touch to confirm."}
        </p>
      </section>
    );
  }

  return (
    <section id="order" className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={f.handleSubmit} className="min-w-0 space-y-4 lg:col-span-3">
          {f.hasVariants && f.product!.variants.length > 1 ? (
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Options</span>
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
              {f.outOfStock ? <p className="mt-1.5 text-xs font-medium text-yellow-700">Out of stock</p> : null}
            </div>
          ) : null}
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
          <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600">
            {f.checkout?.codLabel || 'Cash on delivery'} — pay when your order arrives.
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

        <div className="min-w-0 lg:col-span-2">
          <div className="sticky top-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="mb-4 text-sm font-bold text-neutral-900">Order summary</h3>
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
              {f.product?.media?.[0]?.url ? (
                <ResponsiveImage src={f.product.media[0].url} alt={f.product.title} className="h-16 w-16 shrink-0 rounded-md object-cover" />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-md bg-neutral-200" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {f.product?.title ?? 'Select a product for this section'}
                  {f.variant ? <span className="font-normal text-neutral-500"> · {f.variant.label}</span> : null}
                </p>
                <div className="mt-2 inline-flex items-center rounded-md border border-neutral-300">
                  <button type="button" onClick={() => f.setQuantity((q) => Math.max(1, q - 1))} className="px-2 py-1 text-xs font-bold text-neutral-700">−</button>
                  <span className="w-6 text-center text-xs font-semibold text-neutral-900">{f.quantity}</span>
                  <button type="button" onClick={() => f.setQuantity((q) => Math.min(99, q + 1))} className="px-2 py-1 text-xs font-bold text-neutral-700">+</button>
                </div>
              </div>
            </div>
            <dl className="space-y-2 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-neutral-500">Subtotal ({f.quantity}x)</dt><dd className="font-medium text-neutral-900">{money(f.currency, f.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-neutral-500">Shipping ({f.shipping?.label ?? '—'})</dt><dd className="font-medium text-neutral-900">{money(f.currency, f.shipping?.cost ?? 0)}</dd></div>
            </dl>
            <div className="flex justify-between border-t border-neutral-200 pt-4">
              <dt className="text-sm font-bold text-neutral-900">Total</dt>
              <dd className="text-lg font-black text-yellow-700">{money(f.currency, f.total)}</dd>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
