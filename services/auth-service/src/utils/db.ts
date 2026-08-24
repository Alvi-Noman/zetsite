import { MongoClient } from 'mongodb';
import { env } from '@zetsite/config/validateEnv';

export const client = new MongoClient(env.MONGODB_URI);

export async function connectDb() {
  console.log('Connecting to MongoDB...');
  await client.connect();
  console.log('Connected to MongoDB!');
  const db = client.db();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('stores').createIndex({ slug: 1 }, { unique: true });
  await db.collection('custom_domains').createIndex({ domain: 1 }, { unique: true });
  await db.collection('custom_domains').createIndex({ storeId: 1 });
}

export function getDb() {
  return client.db();
}
