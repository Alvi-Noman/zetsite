// Read/write API for a connected external integration (currently zetsales),
// authenticated by the OAuth access token minted in auth-service's
// integrationController.ts. Deliberately separate from productRoutes.ts /
// orderRoutes.ts (cookie-authed, used by the builder's own admin UI) even
// though it shares their validation/serialization logic (productService.ts)
// — this is also the receiving side of zetsales' own writes, so it must
// never itself dispatch an outbound webhook (see integrationWebhooks.ts
// call sites in productRoutes.ts/orderRoutes.ts/storefrontRoutes.ts) or the
// two systems would echo-loop.
import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireIntegrationToken, type IntegrationScopedRequest } from '../middleware/integrationAuthMiddleware.js';
import { getDb } from '../utils/db.js';
import { createUniqueHandle } from '../utils/slugify.js';
import { buildProductFields, serializeProduct } from '../services/productService.js';

const router: RouterType = Router();

const ALLOWED_ORDER_STATUSES = new Set(['new', 'confirmed', 'shipped', 'cancelled']);
const PAGE_SIZE = 50;

function paginationFromQuery(req: IntegrationScopedRequest) {
  const page = Math.max(1, Number(req.query.page) || 1);
  return { page, skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE };
}

router.get('/products', requireIntegrationToken, async (req: IntegrationScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.integration!.storeId);
  const { page, skip, limit } = paginationFromQuery(req);

  const [products, total] = await Promise.all([
    db.collection('products').find({ storeId }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection('products').countDocuments({ storeId }),
  ]);

  res.json({ success: true, products: products.map(serializeProduct), page, total, hasMore: skip + products.length < total });
});

router.post('/products', requireIntegrationToken, async (req: IntegrationScopedRequest, res) => {
  try {
    const fields = buildProductFields(req.body);
    const db = getDb();
    const storeId = new ObjectId(req.integration!.storeId);
    const handle = await createUniqueHandle(db, 'products', storeId, fields.title);
    const now = new Date();
    const result = await db.collection('products').insertOne({ storeId, handle, ...fields, createdAt: now, updatedAt: now });
    const product = await db.collection('products').findOne({ _id: result.insertedId });
    res.status(201).json({ success: true, product: serializeProduct(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.patch('/products/:id', requireIntegrationToken, async (req: IntegrationScopedRequest, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }
  try {
    const fields = buildProductFields(req.body);
    const db = getDb();
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(req.params.id), storeId: new ObjectId(req.integration!.storeId) },
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

router.delete('/products/:id', requireIntegrationToken, async (req: IntegrationScopedRequest, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }
  const db = getDb();
  const result = await db
    .collection('products')
    .deleteOne({ _id: new ObjectId(req.params.id), storeId: new ObjectId(req.integration!.storeId) });
  if (result.deletedCount === 0) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }
  res.json({ success: true });
});

router.get('/orders', requireIntegrationToken, async (req: IntegrationScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.integration!.storeId);
  const { page, skip, limit } = paginationFromQuery(req);

  const [orders, total] = await Promise.all([
    db.collection('orders').find({ storeId }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    db.collection('orders').countDocuments({ storeId }),
  ]);

  res.json({
    success: true,
    orders: orders.map((o) => ({
      id: o._id.toString(),
      productId: o.productId ? o.productId.toString() : null,
      variantIndex: o.variantIndex ?? null,
      variantLabel: o.variantLabel ?? null,
      quantity: o.quantity,
      customer: o.customer,
      shippingLabel: o.shippingLabel,
      shippingCost: o.shippingCost,
      subtotal: o.subtotal,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    })),
    page,
    total,
    hasMore: skip + orders.length < total,
  });
});

router.patch('/orders/:id/status', requireIntegrationToken, async (req: IntegrationScopedRequest, res) => {
  const { status } = req.body ?? {};
  if (typeof status !== 'string' || !ALLOWED_ORDER_STATUSES.has(status)) {
    res.status(400).json({ success: false, message: 'Invalid status' });
    return;
  }
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid order id' });
    return;
  }

  const db = getDb();
  const result = await db
    .collection('orders')
    .updateOne({ _id: new ObjectId(req.params.id), storeId: new ObjectId(req.integration!.storeId) }, { $set: { status } });

  if (result.matchedCount === 0) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
