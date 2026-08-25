import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import { useFeaturedProducts } from './useFeaturedProducts.js';

export interface FeaturedCollectionCarouselSettings {
  collectionHandle: string;
  limit: number;
  backgroundColor: string;
}

export const featuredCollectionCarouselSchema: SectionSchema = {
  type: 'featuredCollectionCarousel',
  label: 'Featured collection (carousel)',
  allowedBlockTypes: ['collectionTitle'],
  defaultBlocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Complete the look' } }],
  fields: [
    { key: 'collectionHandle', type: 'collection', label: 'Collection', default: '', tab: 'content' },
    { key: 'limit', type: 'number', label: 'Max products', default: 8, tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
  ],
  defaultSettings: { collectionHandle: '', limit: 8, backgroundColor: '#ffffff' },
};

export function FeaturedCollectionCarousel({ settings, storeSlug, blocks, renderBlocks, priority }: SectionComponentProps<FeaturedCollectionCarouselSettings>) {
  const { products, collectionName } = useFeaturedProducts(storeSlug, settings.collectionHandle, settings.limit);
  const titleBlock = (blocks ?? []).find((b) => b.type === 'collectionTitle');
  const titleText = collectionName ?? (titleBlock?.settings.fallbackText as string | undefined) ?? 'Featured products';

  return (
    <section className="px-6 py-10" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mb-8 text-center">
        {titleBlock ? <h2 className="text-2xl font-serif font-normal text-neutral-900">{titleText}</h2> : null}
        {renderBlocks?.()}
      </div>
      {products.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">No products to show yet</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.map((p, i) => (
            <a key={p.id} href={`/products/${p.handle}`} className="w-40 shrink-0">
              <div className="aspect-square overflow-hidden bg-neutral-100">
                {p.media?.[0]?.url ? <ResponsiveImage src={p.media[0].url} alt={p.title} className="h-full w-full object-cover" priority={priority && i === 0} /> : null}
              </div>
              <p className="mt-2 truncate text-sm font-medium text-neutral-900">{p.title}</p>
              {p.price != null ? <p className="text-xs text-neutral-500">৳{Number(p.price).toFixed(2)}</p> : null}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
