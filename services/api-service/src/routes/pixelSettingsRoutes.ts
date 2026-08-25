// Store-wide Meta (Facebook) Pixel + Conversions API configuration, used by
// Home/Product/Collection/Order-confirmation storefront pages — analogous to
// checkoutSettingsRoutes.ts. Landing pages keep their own per-page
// `pixels.facebookPixelId` override (see landingPageRoutes.ts /
// storefrontRoutes.ts serializeLandingPage) for the client-side PageView tag;
// this settings object is what the server uses for CAPI purchase events
// regardless of which page an order originated from, and what the
// storefront app uses to fire the base pixel across non-landing pages.
import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';

const router: RouterType = Router();

export interface PixelSettings {
  enabled: boolean;
  pixelId: string;
  // Never sent to the public storefront route below — server-side only.
  capiAccessToken: string;
  // Meta Events Manager's "Test events" code — when set, tags every CAPI
  // call so it shows up in the test console instead of counting as live
  // traffic. Left blank in normal production use.
  testEventCode: string;
}

export const DEFAULT_PIXEL_SETTINGS: PixelSettings = {
  enabled: false,
  pixelId: '',
  capiAccessToken: '',
  testEventCode: '',
};

export async function getPixelSettings(storeId: ObjectId): Promise<PixelSettings> {
  const db = getDb();
  const doc = await db.collection('store_pixels').findOne({ storeId });
  if (!doc) return DEFAULT_PIXEL_SETTINGS;
  return {
    enabled: Boolean(doc.enabled) && typeof doc.pixelId === 'string' && doc.pixelId.trim().length > 0,
    pixelId: typeof doc.pixelId === 'string' ? doc.pixelId : '',
    capiAccessToken: typeof doc.capiAccessToken === 'string' ? doc.capiAccessToken : '',
    testEventCode: typeof doc.testEventCode === 'string' ? doc.testEventCode : '',
  };
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const settings = await getPixelSettings(storeId);
  res.json({ success: true, settings });
});

router.put('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const body = req.body ?? {};

  const settings: PixelSettings = {
    enabled: Boolean(body.enabled),
    pixelId: typeof body.pixelId === 'string' ? body.pixelId.trim().slice(0, 40) : '',
    capiAccessToken: typeof body.capiAccessToken === 'string' ? body.capiAccessToken.trim().slice(0, 500) : '',
    testEventCode: typeof body.testEventCode === 'string' ? body.testEventCode.trim().slice(0, 40) : '',
  };

  const db = getDb();
  await db
    .collection('store_pixels')
    .updateOne({ storeId }, { $set: { ...settings, storeId, updatedAt: new Date() } }, { upsert: true });

  res.json({ success: true, settings });
});

export default router;
