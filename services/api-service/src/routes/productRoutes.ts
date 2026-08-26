import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';
import { createUniqueHandle } from '../utils/slugify.js';
import { buildProductFields, serializeProduct } from '../services/productService.js';
import { dispatchIntegrationWebhook } from '../utils/integrationWebhooks.js';

const router: RouterType = Router();

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
    const serialized = serializeProduct(product);
    dispatchIntegrationWebhook(storeId, 'products/create', serialized);
    res.status(201).json({ success: true, product: serialized });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const fields = buildProductFields(req.body);

    const db = getDb();
    const storeId = new ObjectId(req.user!.storeId);
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(req.params.id), storeId },
      { $set: { ...fields, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );

    if (!result) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const serialized = serializeProduct(result);
    dispatchIntegrationWebhook(storeId, 'products/update', serialized);
    res.json({ success: true, product: serialized });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  let result;
  try {
    result = await db.collection('products').deleteOne({
      _id: new ObjectId(req.params.id),
      storeId,
    });
  } catch {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }

  if (result.deletedCount === 0) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  dispatchIntegrationWebhook(storeId, 'products/delete', { id: req.params.id });
  res.json({ success: true });
});

export default router;
