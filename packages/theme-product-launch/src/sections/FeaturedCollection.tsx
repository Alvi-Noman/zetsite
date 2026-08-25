import { useEffect, useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  fetchStorefrontCollection,
  fetchStorefrontProducts,
  type StorefrontProduct,
  ALIGN_FIELD,
  WIDTH_FIELD,
  gapField,
  ALIGN_CLASS,
  widthClass,
  IMAGE_ASPECT_FIELD,
  ASPECT_CLASS,
  ResponsiveImage,
  type ContentAlign,
  type ContentWidth,
  type ImageAspect,
} from '@zetsite/theme-kit';

export interface FeaturedCollectionSettings {
  collectionHandle: string;
  limit: number;
  columns: '2' | '3' | '4';
  columnsMobile: '1' | '2';
  backgroundColor: string;
  align: ContentAlign;
  width: ContentWidth;
  gap: number;
  imageAspect: ImageAspect;
  showSecondaryImage: boolean;
  showSoldOutBadge: boolean;
  enableCarousel: boolean;
  showDescription: boolean;
  description: string;
}

export const featuredCollectionSchema: SectionSchema = {
  type: 'featuredCollection',
  label: 'Featured collection',
  allowedBlockTypes: ['collectionTitle', 'button'],
  defaultBlocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Featured products' } }],
  fields: [
    { key: 'collectionHandle', type: 'collection', label: 'Collection', default: '', tab: 'content' },
    { key: 'limit', type: 'number', label: 'Max products', default: 8, tab: 'content' },
    { key: 'showDescription', type: 'boolean', label: 'Show description', default: false, tab: 'content' },
    { key: 'description', type: 'richtext', label: 'Description', default: '', tab: 'content' },
    {
      key: 'columns',
      type: 'select',
      label: 'Columns (desktop)',
      default: '4',
      tab: 'style',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    {
      key: 'columnsMobile',
      type: 'select',
      label: 'Columns (mobile)',
      default: '2',
      tab: 'style',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
      ],
    },
    { key: 'enableCarousel', type: 'boolean', label: 'Show as carousel on desktop', default: false, tab: 'style' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
    { ...IMAGE_ASPECT_FIELD, default: 'square' },
    {
      key: 'showSecondaryImage',
      type: 'boolean',
      label: 'Show second image on hover',
      default: true,
      tab: 'style',
    },
    { key: 'showSoldOutBadge', type: 'boolean', label: 'Show "Sold out" badge', default: true, tab: 'style' },
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(24),
  ],
  defaultSettings: {
    collectionHandle: '',
    limit: 8,
    columns: '4',
    columnsMobile: '2',
    backgroundColor: '#ffffff',
    align: 'center',
    width: 'page',
    gap: 24,
    imageAspect: 'square',
    showSecondaryImage: true,
    showSoldOutBadge: true,
    enableCarousel: false,
    showDescription: false,
    description: '',
  },
};

const MOBILE_COLUMN_CLASS: Record<FeaturedCollectionSettings['columnsMobile'], string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
};

const DESKTOP_COLUMN_CLASS: Record<FeaturedCollectionSettings['columns'], string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'md:grid-cols-4',
};

function isSoldOut(product: StorefrontProduct): boolean {
  return product.variants.length > 0 && product.variants.every((v) => v.available <= 0);
}

function ProductCard({
  product,
  aspectClass,
  showSecondaryImage,
  showSoldOutBadge,
  priority,
}: {
  product: StorefrontProduct;
  aspectClass: string;
  showSecondaryImage: boolean;
  showSoldOutBadge: boolean;
  priority?: boolean;
}) {
  const image = product.media?.[0]?.url;
  const secondaryImage = showSecondaryImage ? product.media?.[1]?.url : undefined;
  const soldOut = showSoldOutBadge && isSoldOut(product);
  return (
    <a href={`/products/${product.handle}`} className={`group block ${soldOut ? 'opacity-60' : ''}`}>
      <div className={`relative bg-neutral-100 overflow-hidden rounded-md ${aspectClass || 'aspect-square'}`}>
        {image ? (
          <ResponsiveImage
            src={image}
            alt={product.title}
            priority={priority}
            className={`w-full h-full object-cover transition-opacity duration-200 ${secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105 transition-transform'}`}
          />
        ) : null}
        {secondaryImage ? (
          <ResponsiveImage
            src={secondaryImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        ) : null}
        {soldOut ? (
          <span className="absolute left-2 top-2 rounded-md bg-neutral-900 px-2 py-1 text-xs font-semibold text-white">Sold out</span>
        ) : null}
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-900">{product.title}</p>
      {product.price != null ? (
        <p className="text-sm text-neutral-500">৳{Number(product.price).toFixed(2)}</p>
      ) : null}
    </a>
  );
}

export function FeaturedCollection({
  settings,
  storeSlug,
  blocks,
  renderBlocks,
  priority,
}: SectionComponentProps<FeaturedCollectionSettings>) {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [collectionName, setCollectionName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (settings.collectionHandle) {
        const result = await fetchStorefrontCollection(storeSlug, settings.collectionHandle);
        if (cancelled) return;
        setProducts((result?.products ?? []).slice(0, settings.limit || 8));
        setCollectionName(result?.collection.name ?? null);
      } else {
        const result = await fetchStorefrontProducts(storeSlug);
        if (cancelled) return;
        setProducts(result.slice(0, settings.limit || 8));
        setCollectionName(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [storeSlug, settings.collectionHandle, settings.limit]);

  const titleBlock = (blocks ?? []).find((b) => b.type === 'collectionTitle');
  const titleText = collectionName ?? (titleBlock?.settings.fallbackText as string | undefined) ?? 'Featured products';
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const aspectClass = ASPECT_CLASS[settings.imageAspect] ?? ASPECT_CLASS.square;
  const enableCarousel = settings.enableCarousel ?? false;
  const mobileCols = MOBILE_COLUMN_CLASS[settings.columnsMobile] ?? MOBILE_COLUMN_CLASS['2'];
  const desktopCols = DESKTOP_COLUMN_CLASS[settings.columns] ?? DESKTOP_COLUMN_CLASS['4'];

  return (
    <section className="px-6 py-10" style={{ backgroundColor: settings.backgroundColor }}>
      <div className={`flex flex-col mb-10 space-y-3 ${align}`}>
        {titleBlock ? (
          <h2 className="text-2xl font-bold text-neutral-900">{titleText}</h2>
        ) : null}
        {settings.showDescription && settings.description ? (
          <p className="max-w-2xl text-sm text-neutral-600">{settings.description}</p>
        ) : null}
        {renderBlocks?.((b) => b.type === 'button')}
      </div>
      {products.length === 0 ? (
        <p className="text-center text-neutral-400 text-sm">No products to show yet</p>
      ) : enableCarousel ? (
        <div
          className={`flex overflow-x-auto snap-x snap-mandatory mx-auto ${widthClass(settings.width, 'max-w-5xl')}`}
          style={{ gap: settings.gap ?? 24 }}
        >
          {products.map((p, i) => (
            <div key={p.id} className="w-1/2 shrink-0 snap-start md:w-auto" style={{ flexBasis: `calc((100% - ${((Number(settings.columns) || 4) - 1)} * ${settings.gap ?? 24}px) / ${settings.columns || 4})` }}>
              <ProductCard
                product={p}
                aspectClass={aspectClass}
                showSecondaryImage={settings.showSecondaryImage ?? true}
                showSoldOutBadge={settings.showSoldOutBadge ?? true}
                priority={priority && i === 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`grid ${mobileCols} ${desktopCols} mx-auto ${widthClass(settings.width, 'max-w-5xl')}`}
          style={{ gap: settings.gap ?? 24 }}
        >
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              aspectClass={aspectClass}
              showSecondaryImage={settings.showSecondaryImage ?? true}
              showSoldOutBadge={settings.showSoldOutBadge ?? true}
              priority={priority && i === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
