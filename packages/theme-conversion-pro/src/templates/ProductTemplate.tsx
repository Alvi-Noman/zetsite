import { useEffect, useRef, useState } from 'react';
import type { ProductTemplateProps } from '@zetsite/theme-kit';
import {
  fetchStorefrontProduct,
  fetchStorefrontProducts,
  ProductOrderPanel,
  ResponsiveImage,
  type StorefrontProduct,
  type StorefrontVariant,
} from '@zetsite/theme-kit';

const ORDER_PANEL_CLASS_NAMES = {
  button:
    'px-10 py-3.5 bg-amber-600 text-white text-sm font-bold rounded-full hover:bg-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  accentText: 'text-amber-600',
  accentFocus: 'focus:border-amber-600',
};

function useRelatedProducts(storeSlug: string, product: StorefrontProduct | null | undefined) {
  const [related, setRelated] = useState<StorefrontProduct[]>([]);
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    fetchStorefrontProducts(storeSlug).then((all) => {
      if (cancelled) return;
      const sameCollection = all.filter(
        (p) => p.id !== product.id && p.collections.some((c) => product.collections.includes(c)),
      );
      setRelated((sameCollection.length ? sameCollection : all.filter((p) => p.id !== product.id)).slice(0, 4));
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, product]);
  return related;
}

function StockIndicator({ variant }: { variant: StorefrontVariant | undefined }) {
  if (!variant) return null;
  if (variant.available <= 0) return <p className="mt-2 text-sm font-medium text-amber-600">Out of stock</p>;
  if (variant.available <= 5) {
    return <p className="mt-2 text-sm font-semibold text-amber-600">Only {variant.available} left in stock</p>;
  }
  return <p className="mt-2 text-sm text-neutral-500">In stock</p>;
}

const TABS = ['Description', 'Shipping', 'Reviews'] as const;

export function ProductTemplate({ storeSlug, handle }: ProductTemplateProps) {
  const [product, setProduct] = useState<StorefrontProduct | null | undefined>(undefined);
  const [variantIndex, setVariantIndex] = useState(0);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Description');
  const [stickyVisible, setStickyVisible] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);
  const related = useRelatedProducts(storeSlug, product);

  useEffect(() => {
    let cancelled = false;
    fetchStorefrontProduct(storeSlug, handle).then((p) => {
      if (!cancelled) setProduct(p);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, handle]);

  useEffect(() => {
    const node = buyBoxRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [product]);

  if (product === undefined) {
    return <div className="px-6 py-10 text-center text-neutral-400">Loading…</div>;
  }
  if (product === null) {
    return <div className="px-6 py-10 text-center text-neutral-400">Product not found</div>;
  }

  const image = product.media?.[0]?.url;
  const variant = product.variants?.[variantIndex];
  const displayPrice = variant?.price ?? product.price;

  return (
    <div className="pb-16">
      <nav className="px-6 pt-6 text-xs text-neutral-500 max-w-5xl mx-auto">
        <a href="/" className="hover:text-neutral-900">
          Home
        </a>
        <span className="mx-1.5">/</span>
        <span className="text-neutral-900">{product.title}</span>
      </nav>

      <div className="px-6 py-8 max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-neutral-100 rounded-md overflow-hidden">
          {image ? <ResponsiveImage src={image} alt={product.title} className="w-full h-full object-cover" priority /> : null}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{product.title}</h1>
          {displayPrice != null ? <p className="mt-2 text-xl text-neutral-700">৳{Number(displayPrice).toFixed(2)}</p> : null}

          {product.variants?.length > 1 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVariantIndex(i)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    i === variantIndex ? 'border-amber-600 bg-amber-600 text-white' : 'border-neutral-300 text-neutral-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          ) : null}

          <StockIndicator variant={variant} />

          <div ref={buyBoxRef}>
            <ProductOrderPanel
              storeSlug={storeSlug}
              product={product}
              variant={variant}
              variantIndex={variantIndex}
              classNames={ORDER_PANEL_CLASS_NAMES}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-neutral-500">
            <span>🔒 Secure checkout</span>
            <span>↩ 30-day returns</span>
            <span>🚚 Free shipping over ৳50</span>
          </div>

          <div className="mt-10 border-t border-neutral-200">
            <div className="flex gap-6 border-b border-neutral-200">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`py-3 text-sm font-semibold border-b-2 -mb-px ${
                    tab === t ? 'border-amber-600 text-amber-600' : 'border-transparent text-neutral-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="py-4 text-sm text-neutral-600">
              {tab === 'Description' &&
                (product.description ? (
                  <div className="prose prose-neutral" dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>No description yet.</p>
                ))}
              {tab === 'Shipping' && <p>Ships within 2-3 business days. Free shipping on orders over ৳50.</p>}
              {tab === 'Reviews' && <p>No reviews yet — be the first to review this product.</p>}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="px-6 py-8 max-w-5xl mx-auto border-t border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => {
              const img = p.media?.[0]?.url;
              return (
                <a key={p.id} href={`/products/${p.handle}`} className="group block">
                  <div className="aspect-square bg-neutral-100 overflow-hidden rounded-md">
                    {img ? <ResponsiveImage src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : null}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-neutral-900">{p.title}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {stickyVisible && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            {image ? <ResponsiveImage src={image} alt="" className="h-10 w-10 rounded object-cover" /> : null}
            <div>
              <p className="text-sm font-semibold text-neutral-900">{product.title}</p>
              {displayPrice != null ? <p className="text-sm text-neutral-500">৳{Number(displayPrice).toFixed(2)}</p> : null}
            </div>
          </div>
          <button
            type="button"
            disabled={!!variant && variant.available <= 0}
            onClick={() => buyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="px-6 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-full hover:bg-amber-700 disabled:opacity-40"
          >
            {variant && variant.available <= 0 ? 'Out of stock' : 'Order now'}
          </button>
        </div>
      )}
    </div>
  );
}
