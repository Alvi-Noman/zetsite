// A single, store-wide set of delivery zones/rates used by every checkout
// surface (product page, every landing page's order form), regardless of
// theme — kept separate from checkout-settings (Settings > Checkout) the
// same way Shopify splits Settings > Shipping and delivery from Settings >
// Checkout. Landing pages only ever read this via the public storefront
// routes; this file is the authenticated admin editor for it.
import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';

const router: RouterType = Router();

export interface ShippingOption {
  label: string;
  cost: number;
}

export interface ShippingSettings {
  options: ShippingOption[];
}

// Bangladesh COD stores overwhelmingly price delivery by these two zones —
// merchants fill in their own rate for each, and can add more zones beyond
// these two defaults.
export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  options: [
    { label: 'Inside Dhaka', cost: 0 },
    { label: 'Outside Dhaka', cost: 0 },
  ],
};

function sanitizeOptions(input: unknown): ShippingOption[] {
  if (!Array.isArray(input)) return DEFAULT_SHIPPING_SETTINGS.options;
  const cleaned = input
    .filter((o): o is Record<string, unknown> => !!o && typeof o === 'object')
    .map((o) => ({
      label: typeof o.label === 'string' ? o.label.trim().slice(0, 80) : '',
      cost: Number.isFinite(o.cost) ? Math.max(0, Number(o.cost)) : 0,
    }))
    .filter((o) => o.label)
    .slice(0, 20);
  return cleaned.length ? cleaned : DEFAULT_SHIPPING_SETTINGS.options;
}

export async function getShippingSettings(storeId: ObjectId): Promise<ShippingSettings> {
  const db = getDb();
  const doc = await db.collection('store_shipping').findOne({ storeId });
  if (!doc) return DEFAULT_SHIPPING_SETTINGS;
  return { options: sanitizeOptions(doc.options) };
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const settings = await getShippingSettings(storeId);
  res.json({ success: true, settings });
});

router.put('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const settings: ShippingSettings = { options: sanitizeOptions(req.body?.options) };

  const db = getDb();
  await db
    .collection('store_shipping')
    .updateOne({ storeId }, { $set: { ...settings, storeId, updatedAt: new Date() } }, { upsert: true });

  res.json({ success: true, settings });
});

export default router;
