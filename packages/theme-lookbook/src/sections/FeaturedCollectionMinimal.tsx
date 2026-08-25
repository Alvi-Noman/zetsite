import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { useFeaturedProducts } from './useFeaturedProducts.js';

export interface FeaturedCollectionMinimalSettings {
  collectionHandle: string;
  limit: number;
}

export const featuredCollectionMinimalSchema: SectionSchema = {
  type: 'featuredCollectionMinimal',
  label: 'Featured collection (minimal text links)',
  allowedBlockTypes: ['collectionTitle'],
  defaultBlocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Complete the look' } }],
  fields: [
    { key: 'collectionHandle', type: 'collection', label: 'Collection', default: '', tab: 'content' },
    { key: 'limit', type: 'number', label: 'Max products', default: 6, tab: 'content' },
  ],
  defaultSettings: { collectionHandle: '', limit: 6 },
};

export function FeaturedCollectionMinimal({ settings, storeSlug, blocks, renderBlocks }: SectionComponentProps<FeaturedCollectionMinimalSettings>) {
  const { products, collectionName } = useFeaturedProducts(storeSlug, settings.collectionHandle, settings.limit);
  const titleBlock = (blocks ?? []).find((b) => b.type === 'collectionTitle');
  const titleText = collectionName ?? (titleBlock?.settings.fallbackText as string | undefined) ?? 'Featured products';

  return (
    <section className="px-6 py-10 text-center">
      {titleBlock ? <h2 className="mb-6 text-2xl font-serif font-normal text-neutral-900">{titleText}</h2> : null}
      {renderBlocks?.()}
      <div className="mx-auto flex max-w-md flex-col divide-y divide-neutral-200 border-y border-neutral-200">
        {products.map((p) => (
          <a key={p.id} href={`/products/${p.handle}`} className="flex items-center justify-between py-3 text-sm">
            <span className="font-medium text-neutral-900">{p.title}</span>
            {p.price != null ? <span className="text-neutral-500">৳{Number(p.price).toFixed(2)}</span> : null}
          </a>
        ))}
      </div>
    </section>
  );
}
