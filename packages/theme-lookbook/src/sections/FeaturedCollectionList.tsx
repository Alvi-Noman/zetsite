import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import { useFeaturedProducts } from './useFeaturedProducts.js';

export interface FeaturedCollectionListSettings {
  collectionHandle: string;
  limit: number;
  backgroundColor: string;
}

export const featuredCollectionListSchema: SectionSchema = {
  type: 'featuredCollectionList',
  label: 'Featured collection (list, large images)',
  allowedBlockTypes: ['collectionTitle'],
  defaultBlocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Complete the look' } }],
  fields: [
    { key: 'collectionHandle', type: 'collection', label: 'Collection', default: '', tab: 'content' },
    { key: 'limit', type: 'number', label: 'Max products', default: 4, tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
  ],
  defaultSettings: { collectionHandle: '', limit: 4, backgroundColor: '#ffffff' },
};

export function FeaturedCollectionList({ settings, storeSlug, blocks, renderBlocks, priority }: SectionComponentProps<FeaturedCollectionListSettings>) {
  const { products, collectionName } = useFeaturedProducts(storeSlug, settings.collectionHandle, settings.limit);
  const titleBlock = (blocks ?? []).find((b) => b.type === 'collectionTitle');
  const titleText = collectionName ?? (titleBlock?.settings.fallbackText as string | undefined) ?? 'Featured products';

  return (
    <section className="px-6 py-10" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mb-8 text-center">
        {titleBlock ? <h2 className="text-2xl font-serif font-normal text-neutral-900">{titleText}</h2> : null}
        {renderBlocks?.()}
      </div>
      <div className="mx-auto flex max-w-2xl flex-col divide-y divide-neutral-200">
        {products.map((p, i) => (
          <a key={p.id} href={`/products/${p.handle}`} className="flex items-center gap-5 py-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden bg-neutral-100">
              {p.media?.[0]?.url ? <ResponsiveImage src={p.media[0].url} alt={p.title} className="h-full w-full object-cover" priority={priority && i === 0} /> : null}
            </div>
            <div>
              <p className="text-base font-medium text-neutral-900">{p.title}</p>
              {p.price != null ? <p className="mt-1 text-sm text-neutral-500">${Number(p.price).toFixed(2)}</p> : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
