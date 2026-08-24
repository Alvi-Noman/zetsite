import { Router, type Router as RouterType } from 'express';
import rateLimit from 'express-rate-limit';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDb } from '../utils/db.js';
import { resolveStoreBySlug, type StoreScopedRequest } from '../middleware/storeSlugMiddleware.js';
import type { LandingPageThemeId } from '@zetsite/shared';
import { LANDING_PAGE_THEME_IDS, DEFAULT_LANDING_PAGE_THEME_ID } from '@zetsite/shared/landingThemes';
import { getCheckoutSettings } from './checkoutSettingsRoutes.js';
import { getShippingSettings, type ShippingOption } from './shippingSettingsRoutes.js';

const router: RouterType = Router({ mergeParams: true });

const storefrontLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter, dedicated limit for order placement — order spam/COD-fraud attempts
// shouldn't be able to hide inside the much larger page-view/analytics budget
// above, and legitimate page-view traffic shouldn't be able to exhaust a
// shopper's ability to check out.
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Abandoned-checkout drafts autosave repeatedly as a shopper types (debounced
// client-side) plus a flush on tab-hide, so this needs a higher budget than
// order placement without being wide open.
const abandonedCheckoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://auth-service:4002';
const domainResolveCache = new Map<string, { slug: string | null; expiresAt: number }>();
// Short-lived on purpose: unlike the subdomain-lookup cache above, a custom
// domain can be disconnected from one store and immediately reconnected to a
// different one — a long TTL here would mean visitors briefly reaching the
// wrong tenant's storefront on that domain. This still absorbs bursty
// traffic without leaving a meaningful cross-tenant window open.
const DOMAIN_CACHE_TTL_MS = 30 * 1000;

const domainResolveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// The storefront app calls this once per session when it's loaded from a
// hostname that isn't a `*.<rootDomain>` subdomain — i.e. a merchant's
// connected custom domain — since the store slug can't be read off an
// arbitrary hostname the way it can off a subdomain. Registered ahead of the
// `/:slug` mount below so "resolve-domain" itself is never mistaken for a
// store slug.
router.get('/resolve-domain', domainResolveLimiter, async (req, res) => {
  const host = typeof req.query.host === 'string' ? req.query.host.toLowerCase().split(':')[0] : '';
  if (!host) {
    res.status(400).json({ success: false, message: 'host is required' });
    return;
  }

  const cached = domainResolveCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    if (!cached.slug) {
      res.status(404).json({ success: false, message: 'No store connected to this domain' });
      return;
    }
    res.json({ success: true, slug: cached.slug });
    return;
  }

  let slug: string | null = null;
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/domains/resolve?host=${encodeURIComponent(host)}`);
    if (response.ok) {
      const data = (await response.json()) as { success: boolean; slug?: string };
      slug = data.slug ?? null;
    }
  } catch {
    slug = null;
  }

  domainResolveCache.set(host, { slug, expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS });

  if (!slug) {
    res.status(404).json({ success: false, message: 'No store connected to this domain' });
    return;
  }
  res.json({ success: true, slug });
});

router.use('/:slug', storefrontLimiter, resolveStoreBySlug);

// Published content only changes on publish, so a short cache absorbs
// repeat/rapid page loads (re-navigation, bot crawls) without ever serving
// anything more than 30s stale — no invalidation logic needed on publish.
function setPublicCache(res: import('express').Response) {
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
}

// Mirrors exactly what serializeProductSummary reads, so Mongo can trim
// fields server-side instead of fetching full documents just to discard most
// of each one in JS.
const PRODUCT_SUMMARY_PROJECTION = {
  title: 1,
  handle: 1,
  description: 1,
  media: 1,
  price: 1,
  compareAtPrice: 1,
  variants: 1,
  collections: 1,
} as const;

const PRODUCT_LIST_LIMIT = 200;

function serializeProductSummary(product: any) {
  return {
    id: product._id.toString(),
    title: product.title,
    handle: product.handle ?? '',
    description: product.description ?? '',
    media: product.media ?? [],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    variants: product.variants ?? [],
    collections: product.collections ?? [],
  };
}

router.get('/:slug/page/:page', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const [doc, themeDoc] = await Promise.all([
    db.collection('pages').findOne({ storeId, page: req.params.page }),
    db.collection('store_themes').findOne({ storeId }),
  ]);

  if (!doc || !doc.published?.sections) {
    res.status(404).json({ success: false, message: 'Page not published' });
    return;
  }

  const activeThemeId = themeDoc?.activeThemeId ?? 'minimal';

  setPublicCache(res);
  res.json({
    success: true,
    page: req.params.page,
    sections: doc.published.sections,
    meta: doc.meta ?? null,
    publishedAt: doc.published.publishedAt,
    themeId: activeThemeId,
    globalSettings: themeDoc?.globalSettings?.[activeThemeId] ?? null,
    store: req.store,
  });
});

// Staging preview: returns DRAFT sections (not yet published) gated by the
// per-store share token from GET /api/v1/pages/preview-token, so a work-in-
// progress page can be reviewed at a real URL before going live.
router.get('/:slug/preview/:page', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  const themeDoc = await db.collection('store_themes').findOne({ storeId });
  if (!token || !themeDoc?.previewToken || token !== themeDoc.previewToken) {
    res.status(403).json({ success: false, message: 'Invalid preview token' });
    return;
  }

  const doc = await db.collection('pages').findOne({ storeId, page: req.params.page });
  const activeThemeId = themeDoc?.activeThemeId ?? 'minimal';

  res.json({
    success: true,
    page: req.params.page,
    sections: doc?.draft?.sections ?? [],
    meta: doc?.meta ?? null,
    themeId: activeThemeId,
    globalSettings: themeDoc?.globalSettings?.[activeThemeId] ?? null,
    store: req.store,
  });
});

router.post('/:slug/form-submissions', async (req: StoreScopedRequest, res) => {
  const { formName, fields } = req.body ?? {};
  if (typeof formName !== 'string' || !formName.trim() || !fields || typeof fields !== 'object') {
    res.status(400).json({ success: false, message: 'formName and fields are required' });
    return;
  }

  const cleanFields: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string') cleanFields[key.slice(0, 100)] = value.slice(0, 2000);
  }

  const db = getDb();
  await db.collection('form_submissions').insertOne({
    storeId: new ObjectId(req.store!.id),
    formName: formName.trim().slice(0, 100),
    fields: cleanFields,
    createdAt: new Date(),
  });

  res.status(201).json({ success: true });
});

// Public order-submit endpoint for the 'orderForm' section (theme-advertorial
// and beyond) — auth-free, store-scoped by :slug, same pattern as
// /form-submissions above, but writes to a dedicated `orders` collection
// with structured quantity/price/status fields instead of a generic field
// blob, so a real admin Orders list (orderRoutes.ts) can be built on top.
const MAX_TEXT_LEN = 200;
const MAX_QUANTITY = 999;
const MAX_IDEMPOTENCY_KEY_LEN = 100;

function matchShippingOption(options: ShippingOption[], label: unknown): ShippingOption | null {
  if (typeof label !== 'string' || !label.trim()) return null;
  const needle = label.trim().toLowerCase();
  return options.find((o) => o.label.toLowerCase() === needle) ?? null;
}

router.post('/:slug/orders', orderLimiter, async (req: StoreScopedRequest, res) => {
  const {
    productId,
    variantIndex,
    landingPageId,
    quantity,
    name,
    phone,
    address,
    shippingLabel,
    idempotencyKey,
    // Honeypot: a hidden field real shoppers never see or fill in. Any bot
    // that blindly fills every input on the page trips it; the request is
    // accepted (so the bot doesn't learn it was rejected) but never persisted.
    website,
  } = req.body ?? {};

  if (typeof productId !== 'string' || !ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Invalid productId' });
    return;
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    res.status(400).json({ success: false, message: 'Invalid quantity' });
    return;
  }
  const cleanName = typeof name === 'string' ? name.trim().slice(0, MAX_TEXT_LEN) : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, MAX_TEXT_LEN) : '';
  const cleanAddress = typeof address === 'string' ? address.trim().slice(0, 2000) : '';
  if (!cleanName || !cleanPhone || !cleanAddress) {
    res.status(400).json({ success: false, message: 'name, phone and address are required' });
    return;
  }
  const cleanIdempotencyKey =
    typeof idempotencyKey === 'string' && idempotencyKey.trim() ? idempotencyKey.trim().slice(0, MAX_IDEMPOTENCY_KEY_LEN) : null;

  const db = getDb();
  const storeId = new ObjectId(req.store!.id);

  if (typeof website === 'string' && website.trim()) {
    // Silently "succeed" so the bot has no signal to adapt on.
    res.status(201).json({ success: true, orderId: new ObjectId().toString() });
    return;
  }

  // Idempotency: a retried submit (double-click, back/forward, flaky network)
  // reuses the same key from the client, so replay it back instead of
  // creating a second order.
  if (cleanIdempotencyKey) {
    const existing = await db.collection('orders').findOne({ storeId, idempotencyKey: cleanIdempotencyKey });
    if (existing) {
      res.status(201).json({ success: true, orderId: existing._id.toString() });
      return;
    }
  }

  const product = await db.collection('products').findOne({ _id: new ObjectId(productId), storeId });
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  let resolvedVariantIndex: number | null = null;
  let variant: any = null;
  if (variants.length > 0) {
    const idx = Number(variantIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= variants.length) {
      res.status(400).json({ success: false, message: 'Invalid variant' });
      return;
    }
    resolvedVariantIndex = idx;
    variant = variants[idx];
    if (typeof variant.available === 'number' && variant.available < qty) {
      res.status(409).json({ success: false, message: 'Not enough stock available' });
      return;
    }
  }

  const shippingSettings = await getShippingSettings(storeId);
  const shippingOption = matchShippingOption(shippingSettings.options, shippingLabel);
  if (!shippingOption) {
    res.status(400).json({ success: false, message: 'Invalid shipping option' });
    return;
  }

  const unitPrice = typeof variant?.price === 'number' ? variant.price : typeof product.price === 'number' ? product.price : 0;
  const subtotal = unitPrice * qty;
  const total = subtotal + shippingOption.cost;

  // Atomically reserve stock: the filter re-checks available >= qty at write
  // time so two concurrent orders can't both succeed off a stale read.
  if (resolvedVariantIndex !== null) {
    const decremented = await db.collection('products').findOneAndUpdate(
      {
        _id: product._id,
        storeId,
        [`variants.${resolvedVariantIndex}.available`]: { $gte: qty },
      },
      { $inc: { [`variants.${resolvedVariantIndex}.available`]: -qty } },
    );
    if (!decremented) {
      res.status(409).json({ success: false, message: 'Not enough stock available' });
      return;
    }
  }

  let resolvedLandingPageId: ObjectId | null = null;
  if (typeof landingPageId === 'string' && ObjectId.isValid(landingPageId)) {
    resolvedLandingPageId = new ObjectId(landingPageId);
  }

  try {
    const result = await db.collection('orders').insertOne({
      storeId,
      landingPageId: resolvedLandingPageId,
      productId: product._id,
      variantIndex: resolvedVariantIndex,
      variantLabel: variant?.label ?? null,
      quantity: qty,
      customer: { name: cleanName, phone: cleanPhone, address: cleanAddress },
      shippingLabel: shippingOption.label,
      shippingCost: shippingOption.cost,
      subtotal,
      total,
      status: 'new',
      idempotencyKey: cleanIdempotencyKey,
      createdAt: new Date(),
    });
    // The client reuses its order idempotency key as the abandoned-checkout
    // draft key, so a successful order here means the draft converted —
    // remove it so it stops showing up as "abandoned".
    if (cleanIdempotencyKey) {
      await db.collection('abandoned_checkouts').deleteOne({ storeId, key: cleanIdempotencyKey });
    }
    res.status(201).json({ success: true, orderId: result.insertedId.toString() });
  } catch (err: any) {
    // Duplicate idempotencyKey raced in between the pre-check above and this
    // insert (two near-simultaneous retries) — the stock reservation above
    // already restored correctly since only the loser's insert failed here,
    // but the reserved units for the loser are now stuck decremented, so give
    // them back before replaying the winner's order.
    if (err?.code === 11000 && cleanIdempotencyKey) {
      if (resolvedVariantIndex !== null) {
        await db
          .collection('products')
          .updateOne({ _id: product._id, storeId }, { $inc: { [`variants.${resolvedVariantIndex}.available`]: qty } });
      }
      const existing = await db.collection('orders').findOne({ storeId, idempotencyKey: cleanIdempotencyKey });
      if (existing) {
        await db.collection('abandoned_checkouts').deleteOne({ storeId, key: cleanIdempotencyKey });
        res.status(201).json({ success: true, orderId: existing._id.toString() });
        return;
      }
    }
    throw err;
  }
});

// Autosaves an in-progress checkout as a "draft" once the shopper has typed a
// phone number, so a merchant can follow up if they leave without ordering.
// Upserted repeatedly (debounced client-side, plus a flush on tab-hide) keyed
// by the same idempotency key the client will eventually submit the real
// order with — that's how POST /:slug/orders knows which draft to delete
// once it converts into a real order.
// POST rather than PUT despite being an upsert — navigator.sendBeacon (used
// for the tab-hide flush below) can only issue POST requests, and this
// endpoint needs to work from both a normal fetch and a beacon.
router.post('/:slug/abandoned-checkout', abandonedCheckoutLimiter, async (req: StoreScopedRequest, res) => {
  const { key, productId, variantIndex, quantity, name, phone, address, shippingLabel, shippingCost } = req.body ?? {};

  if (typeof key !== 'string' || !key.trim()) {
    res.status(400).json({ success: false, message: 'Invalid key' });
    return;
  }
  if (typeof productId !== 'string' || !ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Invalid productId' });
    return;
  }
  const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, MAX_TEXT_LEN) : '';
  // The whole point of this endpoint is "they typed a phone number" — a
  // draft with no phone yet isn't useful to a merchant and isn't tracked.
  if (!cleanPhone) {
    res.status(204).end();
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const product = await db.collection('products').findOne({ _id: new ObjectId(productId), storeId });
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const idx = Number(variantIndex);
  const resolvedVariantIndex = variants.length > 0 && Number.isInteger(idx) && idx >= 0 && idx < variants.length ? idx : null;
  const variant = resolvedVariantIndex !== null ? variants[resolvedVariantIndex] : null;

  const qty = Number(quantity);
  const cleanQuantity = Number.isInteger(qty) && qty >= 1 && qty <= MAX_QUANTITY ? qty : 1;
  const cleanName = typeof name === 'string' ? name.trim().slice(0, MAX_TEXT_LEN) : '';
  const cleanAddress = typeof address === 'string' ? address.trim().slice(0, 2000) : '';
  const shippingSettings = await getShippingSettings(storeId);
  const shippingOption = matchShippingOption(shippingSettings.options, shippingLabel);

  const unitPrice = typeof variant?.price === 'number' ? variant.price : typeof product.price === 'number' ? product.price : 0;
  const subtotal = unitPrice * cleanQuantity;
  const total = subtotal + (shippingOption?.cost ?? 0);

  const now = new Date();
  await db.collection('abandoned_checkouts').updateOne(
    { storeId, key: key.trim().slice(0, MAX_IDEMPOTENCY_KEY_LEN) },
    {
      $set: {
        productId: product._id,
        variantIndex: resolvedVariantIndex,
        variantLabel: variant?.label ?? null,
        quantity: cleanQuantity,
        name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
        shippingLabel: shippingOption?.label ?? '',
        shippingCost: shippingOption?.cost ?? 0,
        subtotal,
        total,
        updatedAt: now,
      },
      $setOnInsert: { storeId, createdAt: now },
    },
    { upsert: true },
  );

  res.status(204).end();
});

// Public order-confirmation lookup — the link a shopper lands on right after
// checkout. Guessing a valid id is infeasible (24-hex ObjectId), same trust
// model as e.g. Shopify/Stripe confirmation URLs, so no additional auth is
// layered on top of "you have the id" + it belonging to this store.
router.get('/:slug/orders/:id', async (req: StoreScopedRequest, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid order id' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id), storeId });
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  const product = order.productId ? await db.collection('products').findOne({ _id: order.productId, storeId }) : null;
  const checkout = await getCheckoutSettings(storeId);

  res.json({
    success: true,
    order: {
      id: order._id.toString(),
      product: product
        ? { title: product.title, handle: product.handle ?? '', image: product.media?.[0]?.url ?? null }
        : { title: 'Item', handle: '', image: null },
      variantLabel: order.variantLabel ?? null,
      quantity: order.quantity,
      customer: order.customer,
      shippingLabel: order.shippingLabel,
      shippingCost: order.shippingCost,
      subtotal: order.subtotal,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    },
    checkout,
  });
});

function hashToBucket(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

function isWithinSchedule(doc: any): boolean {
  const now = Date.now();
  const publishAt = doc.schedule?.publishAt ? new Date(doc.schedule.publishAt).getTime() : null;
  const unpublishAt = doc.schedule?.unpublishAt ? new Date(doc.schedule.unpublishAt).getTime() : null;
  if (publishAt && now < publishAt) return false;
  if (unpublishAt && now > unpublishAt) return false;
  return true;
}

function serializeLandingPage(doc: any, themeDoc: any) {
  const themeId: LandingPageThemeId = LANDING_PAGE_THEME_IDS.includes(doc.themeId) ? doc.themeId : DEFAULT_LANDING_PAGE_THEME_ID;
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    sections: doc.published?.sections ?? [],
    publishedAt: doc.published?.publishedAt ?? null,
    themeId,
    globalSettings: themeDoc?.landingGlobalSettings?.[themeId] ?? null,
    seo: doc.seo ?? { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noindex: false },
    pixels: doc.pixels ?? { googleAnalyticsId: '', facebookPixelId: '', tiktokPixelId: '' },
    headCode: doc.headCode ?? '',
    audienceVariants: doc.audienceVariants ?? [],
    returningVisitorHeading: doc.returningVisitorHeading ?? '',
  };
}

router.get('/:slug/landing/:handle', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const [doc, themeDoc] = await Promise.all([
    db.collection('landing_pages').findOne({ storeId, slug: req.params.handle }),
    db.collection('store_themes').findOne({ storeId }),
  ]);

  if (!doc || doc.status !== 'published' || !doc.published?.sections || !isWithinSchedule(doc)) {
    res.status(404).json({ success: false, message: 'Landing page not found', unavailableRedirect: !!doc?.unavailableRedirect });
    return;
  }

  if (doc.passwordHash) {
    const password = typeof req.query.pw === 'string' ? req.query.pw : '';
    const valid = password ? await bcrypt.compare(password, doc.passwordHash) : false;
    if (!valid) {
      res.status(401).json({ success: false, passwordRequired: true, message: 'Password required' });
      return;
    }
  }

  // A/B split: the "A" page (isVariant=false with a linked variant) sends a
  // deterministic share of visitors to the B document's content instead,
  // keyed by a stable per-visitor id so the same browser always sees the
  // same variant. No cookies/sessions on the server — the client supplies it.
  let servedDoc = doc;
  if (doc.abTest?.variantOfId && !doc.abTest.isVariant) {
    const visitorId = typeof req.query.visitor === 'string' ? req.query.visitor : '';
    const bucket = hashToBucket(`${doc._id.toString()}:${visitorId || Math.random()}`);
    if (visitorId && bucket >= (doc.abTest.trafficWeight ?? 50)) {
      const variantDoc = await db.collection('landing_pages').findOne({ _id: new ObjectId(doc.abTest.variantOfId), storeId });
      if (variantDoc?.status === 'published' && variantDoc.published?.sections) {
        servedDoc = variantDoc;
      }
    }
  }

  setPublicCache(res);
  res.json({ success: true, ...serializeLandingPage(servedDoc, themeDoc), store: req.store });
});

// Records a pageview or conversion event for a landing page — public,
// unauthenticated, called from the storefront on load / CTA click. No
// external analytics service involved; a lightweight built-in counter.
router.post('/:slug/landing/:id/track', async (req: StoreScopedRequest, res) => {
  const { type, utmSource } = req.body ?? {};
  if (type !== 'view' && type !== 'conversion') {
    res.status(400).json({ success: false, message: 'type must be "view" or "conversion"' });
    return;
  }
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid id' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const landingPageId = new ObjectId(req.params.id);
  const doc = await db.collection('landing_pages').findOne({ _id: landingPageId, storeId });
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const field = type === 'view' ? 'views' : 'conversions';
  await db.collection('landing_pages').updateOne({ _id: landingPageId }, { $inc: { [`analyticsTotals.${field}`]: 1 } });

  const dateKey = new Date().toISOString().slice(0, 10);
  const inc: Record<string, number> = { [field]: 1 };
  if (typeof utmSource === 'string' && utmSource.trim()) {
    const safeKey = utmSource.trim().slice(0, 40).replace(/[.$]/g, '_');
    inc[`utm.${safeKey}`] = 1;
  }
  await db
    .collection('landing_page_analytics')
    .updateOne({ landingPageId, date: dateKey }, { $set: { storeId }, $inc: inc }, { upsert: true });

  res.status(201).json({ success: true });
});

// Staging preview for an unpublished (or updated-but-unpublished) landing
// page draft, gated by the same per-store share token as page previews.
router.get('/:slug/landing-preview/:handle', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  const themeDoc = await db.collection('store_themes').findOne({ storeId });
  if (!token || !themeDoc?.previewToken || token !== themeDoc.previewToken) {
    res.status(403).json({ success: false, message: 'Invalid preview token' });
    return;
  }

  const doc = await db.collection('landing_pages').findOne({ storeId, slug: req.params.handle });
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }
  const themeId: LandingPageThemeId = LANDING_PAGE_THEME_IDS.includes(doc.themeId) ? doc.themeId : DEFAULT_LANDING_PAGE_THEME_ID;

  res.json({
    success: true,
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    sections: doc.draft?.sections ?? [],
    themeId,
    globalSettings: themeDoc.landingGlobalSettings?.[themeId] ?? null,
    seo: doc.seo ?? { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noindex: false },
    pixels: doc.pixels ?? { googleAnalyticsId: '', facebookPixelId: '', tiktokPixelId: '' },
    headCode: doc.headCode ?? '',
    audienceVariants: doc.audienceVariants ?? [],
    returningVisitorHeading: doc.returningVisitorHeading ?? '',
    store: req.store,
  });
});

router.get('/:slug/theme', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const themeDoc = await db.collection('store_themes').findOne({ storeId });
  const activeThemeId = themeDoc?.activeThemeId ?? 'minimal';

  setPublicCache(res);
  res.json({
    success: true,
    themeId: activeThemeId,
    globalSettings: themeDoc?.globalSettings?.[activeThemeId] ?? null,
  });
});

// The one, store-wide checkout configuration every landing page's order
// form reads from (see checkoutSettingsRoutes.ts for the admin editor).
router.get('/:slug/checkout-settings', async (req: StoreScopedRequest, res) => {
  const storeId = new ObjectId(req.store!.id);
  const settings = await getCheckoutSettings(storeId);
  res.json({ success: true, settings });
});

// The one, store-wide set of delivery zones/rates every checkout surface
// reads from (see shippingSettingsRoutes.ts for the admin editor).
router.get('/:slug/shipping-settings', async (req: StoreScopedRequest, res) => {
  const storeId = new ObjectId(req.store!.id);
  const settings = await getShippingSettings(storeId);
  res.json({ success: true, settings });
});

router.get('/:slug/products', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const products = await db
    .collection('products')
    .find({ storeId }, { projection: PRODUCT_SUMMARY_PROJECTION })
    .sort({ createdAt: -1 })
    .limit(PRODUCT_LIST_LIMIT)
    .toArray();

  setPublicCache(res);
  res.json({ success: true, products: products.map(serializeProductSummary) });
});

router.get('/:slug/products/:handle', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const product = await db.collection('products').findOne({ storeId, handle: req.params.handle });

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  setPublicCache(res);
  res.json({ success: true, product: serializeProductSummary(product) });
});

router.get('/:slug/collections', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const collections = await db.collection('collections').find({ storeId }).sort({ name: 1 }).toArray();

  setPublicCache(res);
  res.json({
    success: true,
    collections: collections.map((c) => ({ id: c._id.toString(), name: c.name, handle: c.handle ?? '' })),
  });
});

router.get('/:slug/collections/:handle', async (req: StoreScopedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.store!.id);
  const collection = await db.collection('collections').findOne({ storeId, handle: req.params.handle });

  if (!collection) {
    res.status(404).json({ success: false, message: 'Collection not found' });
    return;
  }

  const products = await db
    .collection('products')
    .find({ storeId, collections: collection._id.toString() }, { projection: PRODUCT_SUMMARY_PROJECTION })
    .sort({ createdAt: -1 })
    .limit(PRODUCT_LIST_LIMIT)
    .toArray();

  setPublicCache(res);
  res.json({
    success: true,
    collection: {
      id: collection._id.toString(),
      name: collection.name,
      handle: collection.handle ?? '',
    },
    products: products.map(serializeProductSummary),
  });
});

export default router;
