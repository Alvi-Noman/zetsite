import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';

const router: RouterType = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const checkouts = await db
    .collection('abandoned_checkouts')
    .find({ storeId })
    .sort({ updatedAt: -1 })
    .limit(200)
    .toArray();

  const productIds = [...new Set(checkouts.map((c) => c.productId?.toString()).filter(Boolean))].map(
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
    checkouts: checkouts.map((c) => ({
      id: c._id.toString(),
      productId: c.productId ? c.productId.toString() : null,
      productTitle: c.productId ? (productById.get(c.productId.toString())?.title ?? null) : null,
      productImage: c.productId ? (productById.get(c.productId.toString())?.media?.[0]?.url ?? null) : null,
      variantLabel: c.variantLabel ?? null,
      quantity: c.quantity,
      name: c.name,
      phone: c.phone,
      address: c.address,
      shippingLabel: c.shippingLabel,
      shippingCost: c.shippingCost,
      subtotal: c.subtotal,
      total: c.total,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid id' });
    return;
  }
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const result = await db.collection('abandoned_checkouts').deleteOne({ _id: new ObjectId(req.params.id), storeId });
  if (result.deletedCount === 0) {
    res.status(404).json({ success: false, message: 'Not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
