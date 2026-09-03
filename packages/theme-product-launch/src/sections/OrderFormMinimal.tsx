import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { useOrderForm, money } from './useOrderForm.js';

export interface OrderFormMinimalSettings {
  productId: string;
}

export const orderFormMinimalSchema: SectionSchema = {
  type: 'orderFormMinimal',
  label: 'Order form (minimal)',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Complete your order', size: 'md' } }],
  fields: [{ key: 'productId', type: 'product', label: 'Product', default: '', tab: 'content' }],
  defaultSettings: { productId: '' },
};

export function OrderFormMinimal({ settings, storeSlug, renderBlocks }: SectionComponentProps<OrderFormMinimalSettings>) {
  const f = useOrderForm(storeSlug, settings.productId);

  if (f.status === 'sent') {
    return (
      <section id="order" className="mx-auto max-w-md px-4 py-12">
        <p className="rounded-lg border border-yellow-100 bg-yellow-50 px-6 py-8 text-center text-sm font-semibold text-yellow-800">
          {f.checkout?.successMessage || "Order received — we'll be in touch to confirm."}
        </p>
      </section>
    );
  }

  return (
    <section id="order" className="mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <form onSubmit={f.handleSubmit} className="space-y-3">
        {f.hasVariants && f.product!.variants.length > 1 ? (
          <div className="flex flex-wrap gap-2">
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
        <input required placeholder="Full name" value={f.name} onChange={(e) => f.setName(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
        <input required type="tel" placeholder="Phone number" value={f.phone} onChange={(e) => f.setPhone(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
        {f.checkout?.collectEmail ? (
          <input type="email" placeholder="Email (optional)" value={f.email} onChange={(e) => f.setEmail(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />
        ) : null}
        <textarea required rows={2} placeholder="Delivery address" value={f.address} onChange={(e) => f.setAddress(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-yellow-600 focus:outline-none" />

        <details className="rounded-md border border-neutral-200 px-3 py-2 text-sm">
          <summary className="flex cursor-pointer items-center justify-between font-medium text-neutral-700">
            <span>Order summary</span>
            <span className="font-bold text-neutral-900">{money(f.currency, f.total)}</span>
          </summary>
          <div className="mt-2 space-y-1 text-xs text-neutral-500">
            <div className="flex justify-between"><span>{f.product?.title ?? 'Product'} ({f.quantity}x)</span><span>{money(f.currency, f.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping ({f.shipping?.label ?? '—'})</span><span>{money(f.currency, f.shipping?.cost ?? 0)}</span></div>
          </div>
        </details>

        <p className="text-xs text-neutral-500">{f.checkout?.codLabel || 'Cash on delivery'} — pay when your order arrives.</p>
        {f.status === 'error' && f.error ? <p className="text-sm font-medium text-yellow-700">{f.error}</p> : null}
        <button
          type="submit"
          disabled={f.status === 'submitting' || f.outOfStock}
          className="w-full rounded-md bg-yellow-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-yellow-800 disabled:opacity-60"
        >
          {f.outOfStock ? 'Out of stock' : f.status === 'submitting' ? 'Placing order…' : f.checkout?.submitButtonText || 'Place order'}
        </button>
      </form>
    </section>
  );
}
