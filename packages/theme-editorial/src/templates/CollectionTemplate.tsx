import { useEffect, useMemo, useState } from 'react';
import type { CollectionTemplateProps } from '@zetsite/theme-kit';
import { fetchStorefrontCollection, ResponsiveImage, type StorefrontCollection, type StorefrontProduct } from '@zetsite/theme-kit';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'title-asc';

function sortProducts(products: StorefrontProduct[], sort: SortKey): StorefrontProduct[] {
  const copy = [...products];
  if (sort === 'price-asc') return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sort === 'price-desc') return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  if (sort === 'title-asc') return copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy;
}

export function CollectionTemplate({ storeSlug, handle }: CollectionTemplateProps) {
  const [data, setData] = useState<
    { collection: StorefrontCollection; products: StorefrontProduct[] } | null | undefined
  >(undefined);
  const [sort, setSort] = useState<SortKey>('featured');

  useEffect(() => {
    let cancelled = false;
    fetchStorefrontCollection(storeSlug, handle).then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, handle]);

  const sorted = useMemo(() => (data ? sortProducts(data.products, sort) : []), [data, sort]);

  if (data === undefined) {
    return <div className="px-6 py-10 text-center text-neutral-400">Loading…</div>;
  }
  if (data === null) {
    return <div className="px-6 py-10 text-center text-neutral-400">Collection not found</div>;
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <nav className="text-xs text-neutral-500 mb-6">
        <a href="/" className="hover:text-neutral-900">
          Home
        </a>
        <span className="mx-1.5">/</span>
        <span className="text-neutral-900">{data.collection.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-neutral-900">{data.collection.name}</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="title-asc">Alphabetical</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="text-neutral-400 text-sm">No products in this collection yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sorted.map((p, i) => {
            const image = p.media?.[0]?.url;
            return (
              <a key={p.id} href={`/products/${p.handle}`} className="group block">
                <div className="aspect-square bg-neutral-100 overflow-hidden rounded-md">
                  {image ? (
                    <ResponsiveImage
                      src={image}
                      alt={p.title}
                      priority={i === 0}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-900">{p.title}</p>
                {p.price != null ? <p className="text-sm text-neutral-500">৳{Number(p.price).toFixed(2)}</p> : null}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
