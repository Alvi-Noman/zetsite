import { MongoClient } from 'mongodb';
import { env } from '@zetsite/config/validateEnv';
import { createUniqueHandle } from './slugify.js';

export const client = new MongoClient(env.MONGODB_URI);

// Backfills a `handle` on documents created before the field existed, so the
// unique index below can be built and public /:handle storefront routes work
// for pre-existing data too.
async function backfillHandles(db: ReturnType<MongoClient['db']>, collectionName: string, nameField: string) {
  const missing = await db
    .collection(collectionName)
    .find({ handle: { $exists: false } })
    .toArray();

  for (const doc of missing) {
    const handle = await createUniqueHandle(db, collectionName, doc.storeId, doc[nameField] ?? collectionName, doc._id);
    await db.collection(collectionName).updateOne({ _id: doc._id }, { $set: { handle } });
  }
}

export async function connectDb() {
  console.log('Connecting to MongoDB...');
  await client.connect();
  console.log('Connected to MongoDB!');
  const db = client.db();

  await backfillHandles(db, 'products', 'title');
  await backfillHandles(db, 'collections', 'name');

  await db.collection('products').createIndex({ storeId: 1, createdAt: -1 });
  await db
    .collection('products')
    .createIndex({ storeId: 1, handle: 1 }, { unique: true, partialFilterExpression: { handle: { $type: 'string' } } });
  // Supports the collection-detail storefront route's products-in-collection
  // lookup (find({ storeId, collections: <id> })), otherwise a full scan.
  await db.collection('products').createIndex({ storeId: 1, collections: 1 });
  await db.collection('collections').createIndex({ storeId: 1, name: 1 }, { unique: true });
  await db
    .collection('collections')
    .createIndex({ storeId: 1, handle: 1 }, { unique: true, partialFilterExpression: { handle: { $type: 'string' } } });
  await db.collection('pages').createIndex({ storeId: 1, page: 1 }, { unique: true });
  await db.collection('landing_pages').createIndex({ storeId: 1, slug: 1 }, { unique: true });
  await db.collection('landing_pages').createIndex({ storeId: 1, updatedAt: -1 });
  await db.collection('landing_pages').createIndex({ storeId: 1, sourceProductId: 1 });
  await db.collection('landing_page_analytics').createIndex({ landingPageId: 1, date: 1 }, { unique: true });
  await db.collection('landing_page_analytics').createIndex({ storeId: 1, date: 1 });
  await db.collection('landing_page_templates').createIndex({ storeId: 1, createdAt: -1 });
  await db.collection('store_themes').createIndex({ storeId: 1 }, { unique: true });
  await db.collection('global_sections').createIndex({ storeId: 1, createdAt: -1 });
  await db.collection('form_submissions').createIndex({ storeId: 1, createdAt: -1 });
  await db.collection('orders').createIndex({ storeId: 1, createdAt: -1 });
  await db
    .collection('orders')
    .createIndex(
      { storeId: 1, idempotencyKey: 1 },
      { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
    );
  await db.collection('abandoned_checkouts').createIndex({ storeId: 1, key: 1 }, { unique: true });
  await db.collection('abandoned_checkouts').createIndex({ storeId: 1, updatedAt: -1 });
  // Auto-purge stale drafts that never convert or get manually dismissed —
  // 30 days is long enough for a merchant follow-up window without the
  // collection growing forever.
  await db.collection('abandoned_checkouts').createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
  await db.collection('store_pixels').createIndex({ storeId: 1 }, { unique: true });
}

export function getDb() {
  return client.db();
}
