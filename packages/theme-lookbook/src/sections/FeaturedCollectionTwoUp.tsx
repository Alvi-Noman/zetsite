import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import { useFeaturedProducts } from './useFeaturedProducts.js';

export interface FeaturedCollectionTwoUpSettings {
  collectionHandle: string;
  limit: number;
  backgroundColor: string;
}

export const featuredCollectionTwoUpSchema: SectionSchema = {
  type: 'featuredCollectionTwoUp',
  label: 'Featured collection (two-up large)',
  allowedBlockTypes: ['collectionTitle'],
  defaultBlocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Complete the look' } }],
  fields: [
    { key: 'collectionHandle', type: 'collection', label: 'Collection', default: '', tab: 'content' },
    { key: 'limit', type: 'number', label: 'Max products', default: 2, tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
  ],
  defaultSettings: { collectionHandle: '', limit: 2, backgroundColor: '#ffffff' },
};

export function FeaturedCollectionTwoUp({ settings, storeSlug, blocks, renderBlocks, priority }: SectionComponentProps<FeaturedCollectionTwoUpSettings>) {
  const { products, collectionName } = useFeaturedProducts(storeSlug, settings.collectionHandle, settings.limit);
  const titleBlock = (blocks ?? []).find((b) => b.type === 'collectionTitle');
  const titleText = collectionName ?? (titleBlock?.settings.fallbackText as string | undefined) ?? 'Featured products';

  return (
    <section className="px-6 py-10" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mb-8 text-center">
        {titleBlock ? <h2 className="text-2xl font-serif font-normal text-neutral-900">{titleText}</h2> : null}
        {renderBlocks?.()}
      </div>
      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
        {products.slice(0, 2).map((p, i) => (
          <a key={p.id} href={`/products/${p.handle}`} className="group block">
            <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
              {p.media?.[0]?.url ? <ResponsiveImage src={p.media[0].url} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" priority={priority && i === 0} /> : null}
            </div>
            <p className="mt-3 text-base font-medium text-neutral-900">{p.title}</p>
            {p.price != null ? <p className="text-sm text-neutral-500">৳{Number(p.price).toFixed(2)}</p> : null}
          </a>
        ))}
      </div>
    </section>
  );
}
