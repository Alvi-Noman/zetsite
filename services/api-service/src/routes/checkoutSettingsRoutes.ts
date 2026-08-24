// A single, store-wide checkout configuration used by every landing page's
// order form, regardless of theme — analogous to Shopify's Settings >
// Checkout (one global place to edit the currency symbol, COD wording, and
// the success message, rather than per-page/per-section settings). Delivery
// zones/rates live in their own Settings > Shipping and delivery page (see
// shippingSettingsRoutes.ts) rather than here, matching Shopify's own split.
// Landing pages only ever read this via the public storefront routes; this
// file is the authenticated admin editor for it.
import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';

const router: RouterType = Router();

export interface CheckoutSettings {
  currency: string;
  codLabel: string;
  submitButtonText: string;
  successMessage: string;
}

export const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  currency: '$',
  codLabel: 'Cash on delivery',
  submitButtonText: 'Place order',
  successMessage: "Order received — we'll be in touch to confirm.",
};

export async function getCheckoutSettings(storeId: ObjectId): Promise<CheckoutSettings> {
  const db = getDb();
  const doc = await db.collection('store_checkout').findOne({ storeId });
  if (!doc) return DEFAULT_CHECKOUT_SETTINGS;
  return {
    currency: typeof doc.currency === 'string' && doc.currency ? doc.currency : DEFAULT_CHECKOUT_SETTINGS.currency,
    codLabel: typeof doc.codLabel === 'string' && doc.codLabel ? doc.codLabel : DEFAULT_CHECKOUT_SETTINGS.codLabel,
    submitButtonText:
      typeof doc.submitButtonText === 'string' && doc.submitButtonText ? doc.submitButtonText : DEFAULT_CHECKOUT_SETTINGS.submitButtonText,
    successMessage:
      typeof doc.successMessage === 'string' && doc.successMessage ? doc.successMessage : DEFAULT_CHECKOUT_SETTINGS.successMessage,
  };
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const settings = await getCheckoutSettings(storeId);
  res.json({ success: true, settings });
});

router.put('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const body = req.body ?? {};

  const settings: CheckoutSettings = {
    currency: typeof body.currency === 'string' && body.currency.trim() ? body.currency.trim().slice(0, 8) : DEFAULT_CHECKOUT_SETTINGS.currency,
    codLabel: typeof body.codLabel === 'string' ? body.codLabel.trim().slice(0, 120) || DEFAULT_CHECKOUT_SETTINGS.codLabel : DEFAULT_CHECKOUT_SETTINGS.codLabel,
    submitButtonText:
      typeof body.submitButtonText === 'string'
        ? body.submitButtonText.trim().slice(0, 60) || DEFAULT_CHECKOUT_SETTINGS.submitButtonText
        : DEFAULT_CHECKOUT_SETTINGS.submitButtonText,
    successMessage:
      typeof body.successMessage === 'string'
        ? body.successMessage.trim().slice(0, 300) || DEFAULT_CHECKOUT_SETTINGS.successMessage
        : DEFAULT_CHECKOUT_SETTINGS.successMessage,
  };

  const db = getDb();
  await db
    .collection('store_checkout')
    .updateOne({ storeId }, { $set: { ...settings, storeId, updatedAt: new Date() } }, { upsert: true });

  res.json({ success: true, settings });
});

export default router;
