export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createUniqueHandle(
  db: { collection: (name: string) => any },
  collectionName: string,
  storeId: unknown,
  name: string,
  excludeId?: unknown,
  field: string = 'handle',
) {
  const base = slugify(name) || collectionName;
  let handle = base;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query: Record<string, unknown> = { storeId, [field]: handle };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await db.collection(collectionName).findOne(query);
    if (!existing) return handle;
    suffix += 1;
    handle = `${base}-${suffix}`;
  }
}
