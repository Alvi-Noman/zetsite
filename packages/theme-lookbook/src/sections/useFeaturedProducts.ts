import { useEffect, useState } from 'react';
import { fetchStorefrontCollection, fetchStorefrontProducts, type StorefrontProduct } from '@zetsite/theme-kit';

// Shared by every Featured collection design variant — same data-fetch
// contract (falls back to all products when no collection is picked) so
// every design behaves identically, just laid out differently.
export function useFeaturedProducts(storeSlug: string, collectionHandle: string, limit: number) {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [collectionName, setCollectionName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (collectionHandle) {
        const result = await fetchStorefrontCollection(storeSlug, collectionHandle);
        if (cancelled) return;
        setProducts((result?.products ?? []).slice(0, limit || 8));
        setCollectionName(result?.collection.name ?? null);
      } else {
        const result = await fetchStorefrontProducts(storeSlug);
        if (cancelled) return;
        setProducts(result.slice(0, limit || 8));
        setCollectionName(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [storeSlug, collectionHandle, limit]);

  return { products, collectionName };
}
