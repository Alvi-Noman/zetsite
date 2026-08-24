import { useEffect, useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { fetchStorefrontProduct, ALIGN_FIELD, ALIGN_CLASS, ResponsiveImage, type StorefrontProduct, type ContentAlign } from '@zetsite/theme-kit';

export interface ShopHeroSettings {
  imageUrl: string;
  badgeText: string;
  productId: string;
  price: string;
  compareAtPrice: string;
  currency: string;
  backgroundColor: string;
  align: ContentAlign;
}

export const shopHeroSchema: SectionSchema = {
  type: 'shopHero',
  label: 'Shop hero',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Product name', size: 'lg' } },
    { type: 'text', settings: { content: 'A short, evocative tagline that sets the tone.' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Product image', default: '', tab: 'content' },
    { key: 'badgeText', type: 'text', label: 'Eyebrow badge (optional)', default: 'New arrival', tab: 'content' },
    // When set, price/compareAtPrice below are overridden by this product's live
    // values — same 'product' picker convention as OrderForm's productId field.
    { key: 'productId', type: 'product', label: 'Product (for live price)', default: '', tab: 'content' },
    { key: 'price', type: 'text', label: 'Price (used if no product is linked above)', default: '$129', tab: 'content' },
    { key: 'compareAtPrice', type: 'text', label: 'Compare at price (optional, strikethrough)', default: '', tab: 'content' },
    { key: 'currency', type: 'text', label: 'Currency symbol (used with a linked product)', default: '$', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#FAF7F2', tab: 'style' },
    ALIGN_FIELD,
  ],
  defaultSettings: {
    imageUrl: '',
    badgeText: 'New arrival',
    productId: '',
    price: '$129',
    compareAtPrice: '',
    currency: '$',
    backgroundColor: '#FAF7F2',
    align: 'center',
  },
};

function money(currency: string, value: number): string {
  return `${currency || '$'}${value.toFixed(2)}`;
}

// The image is deliberately the dominant element — for visual/commodity
// goods it does the persuading, not the copy. Used both as the opening hero
// and, with different content, as the closing "final CTA" shot.
export function ShopHero({ settings, storeSlug, renderBlocks, priority }: SectionComponentProps<ShopHeroSettings>) {
  const [product, setProduct] = useState<StorefrontProduct | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!settings.productId) {
      setProduct(null);
      return;
    }
    fetchStorefrontProduct(storeSlug, settings.productId).then((p) => {
      if (!cancelled) setProduct(p);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug, settings.productId]);

  // A linked product always wins with its live price, so editing the product
  // elsewhere updates this hero without regenerating the page. Unlinked heroes
  // (or before the fetch resolves) fall back to the static text fields.
  const priceText = product?.price != null ? money(settings.currency, product.price) : settings.price;
  const compareAtPriceText = product
    ? product.compareAtPrice != null && product.price != null && product.compareAtPrice > product.price
      ? money(settings.currency, product.compareAtPrice)
      : ''
    : settings.compareAtPrice;

  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  return (
    <section className="px-4 py-10 sm:py-14" style={{ backgroundColor: settings.backgroundColor }}>
      <div className={`mx-auto flex max-w-4xl flex-col gap-6 ${align}`}>
        {settings.imageUrl ? (
          <ResponsiveImage
            src={settings.imageUrl}
            alt=""
            priority={priority}
            className="aspect-[4/5] w-full max-w-md rounded-sm object-cover shadow-xl shadow-stone-900/10 sm:max-w-lg"
          />
        ) : null}
        {settings.badgeText ? (
          <span className="inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {settings.badgeText}
          </span>
        ) : null}
        <div className={`flex flex-col gap-2 ${align}`}>{renderBlocks?.((b) => b.type !== 'button')}</div>
        {priceText || compareAtPriceText ? (
          <div className="flex items-baseline gap-2.5">
            {compareAtPriceText ? (
              <span className="text-lg text-neutral-400 line-through">{compareAtPriceText}</span>
            ) : null}
            {priceText ? (
              <p className="text-2xl font-semibold tracking-tight text-stone-900">{priceText}</p>
            ) : null}
          </div>
        ) : null}
        <div>{renderBlocks?.((b) => b.type === 'button')}</div>
      </div>
    </section>
  );
}
