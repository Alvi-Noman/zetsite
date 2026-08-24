import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';
import { createUniqueHandle } from '../utils/slugify.js';

const router: RouterType = Router();

interface ProductOption {
  name: string;
  values: string[];
}

interface Variant {
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

function serializeProduct(product: any) {
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

function buildProductFields(body: any) {
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

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const products = await db
    .collection('products')
    .find({ storeId: new ObjectId(req.user!.storeId) })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ success: true, products: products.map(serializeProduct) });
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  let product;
  try {
    product = await db.collection('products').findOne({
      _id: new ObjectId(req.params.id),
      storeId: new ObjectId(req.user!.storeId),
    });
  } catch {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  res.json({ success: true, product: serializeProduct(product) });
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const fields = buildProductFields(req.body);

    const db = getDb();
    const storeId = new ObjectId(req.user!.storeId);
    const handle = await createUniqueHandle(db, 'products', storeId, fields.title);
    const now = new Date();
    const result = await db.collection('products').insertOne({
      storeId,
      handle,
      ...fields,
      createdAt: now,
      updatedAt: now,
    });

    const product = await db.collection('products').findOne({ _id: result.insertedId });
    res.status(201).json({ success: true, product: serializeProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const fields = buildProductFields(req.body);

    const db = getDb();
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(req.params.id), storeId: new ObjectId(req.user!.storeId) },
      { $set: { ...fields, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (!result) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, product: serializeProduct(result) });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  let result;
  try {
    result = await db.collection('products').deleteOne({
      _id: new ObjectId(req.params.id),
      storeId: new ObjectId(req.user!.storeId),
    });
  } catch {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }

  if (result.deletedCount === 0) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
