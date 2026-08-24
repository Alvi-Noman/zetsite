import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';
import type { ThemeId, ThemeGlobalSettings, LandingPageThemeId } from '@zetsite/shared';
import { LANDING_PAGE_THEME_IDS } from '@zetsite/shared/landingThemes';

const router: RouterType = Router();

const LANDING_PAGE_THEME_ID_SET = new Set<LandingPageThemeId>(LANDING_PAGE_THEME_IDS);

const AVAILABLE_THEMES: { id: ThemeId; name: string }[] = [
  { id: 'minimal', name: 'Minimal' },
  { id: 'bold', name: 'Bold' },
  { id: 'advertorial', name: 'Advertorial' },
  { id: 'funnel', name: 'Funnel' },
  { id: 'editorial', name: 'Editorial' },
  { id: 'ad-funnel', name: 'Ad Funnel' },
  { id: 'conversion-pro', name: 'Conversion Pro' },
];
const AVAILABLE_THEME_IDS = new Set(AVAILABLE_THEMES.map((t) => t.id));

const DEFAULT_GLOBAL_SETTINGS: ThemeGlobalSettings = {
  colors: { primary: '#111111', background: '#ffffff', text: '#111111', accent: '#2563eb' },
  fonts: { heading: 'Inter', body: 'Inter' },
};

async function getOrCreateStoreTheme(storeId: ObjectId) {
  const db = getDb();
  const existing = await db.collection('store_themes').findOne({ storeId });
  if (existing) return existing;

  const now = new Date();
  const doc = {
    storeId,
    activeThemeId: 'minimal' as ThemeId,
    globalSettings: {
      minimal: DEFAULT_GLOBAL_SETTINGS,
      bold: DEFAULT_GLOBAL_SETTINGS,
      advertorial: DEFAULT_GLOBAL_SETTINGS,
    },
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('store_themes').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

router.get('/', requireAuth, async (_req: AuthenticatedRequest, res) => {
  res.json({ success: true, themes: AVAILABLE_THEMES });
});

router.get('/active', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await getOrCreateStoreTheme(storeId);
  res.json({
    success: true,
    activeThemeId: doc.activeThemeId,
    globalSettings: doc.globalSettings?.[doc.activeThemeId as ThemeId] ?? DEFAULT_GLOBAL_SETTINGS,
    // Full per-theme map, so callers editing a document with its own theme
    // choice (e.g. a landing page) can look up settings for a theme other
    // than the store's current active one.
    allGlobalSettings: {
      minimal: doc.globalSettings?.minimal ?? DEFAULT_GLOBAL_SETTINGS,
      bold: doc.globalSettings?.bold ?? DEFAULT_GLOBAL_SETTINGS,
      advertorial: doc.globalSettings?.advertorial ?? DEFAULT_GLOBAL_SETTINGS,
    },
    // Landing pages have their own separate theme id-space and their own
    // settings storage — never mixed with the storefront map above.
    landingGlobalSettings: Object.fromEntries(
      LANDING_PAGE_THEME_IDS.map((id) => [id, doc.landingGlobalSettings?.[id] ?? DEFAULT_GLOBAL_SETTINGS]),
    ),
  });
});

router.put('/active', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { themeId } = req.body;
  if (typeof themeId !== 'string' || !AVAILABLE_THEME_IDS.has(themeId as ThemeId)) {
    res.status(400).json({ success: false, message: 'Unknown themeId' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  await getOrCreateStoreTheme(storeId);
  await db
    .collection('store_themes')
    .updateOne({ storeId }, { $set: { activeThemeId: themeId, updatedAt: new Date() } });

  res.json({ success: true, activeThemeId: themeId });
});

router.put('/:themeId/settings', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { themeId } = req.params;
  if (!AVAILABLE_THEME_IDS.has(themeId as ThemeId)) {
    res.status(404).json({ success: false, message: 'Unknown theme' });
    return;
  }

  const { globalSettings } = req.body;
  if (!globalSettings || typeof globalSettings !== 'object') {
    res.status(400).json({ success: false, message: 'globalSettings is required' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  await getOrCreateStoreTheme(storeId);
  await db.collection('store_themes').updateOne(
    { storeId },
    { $set: { [`globalSettings.${themeId}`]: globalSettings, updatedAt: new Date() } },
  );

  res.json({ success: true, globalSettings });
});

// Landing pages' per-theme colors/fonts, stored separately from the
// storefront's globalSettings map above (see landingGlobalSettings in
// GET /active) — the two id-spaces never share settings.
router.put('/landing/:landingThemeId/settings', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { landingThemeId } = req.params;
  if (!LANDING_PAGE_THEME_ID_SET.has(landingThemeId as LandingPageThemeId)) {
    res.status(404).json({ success: false, message: 'Unknown landing page theme' });
    return;
  }

  const { globalSettings } = req.body;
  if (!globalSettings || typeof globalSettings !== 'object') {
    res.status(400).json({ success: false, message: 'globalSettings is required' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  await getOrCreateStoreTheme(storeId);
  await db.collection('store_themes').updateOne(
    { storeId },
    { $set: { [`landingGlobalSettings.${landingThemeId}`]: globalSettings, updatedAt: new Date() } },
  );

  res.json({ success: true, globalSettings });
});

export default router;
