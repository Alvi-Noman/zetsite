import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';
import { createUniqueHandle } from '../utils/slugify.js';

const router: RouterType = Router();

function serializeCollection(collection: any, productsCount = 0) {
  return {
    id: collection._id.toString(),
    name: collection.name,
    handle: collection.handle ?? '',
    productsCount,
    createdAt: collection.createdAt,
  };
}

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const storeId = new ObjectId(req.user!.storeId);

  const [collections, counts] = await Promise.all([
    db.collection('collections').find({ storeId }).sort({ name: 1 }).toArray(),
    db
      .collection('products')
      .aggregate([
        { $match: { storeId } },
        { $unwind: '$collections' },
        { $group: { _id: '$collections', count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const countById = new Map(counts.map((c) => [c._id, c.count]));

  res.json({
    success: true,
    collections: collections.map((c) => serializeCollection(c, countById.get(c._id.toString()) ?? 0)),
  });
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'Collection name is required' });
      return;
    }

    const db = getDb();
    const storeId = new ObjectId(req.user!.storeId);
    const trimmedName = name.trim();

    const existing = await db.collection('collections').findOne({ storeId, name: trimmedName });
    if (existing) {
      res.status(200).json({ success: true, collection: serializeCollection(existing) });
      return;
    }

    const handle = await createUniqueHandle(db, 'collections', storeId, trimmedName);
    const result = await db.collection('collections').insertOne({
      storeId,
      name: trimmedName,
      handle,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      collection: serializeCollection({ _id: result.insertedId, name: trimmedName, handle }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, message: 'Collection name is required' });
      return;
    }

    const db = getDb();
    const storeId = new ObjectId(req.user!.storeId);
    let result;
    try {
      result = await db
        .collection('collections')
        .findOneAndUpdate(
          { _id: new ObjectId(req.params.id), storeId },
          { $set: { name: name.trim() } },
          { returnDocument: 'after' },
        );
    } catch {
      res.status(400).json({ success: false, message: 'Invalid collection id' });
      return;
    }

    if (!result) {
      res.status(404).json({ success: false, message: 'Collection not found' });
      return;
    }

    res.json({ success: true, collection: serializeCollection(result) });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  let result;
  try {
    result = await db.collection('collections').deleteOne({
      _id: new ObjectId(req.params.id),
      storeId: new ObjectId(req.user!.storeId),
    });
  } catch {
    res.status(400).json({ success: false, message: 'Invalid collection id' });
    return;
  }

  if (result.deletedCount === 0) {
    res.status(404).json({ success: false, message: 'Collection not found' });
    return;
  }

  await db
    .collection('products')
    .updateMany(
      { storeId: new ObjectId(req.user!.storeId) },
      { $pull: { collections: req.params.id } } as any,
    );

  res.json({ success: true });
});

export default router;
