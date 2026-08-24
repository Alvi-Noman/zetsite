import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';
import type { PageSection } from '@zetsite/shared';
import { serializeSections, buildSectionsField, buildMeta, MAX_REVISIONS } from '../utils/sectionValidation.js';

const router: RouterType = Router();

const ALLOWED_PAGES = new Set(['home', 'popup']);

async function getOrCreatePage(storeId: ObjectId, page: string) {
  const db = getDb();
  const existing = await db.collection('pages').findOne({ storeId, page });
  if (existing) return existing;

  const now = new Date();
  const doc = {
    storeId,
    page,
    draft: { sections: [], updatedAt: now, updatedBy: null },
    published: { sections: null, publishedAt: null, publishedBy: null },
    revisions: [] as { sections: PageSection[]; publishedAt: Date; publishedBy: ObjectId | null; label?: string }[],
    meta: page === 'popup' ? { triggerType: 'delay', triggerValue: 5 } : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('pages').insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

router.get('/:page/draft', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { page } = req.params;
  if (!ALLOWED_PAGES.has(page)) {
    res.status(404).json({ success: false, message: 'Unknown page' });
    return;
  }

  const storeId = new ObjectId(req.user!.storeId);
  const doc = await getOrCreatePage(storeId, page);
  res.json({
    success: true,
    sections: serializeSections(doc.draft?.sections),
    meta: doc.meta ?? null,
    updatedAt: doc.draft?.updatedAt ?? null,
  });
});

router.put('/:page/draft', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { page } = req.params;
  if (!ALLOWED_PAGES.has(page)) {
    res.status(404).json({ success: false, message: 'Unknown page' });
    return;
  }

  try {
    const sections = buildSectionsField(req.body);
    const meta = buildMeta(req.body.meta);
    const db = getDb();
    const storeId = new ObjectId(req.user!.storeId);
    const now = new Date();

    await getOrCreatePage(storeId, page);
    const setFields: Record<string, unknown> = {
      draft: { sections, updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
      updatedAt: now,
    };
    if (meta) setFields.meta = meta;

    await db.collection('pages').updateOne({ storeId, page }, { $set: setFields });

    res.json({ success: true, sections });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
});

router.post('/:page/publish', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { page } = req.params;
  if (!ALLOWED_PAGES.has(page)) {
    res.status(404).json({ success: false, message: 'Unknown page' });
    return;
  }

  const label = typeof req.body?.label === 'string' ? req.body.label.trim().slice(0, 80) : undefined;

  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const now = new Date();

  const doc = await getOrCreatePage(storeId, page);
  const publishedSections = serializeSections(doc.draft?.sections);
  const userId = new ObjectId(req.user!.id);

  const revisions = Array.isArray(doc.revisions) ? doc.revisions : [];
  // Snapshot the outgoing published state (if any) into history before overwriting.
  if (doc.published?.sections) {
    revisions.unshift({
      sections: doc.published.sections,
      publishedAt: doc.published.publishedAt,
      publishedBy: doc.published.publishedBy ?? null,
      label: doc.published.label,
    });
  }
  const trimmedRevisions = revisions.slice(0, MAX_REVISIONS);

  await db.collection('pages').updateOne(
    { storeId, page },
    {
      $set: {
        published: { sections: publishedSections, publishedAt: now, publishedBy: userId, label },
        revisions: trimmedRevisions,
        updatedAt: now,
      },
    },
  );

  res.json({ success: true, sections: publishedSections, publishedAt: now });
});

router.get('/:page/published', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { page } = req.params;
  if (!ALLOWED_PAGES.has(page)) {
    res.status(404).json({ success: false, message: 'Unknown page' });
    return;
  }

  const storeId = new ObjectId(req.user!.storeId);
  const db = getDb();
  const doc = await db.collection('pages').findOne({ storeId, page });

  res.json({
    success: true,
    sections: serializeSections(doc?.published?.sections),
    publishedAt: doc?.published?.publishedAt ?? null,
  });
});

router.get('/:page/revisions', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { page } = req.params;
  if (!ALLOWED_PAGES.has(page)) {
    res.status(404).json({ success: false, message: 'Unknown page' });
    return;
  }

  const storeId = new ObjectId(req.user!.storeId);
  const db = getDb();
  const doc = await db.collection('pages').findOne({ storeId, page });
  const revisions = Array.isArray(doc?.revisions) ? doc.revisions : [];

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

// Restores a past revision into the DRAFT (not live) so it can be reviewed
// and re-published deliberately, rather than instantly overwriting the site.
router.post('/:page/revisions/:index/restore', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { page, index } = req.params;
  if (!ALLOWED_PAGES.has(page)) {
    res.status(404).json({ success: false, message: 'Unknown page' });
    return;
  }

  const storeId = new ObjectId(req.user!.storeId);
  const db = getDb();
  const doc = await db.collection('pages').findOne({ storeId, page });
  const revisions = Array.isArray(doc?.revisions) ? doc.revisions : [];
  const revision = revisions[Number(index)];

  if (!revision) {
    res.status(404).json({ success: false, message: 'Revision not found' });
    return;
  }

  const now = new Date();
  await db.collection('pages').updateOne(
    { storeId, page },
    {
      $set: {
        draft: { sections: revision.sections, updatedAt: now, updatedBy: new ObjectId(req.user!.id) },
        updatedAt: now,
      },
    },
  );

  res.json({ success: true, sections: revision.sections });
});

// Generates (or returns the existing) share token used for the staging
// preview link, so a draft can be reviewed at a real URL before publishing.
router.get('/preview-token', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);
  const existing = await db.collection('store_themes').findOne({ storeId });

  if (existing?.previewToken) {
    res.json({ success: true, token: existing.previewToken });
    return;
  }

  const token = crypto.randomBytes(16).toString('hex');
  await db
    .collection('store_themes')
    .updateOne({ storeId }, { $set: { previewToken: token } }, { upsert: true });

  res.json({ success: true, token });
});

export default router;
