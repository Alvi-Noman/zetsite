// Shared by the admin product routes (productRoutes.ts, cookie-authed) and
// the external integration routes (integrationRoutes.ts, token-authed) so
// both validate/serialize products identically instead of drifting apart.
import { ObjectId } from 'mongodb';

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Variant {
  label: string;
  values: string[];
  price?: number;
  sku?: string;
  available: number;
  image?: string | null;
}

interface MediaVariants {
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
  placeholder?: string;
  avif?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

interface Media {
  url: string;
  type: string;
  name?: string;
  variants?: MediaVariants;
}

export function serializeProduct(product: any) {
  return {
    id: product._id.toString(),
    title: product.title,
    handle: product.handle ?? '',
    description: product.description ?? '',
    media: product.media ?? [],
    category: product.category ?? '',
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    sku: product.sku ?? '',
    options: product.options ?? [],
    variants: product.variants ?? [],
    collections: product.collections ?? [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function buildProductFields(body: any) {
  const { title, description, media, category, price, compareAtPrice, sku, options, variants, collections } = body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('Title is required');
  }

  const numericPrice = Number(price);
  if (price !== undefined && price !== null && price !== '' && Number.isNaN(numericPrice)) {
    throw new Error('Price must be a number');
  }

  const numericCompareAtPrice = Number(compareAtPrice);
  if (compareAtPrice !== undefined && compareAtPrice !== null && compareAtPrice !== '' && Number.isNaN(numericCompareAtPrice)) {
    throw new Error('Compare at price must be a number');
  }

  const cleanMedia: Media[] = Array.isArray(media)
    ? media
        .filter((m) => m && typeof m.url === 'string')
        .map((m) => ({
          url: m.url,
          type: typeof m.type === 'string' ? m.type : 'image',
          name: typeof m.name === 'string' ? m.name : undefined,
          variants:
            m.variants && typeof m.variants === 'object'
              ? {
                  thumbnail: typeof m.variants.thumbnail === 'string' ? m.variants.thumbnail : undefined,
                  medium: typeof m.variants.medium === 'string' ? m.variants.medium : undefined,
                  large: typeof m.variants.large === 'string' ? m.variants.large : undefined,
                  original: typeof m.variants.original === 'string' ? m.variants.original : undefined,
                  placeholder: typeof m.variants.placeholder === 'string' ? m.variants.placeholder : undefined,
                  avif:
                    m.variants.avif && typeof m.variants.avif === 'object'
                      ? {
                          thumbnail:
                            typeof m.variants.avif.thumbnail === 'string'
                              ? m.variants.avif.thumbnail
                              : undefined,
                          medium:
                            typeof m.variants.avif.medium === 'string' ? m.variants.avif.medium : undefined,
                          large:
                            typeof m.variants.avif.large === 'string' ? m.variants.avif.large : undefined,
                        }
                      : undefined,
                }
              : undefined,
        }))
    : [];

  const cleanOptions: ProductOption[] = Array.isArray(options)
    ? options
        .filter(
          (o) =>
            o &&
            typeof o.name === 'string' &&
            o.name.trim() &&
            Array.isArray(o.values) &&
            o.values.some((v: any) => typeof v === 'string' && v.trim()),
        )
        .map((o) => ({
          name: o.name.trim(),
          values: o.values
            .filter((v: any) => typeof v === 'string' && v.trim())
            .map((v: string) => v.trim()),
        }))
    : [];

  const cleanVariants: Variant[] = Array.isArray(variants)
    ? variants
        .filter((v) => v && typeof v.label === 'string' && Array.isArray(v.values))
        .map((v) => ({
          label: v.label,
          values: v.values.filter((x: any) => typeof x === 'string'),
          price: v.price !== undefined && v.price !== '' ? Number(v.price) : undefined,
          sku: typeof v.sku === 'string' ? v.sku : undefined,
          available: v.available !== undefined && v.available !== '' ? Number(v.available) || 0 : 0,
          image: typeof v.image === 'string' ? v.image : null,
        }))
    : [];

  const cleanCollections: string[] = Array.isArray(collections)
    ? Array.from(new Set(collections.filter((c) => typeof c === 'string' && ObjectId.isValid(c))))
    : [];

  return {
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    media: cleanMedia,
    category: typeof category === 'string' ? category : '',
    price: price !== undefined && price !== null && price !== '' ? numericPrice : undefined,
    compareAtPrice:
      compareAtPrice !== undefined && compareAtPrice !== null && compareAtPrice !== '' ? numericCompareAtPrice : undefined,
    sku: typeof sku === 'string' ? sku : '',
    options: cleanOptions,
    variants: cleanVariants,
    collections: cleanCollections,
  };
}
