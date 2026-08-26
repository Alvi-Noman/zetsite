import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';
import { dispatchIntegrationWebhook } from '../utils/integrationWebhooks.js';

const router: RouterType = Router();

const ALLOWED_STATUSES = new Set(['new', 'confirmed', 'shipped', 'cancelled']);

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const orders = await db
    .collection('orders')
    .find({ storeId })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const productIds = [...new Set(orders.map((o) => o.productId?.toString()).filter(Boolean))].map(
    (id) => new ObjectId(id),
  );
  const products = productIds.length
    ? await db
        .collection('products')
        .find({ _id: { $in: productIds } })
        .project({ title: 1, media: 1 })
        .toArray()
    : [];
  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  res.json({
    success: true,
    orders: orders.map((o) => ({
      id: o._id.toString(),
      landingPageId: o.landingPageId ? o.landingPageId.toString() : null,
      productId: o.productId ? o.productId.toString() : null,
      productTitle: o.productId ? (productById.get(o.productId.toString())?.title ?? null) : null,
      productImage: o.productId ? (productById.get(o.productId.toString())?.media?.[0]?.url ?? null) : null,
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
  });
});

router.put('/:id/status', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { status } = req.body ?? {};
  if (typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
    res.status(400).json({ success: false, message: 'Invalid status' });
    return;
  }
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid order id' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const result = await db
    .collection('orders')
    .updateOne({ _id: new ObjectId(req.params.id), storeId }, { $set: { status } });

  if (result.matchedCount === 0) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  dispatchIntegrationWebhook(storeId, 'orders/updated', { id: req.params.id, status });
  res.json({ success: true });
});

export default router;
