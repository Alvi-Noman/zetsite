import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';
import { createUniqueHandle } from '../utils/slugify.js';
import { serializeSections, buildSectionsField, MAX_REVISIONS } from '../utils/sectionValidation.js';
import { buildNativeLandingPage, applyAiBriefToProductLaunchSections, applyAiBriefToLookbookSections, lintSectionOrder, buildChecklist, type NativeSection } from '../services/nativeLandingPageBuilder.js';
import { enhanceLandingPageContent } from '../services/aiContentEnhancer.js';
import { generateLandingPageFromDescription } from '../services/aiSectionGenerator.js';
import { getOrCreateProductAiBrief } from '../services/productAiBriefGenerator.js';
import { getOrCreateLookbookAiBrief } from '../services/lookbookAiBriefGenerator.js';
import type { GenerationStyle, LandingPageSeo, LandingPageThemeId } from '@zetsite/shared';
import { LANDING_PAGE_THEME_IDS, DEFAULT_LANDING_PAGE_THEME_ID } from '@zetsite/shared/landingThemes';

const router: RouterType = Router();

const LANDING_THEME_IDS = new Set<LandingPageThemeId>(LANDING_PAGE_THEME_IDS);
const GENERATION_STYLES = new Set<GenerationStyle>(['direct-response', 'storytelling', 'minimal']);

const DEFAULT_SEO: LandingPageSeo = { metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', noindex: false };
const DEFAULT_PIXELS = { googleAnalyticsId: '', facebookPixelId: '', tiktokPixelId: '' };
const DEFAULT_SCHEDULE = { publishAt: null, unpublishAt: null };
const DEFAULT_AB = { variantOfId: null, isVariant: false, trafficWeight: 50 };

function isOutOfStock(product: any): boolean {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length === 0) return false;
  return variants.every((v: any) => (v.available ?? 0) <= 0);
}

function countImages(sections: any[]): number {
  let count = 0;
  for (const s of sections ?? []) {
    if (typeof s.settings?.imageUrl === 'string' && s.settings.imageUrl) count += 1;
    for (const b of s.blocks ?? []) {
      if (typeof b.settings?.imageUrl === 'string' && b.settings.imageUrl) count += 1;
      if (typeof b.settings?.url === 'string' && b.settings.url && (b.type === 'image' || b.type === 'galleryImage')) count += 1;
    }
  }
  return count;
}

function serializeSummary(doc: any) {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    status: doc.status,
    themeId: doc.themeId,
    sourceProductId: doc.sourceProductId ? doc.sourceProductId.toString() : null,
    generation: doc.generation ?? null,
    updatedAt: doc.updatedAt,
    pinned: !!doc.pinned,
    tags: doc.tags ?? [],
    passwordProtected: !!doc.passwordHash,
    schedule: doc.schedule ?? DEFAULT_SCHEDULE,
    abTest: doc.abTest ?? DEFAULT_AB,
    analytics: { views: doc.analyticsTotals?.views ?? 0, conversions: doc.analyticsTotals?.conversions ?? 0 },
    sectionCount: Array.isArray(doc.draft?.sections) ? doc.draft.sections.length : 0,
    imageCount: countImages(doc.draft?.sections ?? []),
  };
}

async function findOwnedLandingPage(storeId: ObjectId, id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = getDb();
  return db.collection('landing_pages').findOne({ _id: new ObjectId(id), storeId });
}

function newDocDefaults() {
  return {
    seo: { ...DEFAULT_SEO },
    pixels: { ...DEFAULT_PIXELS },
    headCode: '',
    pinned: false,
    tags: [] as string[],
    passwordHash: null as string | null,
    schedule: { ...DEFAULT_SCHEDULE },
    abTest: { ...DEFAULT_AB },
    audienceVariants: [] as { utmSource: string; heroHeading: string }[],
    returningVisitorHeading: '',
    unavailableRedirect: false,
    analyticsTotals: { views: 0, conversions: 0 },
  };
}

// --- List --------------------------------------------------------------------

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const query: Record<string, unknown> = { storeId };

  if (typeof req.query.productId === 'string' && ObjectId.isValid(req.query.productId)) {
    query.sourceProductId = new ObjectId(req.query.productId);
  }
  if (typeof req.query.status === 'string' && ['draft', 'published', 'archived'].includes(req.query.status)) {
    query.status = req.query.status;
  } else {
    query.status = { $ne: 'archived' };
  }
  if (typeof req.query.tag === 'string' && req.query.tag) {
    query.tags = req.query.tag;
  }
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const term = req.query.search.trim();
    query.$or = [{ title: { $regex: term, $options: 'i' } }, { slug: { $regex: term, $options: 'i' } }];
  }

  const sortParam = typeof req.query.sort === 'string' ? req.query.sort : 'updatedAt';
  const sort: Record<string, 1 | -1> =
    sortParam === 'created' ? { createdAt: -1 } : sortParam === 'views' ? { 'analyticsTotals.views': -1 } : { updatedAt: -1 };

  const docs = await db
    .collection('landing_pages')
    .find(query)
    .sort({ pinned: -1, ...sort })
    .toArray();

  res.json({ success: true, landingPages: docs.map(serializeSummary) });
});

// --- Generate (native builder + optional AI enhancement) -------------------

router.post('/generate', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { productId, themeId, style } = req.body ?? {};
  if (typeof productId !== 'string' || !ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'productId is required' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const product = await db.collection('products').findOne({ _id: new ObjectId(productId), storeId });
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  const generationStyle: GenerationStyle = GENERATION_STYLES.has(style) ? style : 'direct-response';
  const existingForProduct = await db.collection('landing_pages').findOne({ storeId, sourceProductId: product._id, status: { $ne: 'archived' } });

  const created = await generateForProduct(db, storeId, req.user!.id, product, {
    themeId: LANDING_THEME_IDS.has(themeId) ? themeId : DEFAULT_LANDING_PAGE_THEME_ID,
    style: generationStyle,
  });

  res.status(201).json({ success: true, id: created.id, slug: created.slug, duplicateOfId: existingForProduct?._id.toString() ?? null });
});

// --- Generate from a free-text description (structural AI generator) ------

router.post('/generate-from-description', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { description, themeId, title } = req.body ?? {};
  if (typeof description !== 'string' || !description.trim()) {
    res.status(400).json({ success: false, message: 'description is required' });
    return;
  }
  if (description.length > 4000) {
    res.status(400).json({ success: false, message: 'description must be 4000 characters or fewer' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const resolvedThemeId: LandingPageThemeId = LANDING_THEME_IDS.has(themeId) ? themeId : DEFAULT_LANDING_PAGE_THEME_ID;

  const now = new Date();
  const result = await generateLandingPageFromDescription(description.trim(), 'advertorial');

  let validatedSections: ReturnType<typeof buildSectionsField>;
  try {
    validatedSections = buildSectionsField({ sections: result.sections });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
    return;
  }

  const resolvedTitle = typeof title === 'string' && title.trim() ? title.trim() : result.title;
  const slug = await createUniqueHandle(db, 'landing_pages', storeId, resolvedTitle, undefined, 'slug');

  const doc = {
    storeId,
    slug,
    title: resolvedTitle,
    status: 'draft' as const,
    sourceProductId: null,
    themeId: resolvedThemeId,
    draft: { sections: validatedSections, updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as unknown[],
    generation: {
      status: result.status,
      model: result.model,
      startedAt: now,
      completedAt: new Date(),
      style: undefined,
      omittedSections: [] as string[],
      source: 'description' as const,
    },
    ...newDocDefaults(),
    seo: { ...DEFAULT_SEO, metaTitle: result.seo.metaTitle, metaDescription: result.seo.metaDescription },
    createdAt: now,
    updatedAt: now,
  };

  const insertResult = await db.collection('landing_pages').insertOne(doc);
  res.status(201).json({ success: true, id: insertResult.insertedId.toString(), slug: doc.slug });
});

// Shared by /generate and /bulk-generate.
async function generateForProduct(
  db: ReturnType<typeof getDb>,
  storeId: ObjectId,
  userId: string,
  product: any,
  opts: { themeId: LandingPageThemeId; style: GenerationStyle },
) {
  const now = new Date();
  const { sections: nativeSections, omittedSections, seo, checklist } = await buildNativeLandingPage(
    {
      title: product.title,
      handle: product.handle ?? '',
      description: product.description ?? '',
      media: product.media ?? [],
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      variants: product.variants ?? [],
      collections: (product.collections ?? []).map((c: unknown) => String(c)),
    },
    { style: opts.style, themeId: opts.themeId },
  );

  let finalSections: NativeSection[] = nativeSections;
  let generationStatus: 'native' | 'ai-enhanced' | 'ai-partial' = 'native';
  let model: string | undefined;
  let generationError: string | undefined;

  if (opts.themeId === 'product-launch') {
    // Problem Solver theme: a single cached product brief (hero framing,
    // features/benefits, problem/solution, how-it-works, testimonials, faq)
    // replaces the generic hardcoded copy from buildProductLaunchSections,
    // instead of the field-by-field rewrite enhanceLandingPageContent does
    // for other themes.
    try {
      const brief = await getOrCreateProductAiBrief(db, product);
      if (brief) {
        finalSections = applyAiBriefToProductLaunchSections(nativeSections, brief);
        const anyExtracted =
          brief.featuresAndBenefits.source === 'extracted' ||
          brief.problemSolution.source === 'extracted' ||
          brief.howItWorks.source === 'extracted' ||
          brief.faq.source === 'extracted';
        generationStatus = anyExtracted ? 'ai-enhanced' : 'ai-partial';
        model = brief.model;
      }
    } catch (err) {
      generationError = (err as Error).message;
    }
  } else if (opts.themeId === 'lookbook') {
    // Lookbook theme: a cached brief (aspirational hero, key features,
    // materials & craftsmanship, lifestyle story, what's-in-the-box,
    // testimonials, closing CTA) replaces buildLookbookSections' generic
    // placeholder copy. Size & fit guide and swatches are left as-is —
    // real measurements aren't something AI should fabricate.
    try {
      const brief = await getOrCreateLookbookAiBrief(db, product);
      if (brief) {
        finalSections = applyAiBriefToLookbookSections(nativeSections, brief);
        const anyExtracted = brief.keyFeatures.source === 'extracted' || brief.materials.source === 'extracted' || brief.whatsInBox.source === 'extracted';
        generationStatus = anyExtracted ? 'ai-enhanced' : 'ai-partial';
        model = brief.model;
      }
    } catch (err) {
      generationError = (err as Error).message;
    }
  } else {
    try {
      const enhanced = await enhanceLandingPageContent(nativeSections, {
        title: product.title,
        description: product.description ?? '',
        category: product.category ?? '',
        price: product.price,
      });
      if (enhanced) {
        finalSections = enhanced.sections;
        generationStatus = enhanced.status;
        model = enhanced.model;
      }
    } catch (err) {
      generationError = (err as Error).message;
    }
  }

  const validatedSections = buildSectionsField({ sections: finalSections });
  const slug = await createUniqueHandle(db, 'landing_pages', storeId, product.title, undefined, 'slug');

  const doc = {
    storeId,
    slug,
    title: product.title,
    status: 'draft' as const,
    sourceProductId: product._id,
    themeId: opts.themeId,
    draft: { sections: validatedSections, updatedAt: now, updatedBy: new ObjectId(userId) },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as unknown[],
    generation: {
      status: generationStatus,
      model,
      startedAt: now,
      completedAt: new Date(),
      error: generationError,
      style: opts.style,
      omittedSections,
    },
    ...newDocDefaults(),
    seo: { ...DEFAULT_SEO, metaTitle: seo.metaTitle, metaDescription: seo.metaDescription, ogImage: seo.ogImage },
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('landing_pages').insertOne(doc);
  return { id: result.insertedId.toString(), slug: doc.slug, checklist };
}

router.post('/bulk-generate', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { productIds, collectionId, themeId, style } = req.body ?? {};
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);

  let ids: string[] = Array.isArray(productIds) ? productIds.filter((id) => typeof id === 'string' && ObjectId.isValid(id)) : [];
  if (typeof collectionId === 'string' && ObjectId.isValid(collectionId)) {
    const collectionProducts = await db
      .collection('products')
      .find({ storeId, collections: collectionId })
      .toArray();
    ids = [...ids, ...collectionProducts.map((p) => p._id.toString())];
  }
  ids = [...new Set(ids)];

  if (ids.length === 0) {
    res.status(400).json({ success: false, message: 'No products to generate from' });
    return;
  }

  const resolvedThemeId: LandingPageThemeId = LANDING_THEME_IDS.has(themeId) ? themeId : DEFAULT_LANDING_PAGE_THEME_ID;
  const generationStyle: GenerationStyle = GENERATION_STYLES.has(style) ? style : 'direct-response';

  const results: { productId: string; id?: string; slug?: string; error?: string }[] = [];
  for (const id of ids) {
    const product = await db.collection('products').findOne({ _id: new ObjectId(id), storeId });
    if (!product) {
      results.push({ productId: id, error: 'Product not found' });
      continue;
    }
    try {
      const created = await generateForProduct(db, storeId, req.user!.id, product, { themeId: resolvedThemeId, style: generationStyle });
      results.push({ productId: id, id: created.id, slug: created.slug });
    } catch (err) {
      results.push({ productId: id, error: (err as Error).message });
    }
  }

  res.status(201).json({ success: true, results });
});

// --- Manual create -----------------------------------------------------------

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { title, themeId, sections } = req.body ?? {};
  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ success: false, message: 'title is required' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const resolvedThemeId: LandingPageThemeId = LANDING_THEME_IDS.has(themeId) ? themeId : DEFAULT_LANDING_PAGE_THEME_ID;
  const slug = await createUniqueHandle(db, 'landing_pages', storeId, title, undefined, 'slug');
  const now = new Date();

  let validatedSections: ReturnType<typeof buildSectionsField> = [];
  if (sections !== undefined) {
    try {
      validatedSections = buildSectionsField({ sections });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
      return;
    }
  }

  const doc = {
    storeId,
    slug,
    title: title.trim(),
    status: 'draft' as const,
    sourceProductId: null,
    themeId: resolvedThemeId,
    draft: { sections: validatedSections, updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as unknown[],
    generation: null,
    ...newDocDefaults(),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('landing_pages').insertOne(doc);
  res.status(201).json({ success: true, id: result.insertedId.toString(), slug: doc.slug });
});

// --- Templates -----------------------------------------------------------------

router.get('/templates', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const templates = await db.collection('landing_page_templates').find({ storeId }).sort({ createdAt: -1 }).toArray();
  res.json({
    success: true,
    templates: templates.map((t) => ({ id: t._id.toString(), name: t.name, themeId: t.themeId, sectionCount: t.sections?.length ?? 0 })),
  });
});

router.post('/:id/save-as-template', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }
  const name = typeof req.body?.name === 'string' && req.body.name.trim() ? req.body.name.trim() : doc.title;

  const db = getDb();
  const result = await db.collection('landing_page_templates').insertOne({
    storeId,
    name,
    themeId: doc.themeId,
    sections: doc.draft?.sections ?? [],
    createdAt: new Date(),
  });
  res.status(201).json({ success: true, id: result.insertedId.toString() });
});

router.post('/from-template', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { templateId, title } = req.body ?? {};
  if (typeof templateId !== 'string' || !ObjectId.isValid(templateId)) {
    res.status(400).json({ success: false, message: 'templateId is required' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const template = await db.collection('landing_page_templates').findOne({ _id: new ObjectId(templateId), storeId });
  if (!template) {
    res.status(404).json({ success: false, message: 'Template not found' });
    return;
  }

  const resolvedTitle = typeof title === 'string' && title.trim() ? title.trim() : template.name;
  const slug = await createUniqueHandle(db, 'landing_pages', storeId, resolvedTitle, undefined, 'slug');
  const now = new Date();

  const doc = {
    storeId,
    slug,
    title: resolvedTitle,
    status: 'draft' as const,
    sourceProductId: null,
    themeId: template.themeId ?? DEFAULT_LANDING_PAGE_THEME_ID,
    draft: { sections: buildSectionsField({ sections: template.sections ?? [] }), updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as unknown[],
    generation: null,
    ...newDocDefaults(),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('landing_pages').insertOne(doc);
  res.status(201).json({ success: true, id: result.insertedId.toString(), slug: doc.slug });
});

// --- Bulk actions --------------------------------------------------------------

router.post('/bulk', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { ids, action } = req.body ?? {};
  if (!Array.isArray(ids) || ids.length === 0 || typeof action !== 'string') {
    res.status(400).json({ success: false, message: 'ids and action are required' });
    return;
  }

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const objectIds = ids.filter((id: string) => ObjectId.isValid(id)).map((id: string) => new ObjectId(id));
  const filter = { _id: { $in: objectIds }, storeId };

  if (action === 'delete') {
    await db.collection('landing_pages').deleteMany(filter);
  } else if (action === 'archive') {
    await db.collection('landing_pages').updateMany(filter, { $set: { status: 'archived', updatedAt: new Date() } });
  } else if (action === 'restore') {
    await db.collection('landing_pages').updateMany(filter, { $set: { status: 'draft', updatedAt: new Date() } });
  } else if (action === 'publish') {
    const docs = await db.collection('landing_pages').find(filter).toArray();
    for (const doc of docs) {
      await db.collection('landing_pages').updateOne(
        { _id: doc._id },
        { $set: { status: 'published', published: { sections: serializeSections(doc.draft?.sections), publishedAt: new Date(), publishedBy: new ObjectId(req.user!.id) }, updatedAt: new Date() } },
      );
    }
  } else if (action === 'unpublish') {
    await db.collection('landing_pages').updateMany(filter, { $set: { status: 'draft', updatedAt: new Date() } });
  } else {
    res.status(400).json({ success: false, message: 'Unknown action' });
    return;
  }

  res.json({ success: true });
});

// --- Draft -------------------------------------------------------------------

router.get('/:id/draft', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const db = getDb();
  let productOutOfStock = false;
  let sourceProductHandle: string | null = null;
  if (doc.sourceProductId) {
    const product = await db.collection('products').findOne({ _id: doc.sourceProductId });
    productOutOfStock = isOutOfStock(product);
    sourceProductHandle = product?.handle ?? null;
  }

  const plainSections = (doc.draft?.sections ?? []).map((s: any) => ({ type: s.type, settings: s.settings, blocks: s.blocks }));
  const orderLint = lintSectionOrder(plainSections);
  const checklist = buildChecklist(plainSections);

  res.json({
    success: true,
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    status: doc.status,
    themeId: doc.themeId,
    sections: serializeSections(doc.draft?.sections),
    generation: doc.generation ?? null,
    updatedAt: doc.draft?.updatedAt ?? null,
    seo: doc.seo ?? DEFAULT_SEO,
    pixels: doc.pixels ?? DEFAULT_PIXELS,
    headCode: doc.headCode ?? '',
    pinned: !!doc.pinned,
    tags: doc.tags ?? [],
    passwordProtected: !!doc.passwordHash,
    schedule: doc.schedule ?? DEFAULT_SCHEDULE,
    abTest: doc.abTest ?? DEFAULT_AB,
    audienceVariants: doc.audienceVariants ?? [],
    returningVisitorHeading: doc.returningVisitorHeading ?? '',
    unavailableRedirect: !!doc.unavailableRedirect,
    productOutOfStock,
    sourceProductHandle,
    orderWarnings: orderLint.warnings,
    checklist,
    analytics: { views: doc.analyticsTotals?.views ?? 0, conversions: doc.analyticsTotals?.conversions ?? 0 },
  });
});

router.put('/:id/draft', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const existing = await findOwnedLandingPage(storeId, req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  try {
    const sections = buildSectionsField(req.body);
    const db = getDb();
    const now = new Date();

    const setFields: Record<string, unknown> = {
      draft: { sections, updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
      updatedAt: now,
    };
    if (typeof req.body.title === 'string' && req.body.title.trim()) setFields.title = req.body.title.trim();
    if (typeof req.body.themeId === 'string' && LANDING_THEME_IDS.has(req.body.themeId as LandingPageThemeId)) setFields.themeId = req.body.themeId;
    if (req.body.seo && typeof req.body.seo === 'object') {
      setFields.seo = {
        metaTitle: String(req.body.seo.metaTitle ?? ''),
        metaDescription: String(req.body.seo.metaDescription ?? ''),
        ogImage: String(req.body.seo.ogImage ?? ''),
        canonicalUrl: String(req.body.seo.canonicalUrl ?? ''),
        noindex: !!req.body.seo.noindex,
      };
    }
    if (req.body.pixels && typeof req.body.pixels === 'object') {
      setFields.pixels = {
        googleAnalyticsId: String(req.body.pixels.googleAnalyticsId ?? ''),
        facebookPixelId: String(req.body.pixels.facebookPixelId ?? ''),
        tiktokPixelId: String(req.body.pixels.tiktokPixelId ?? ''),
      };
    }
    if (typeof req.body.headCode === 'string') setFields.headCode = req.body.headCode.slice(0, 10000);
    if (typeof req.body.pinned === 'boolean') setFields.pinned = req.body.pinned;
    if (Array.isArray(req.body.tags)) setFields.tags = req.body.tags.filter((t: unknown) => typeof t === 'string').slice(0, 20);
    if (req.body.schedule && typeof req.body.schedule === 'object') {
      setFields.schedule = {
        publishAt: typeof req.body.schedule.publishAt === 'string' ? req.body.schedule.publishAt : null,
        unpublishAt: typeof req.body.schedule.unpublishAt === 'string' ? req.body.schedule.unpublishAt : null,
      };
    }
    if (Array.isArray(req.body.audienceVariants)) {
      setFields.audienceVariants = req.body.audienceVariants
        .filter((v: any) => v && typeof v.utmSource === 'string' && typeof v.heroHeading === 'string')
        .slice(0, 10);
    }
    if (typeof req.body.returningVisitorHeading === 'string') {
      setFields.returningVisitorHeading = req.body.returningVisitorHeading.slice(0, 200);
    }
    if (typeof req.body.unavailableRedirect === 'boolean') setFields.unavailableRedirect = req.body.unavailableRedirect;

    await db.collection('landing_pages').updateOne({ _id: existing._id }, { $set: setFields });
    res.json({ success: true, sections });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

// --- Pin (lightweight — doesn't require resending sections, unlike /draft) ----

router.put('/:id/pin', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const existing = await findOwnedLandingPage(storeId, req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }
  const pinned = !!req.body?.pinned;
  const db = getDb();
  await db.collection('landing_pages').updateOne({ _id: existing._id }, { $set: { pinned, updatedAt: new Date() } });
  res.json({ success: true, pinned });
});

// --- Password protection -------------------------------------------------------

router.put('/:id/password', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const existing = await findOwnedLandingPage(storeId, req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const { password } = req.body ?? {};
  const db = getDb();
  if (typeof password === 'string' && password.length > 0) {
    const hash = await bcrypt.hash(password, 10);
    await db.collection('landing_pages').updateOne({ _id: existing._id }, { $set: { passwordHash: hash, updatedAt: new Date() } });
  } else {
    await db.collection('landing_pages').updateOne({ _id: existing._id }, { $set: { passwordHash: null, updatedAt: new Date() } });
  }
  res.json({ success: true, passwordProtected: typeof password === 'string' && password.length > 0 });
});

// --- Enhance an existing (native) draft with AI, in place ---------------------

router.post('/:id/enhance', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }
  if (!doc.sourceProductId) {
    res.status(400).json({ success: false, message: 'AI enhancement requires the page to be linked to a product' });
    return;
  }

  const db = getDb();
  const product = await db.collection('products').findOne({ _id: doc.sourceProductId, storeId });
  if (!product) {
    res.status(404).json({ success: false, message: 'Source product no longer exists' });
    return;
  }

  const currentSections = serializeSections(doc.draft?.sections);
  const enhanced = await enhanceLandingPageContent(
    currentSections.map((s) => ({ type: s.type, settings: s.settings, blocks: s.blocks?.map((b) => ({ type: b.type, settings: b.settings })) })),
    { title: product.title, description: product.description ?? '', category: product.category ?? '', price: product.price },
  );

  if (!enhanced) {
    res.status(502).json({ success: false, message: 'AI enhancement is unavailable right now (missing API key or request failed)' });
    return;
  }

  const validatedSections = buildSectionsField({ sections: enhanced.sections });
  const now = new Date();
  const generation = {
    ...(doc.generation ?? { omittedSections: [] }),
    status: enhanced.status,
    model: enhanced.model,
    completedAt: now,
    error: undefined,
  };

  await db.collection('landing_pages').updateOne(
    { _id: doc._id },
    {
      $set: {
        draft: { sections: validatedSections, updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
        generation,
        updatedAt: now,
      },
    },
  );

  res.json({ success: true, sections: validatedSections, generation });
});

// --- Slug --------------------------------------------------------------------

router.put('/:id/slug', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const existing = await findOwnedLandingPage(storeId, req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const { slug } = req.body ?? {};
  if (typeof slug !== 'string' || !slug.trim()) {
    res.status(400).json({ success: false, message: 'slug is required' });
    return;
  }

  const normalized = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!normalized) {
    res.status(400).json({ success: false, message: 'slug is invalid' });
    return;
  }

  const db = getDb();
  const conflict = await db.collection('landing_pages').findOne({ storeId, slug: normalized, _id: { $ne: existing._id } });
  if (conflict) {
    res.status(409).json({ success: false, message: 'That slug is already in use' });
    return;
  }

  await db.collection('landing_pages').updateOne({ _id: existing._id }, { $set: { slug: normalized, updatedAt: new Date() } });
  res.json({ success: true, slug: normalized });
});

// --- Publish / published / revisions ------------------------------------------

router.post('/:id/publish', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const label = typeof req.body?.label === 'string' ? req.body.label.trim().slice(0, 80) : undefined;
  const db = getDb();
  const now = new Date();
  const userId = new ObjectId(req.user!.id);
  const publishedSections = serializeSections(doc.draft?.sections);

  const revisions = Array.isArray(doc.revisions) ? doc.revisions : [];
  if (doc.published?.sections) {
    revisions.unshift({
      sections: doc.published.sections,
      publishedAt: doc.published.publishedAt,
      publishedBy: doc.published.publishedBy ?? null,
      label: doc.published.label,
    });
  }
  const trimmedRevisions = revisions.slice(0, MAX_REVISIONS);

  await db.collection('landing_pages').updateOne(
    { _id: doc._id },
    {
      $set: {
        status: 'published',
        published: { sections: publishedSections, publishedAt: now, publishedBy: userId, label },
        revisions: trimmedRevisions,
        updatedAt: now,
      },
    },
  );

  res.json({ success: true, sections: publishedSections, publishedAt: now });
});

router.get('/:id/published', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  res.json({
    success: true,
    sections: serializeSections(doc.published?.sections),
    publishedAt: doc.published?.publishedAt ?? null,
  });
});

router.get('/:id/revisions', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const revisions = Array.isArray(doc.revisions) ? doc.revisions : [];
  res.json({
    success: true,
    revisions: revisions.map((r: any, index: number) => ({
      index,
      publishedAt: r.publishedAt,
      label: r.label ?? null,
      sectionCount: Array.isArray(r.sections) ? r.sections.length : 0,
    })),
  });
});

// Section-level diff between the current draft and a past revision — which
// section types were added/removed, so a merchant can see what changed
// without reading raw JSON.
router.get('/:id/revisions/:index/diff', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const revisions = Array.isArray(doc.revisions) ? doc.revisions : [];
  const revision = revisions[Number(req.params.index)];
  if (!revision) {
    res.status(404).json({ success: false, message: 'Revision not found' });
    return;
  }

  const currentTypes: string[] = (doc.draft?.sections ?? []).map((s: any) => s.type);
  const revisionTypes: string[] = (revision.sections ?? []).map((s: any) => s.type);

  const added = currentTypes.filter((t) => !revisionTypes.includes(t));
  const removed = revisionTypes.filter((t) => !currentTypes.includes(t));
  const countChanged = currentTypes.length !== revisionTypes.length;

  res.json({ success: true, added, removed, countChanged, currentCount: currentTypes.length, revisionCount: revisionTypes.length });
});

router.post('/:id/revisions/:index/restore', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const revisions = Array.isArray(doc.revisions) ? doc.revisions : [];
  const revision = revisions[Number(req.params.index)];
  if (!revision) {
    res.status(404).json({ success: false, message: 'Revision not found' });
    return;
  }

  const db = getDb();
  const now = new Date();
  await db.collection('landing_pages').updateOne(
    { _id: doc._id },
    { $set: { draft: { sections: revision.sections, updatedAt: now, updatedBy: new ObjectId(req.user!.id) }, updatedAt: now } },
  );

  res.json({ success: true, sections: revision.sections });
});

// --- Archive / restore / duplicate / delete ------------------------------------

router.post('/:id/archive', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }
  const db = getDb();
  await db.collection('landing_pages').updateOne({ _id: doc._id }, { $set: { status: 'archived', updatedAt: new Date() } });
  res.json({ success: true });
});

router.post('/:id/restore', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }
  const db = getDb();
  await db.collection('landing_pages').updateOne({ _id: doc._id }, { $set: { status: 'draft', updatedAt: new Date() } });
  res.json({ success: true });
});

router.post('/:id/duplicate', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const db = getDb();
  const now = new Date();
  const title = `${doc.title} (copy)`;
  const slug = await createUniqueHandle(db, 'landing_pages', storeId, title, undefined, 'slug');

  const copy = {
    storeId,
    slug,
    title,
    status: 'draft' as const,
    sourceProductId: doc.sourceProductId ?? null,
    themeId: doc.themeId,
    draft: { sections: doc.draft?.sections ?? [], updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as unknown[],
    generation: null,
    ...newDocDefaults(),
    seo: doc.seo ?? DEFAULT_SEO,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('landing_pages').insertOne(copy);
  res.status(201).json({ success: true, id: result.insertedId.toString(), slug: copy.slug });
});

router.post('/:id/duplicate-theme', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const otherTheme: LandingPageThemeId = doc.themeId === 'lookbook' ? 'product-launch' : 'lookbook';
  const db = getDb();
  const now = new Date();
  const title = `${doc.title} (${otherTheme})`;
  const slug = await createUniqueHandle(db, 'landing_pages', storeId, title, undefined, 'slug');

  const copy = {
    storeId,
    slug,
    title,
    status: 'draft' as const,
    sourceProductId: doc.sourceProductId ?? null,
    themeId: otherTheme,
    draft: { sections: doc.draft?.sections ?? [], updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as unknown[],
    generation: null,
    ...newDocDefaults(),
    seo: doc.seo ?? DEFAULT_SEO,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('landing_pages').insertOne(copy);
  res.status(201).json({ success: true, id: result.insertedId.toString(), slug: copy.slug, themeId: otherTheme });
});

router.post('/:id/ab-variant', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const db = getDb();
  const now = new Date();
  const title = `${doc.title} (Variant B)`;
  const slug = await createUniqueHandle(db, 'landing_pages', storeId, title, undefined, 'slug');

  const variant = {
    storeId,
    slug,
    title,
    status: 'draft' as const,
    sourceProductId: doc.sourceProductId ?? null,
    themeId: doc.themeId,
    draft: { sections: doc.draft?.sections ?? [], updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as unknown[],
    generation: null,
    ...newDocDefaults(),
    seo: doc.seo ?? DEFAULT_SEO,
    abTest: { variantOfId: doc._id.toString(), isVariant: true, trafficWeight: 50 },
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection('landing_pages').insertOne(variant);
  // Mark the original as the "A" side of a pair, if not already linked.
  if (!doc.abTest?.variantOfId) {
    await db.collection('landing_pages').updateOne(
      { _id: doc._id },
      { $set: { abTest: { variantOfId: result.insertedId.toString(), isVariant: false, trafficWeight: 50 } } },
    );
  }

  res.status(201).json({ success: true, id: result.insertedId.toString(), slug: variant.slug });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const db = getDb();
  await db.collection('landing_pages').deleteOne({ _id: doc._id });
  res.json({ success: true });
});

// --- Analytics (authenticated summary) ------------------------------------------

router.get('/:id/analytics', requireAuth, async (req: AuthenticatedRequest, res) => {
  const storeId = new ObjectId(req.user!.storeId);
  const doc = await findOwnedLandingPage(storeId, req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Landing page not found' });
    return;
  }

  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - 13);
  const sinceKey = since.toISOString().slice(0, 10);

  const daily = await db
    .collection('landing_page_analytics')
    .find({ landingPageId: doc._id, date: { $gte: sinceKey } })
    .sort({ date: 1 })
    .toArray();

  const dailyMap = new Map(daily.map((d) => [d.date, { views: d.views ?? 0, conversions: d.conversions ?? 0 }]));
  const series: { date: string; views: number; conversions: number }[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, ...(dailyMap.get(key) ?? { views: 0, conversions: 0 }) });
  }

  const utmTotals: Record<string, number> = {};
  for (const d of daily) {
    for (const [source, count] of Object.entries(d.utm ?? {})) {
      utmTotals[source] = (utmTotals[source] ?? 0) + (count as number);
    }
  }

  const views = doc.analyticsTotals?.views ?? 0;
  const conversions = doc.analyticsTotals?.conversions ?? 0;

  res.json({
    success: true,
    views,
    conversions,
    conversionRate: views > 0 ? conversions / views : 0,
    daily: series,
    utm: utmTotals,
  });
});

export default router;
