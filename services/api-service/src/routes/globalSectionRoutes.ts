import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';

const router: RouterType = Router();

function serialize(doc: any) {
  return {
    id: doc._id.toString(),
    type: doc.type,
    label: doc.label,
    settings: doc.settings ?? {},
  };
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const docs = await db
    .collection('global_sections')
    .find({ storeId: new ObjectId(req.user!.storeId) })
    .sort({ createdAt: -1 })
    .toArray();

  res.json({ success: true, globalSections: docs.map(serialize) });
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { type, label, settings } = req.body ?? {};
  if (typeof type !== 'string' || !type.trim() || typeof label !== 'string' || !label.trim()) {
    res.status(400).json({ success: false, message: 'type and label are required' });
    return;
  }

  const db = getDb();
  const now = new Date();
  const result = await db.collection('global_sections').insertOne({
    storeId: new ObjectId(req.user!.storeId),
    type: type.trim(),
    label: label.trim(),
    settings: settings && typeof settings === 'object' ? settings : {},
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json({
    success: true,
    globalSection: serialize({ _id: result.insertedId, type, label, settings }),
  });
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { settings, label } = req.body ?? {};
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);

  const setFields: Record<string, unknown> = { updatedAt: new Date() };
  if (settings && typeof settings === 'object') setFields.settings = settings;
  if (typeof label === 'string' && label.trim()) setFields.label = label.trim();

  let result;
  try {
    result = await db
      .collection('global_sections')
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id), storeId },
        { $set: setFields },
        { returnDocument: 'after' },
      );
  } catch {
    res.status(400).json({ success: false, message: 'Invalid id' });
    return;
  }

  if (!result) {
    res.status(404).json({ success: false, message: 'Global section not found' });
    return;
  }

  res.json({ success: true, globalSection: serialize(result) });
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const result = await db.collection('global_sections').deleteOne({
    _id: new ObjectId(req.params.id),
    storeId: new ObjectId(req.user!.storeId),
  });

  if (result.deletedCount === 0) {
    res.status(404).json({ success: false, message: 'Global section not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
