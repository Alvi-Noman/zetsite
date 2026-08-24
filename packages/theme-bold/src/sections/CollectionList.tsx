import { useEffect, useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  fetchStorefrontCollections,
  type StorefrontCollection,
  ALIGN_FIELD,
  WIDTH_FIELD,
  gapField,
  ALIGN_CLASS,
  widthClass,
  IMAGE_ASPECT_FIELD,
  ASPECT_CLASS,
  type ContentAlign,
  type ContentWidth,
  type ImageAspect,
} from '@zetsite/theme-kit';

export interface CollectionListSettings {
  columns: '2' | '3' | '4';
  align: ContentAlign;
  width: ContentWidth;
  gap: number;
  imageAspect: ImageAspect;
}

export const collectionListSchema: SectionSchema = {
  type: 'collectionList',
  label: 'Collection list',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Shop by category', size: 'md' } }],
  fields: [
    {
      key: 'columns',
      type: 'select',
      label: 'Columns',
      default: '3',
      tab: 'style',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    { ...IMAGE_ASPECT_FIELD, default: 'landscape' },
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(1),
  ],
  defaultSettings: { columns: '3', align: 'center', width: 'page', gap: 1, imageAspect: 'landscape' },
};

const COLUMN_CLASS: Record<CollectionListSettings['columns'], string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 md:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-4',
};

export function CollectionList({ settings, storeSlug, renderBlocks }: SectionComponentProps<CollectionListSettings>) {
  const [collections, setCollections] = useState<StorefrontCollection[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchStorefrontCollections(storeSlug).then((cs) => {
      if (!cancelled) setCollections(cs);
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const aspectClass = ASPECT_CLASS[settings.imageAspect] ?? ASPECT_CLASS.landscape;

  return (
    <section className="px-6 py-20 bg-white">
      <div className={`flex flex-col mb-12 ${align}`}>{renderBlocks?.()}</div>
      {collections.length === 0 ? (
        <p className="text-center text-neutral-400 text-sm">No collections to show yet</p>
      ) : (
        <div
          className={`grid ${COLUMN_CLASS[settings.columns] ?? COLUMN_CLASS['3']} bg-black mx-auto ${widthClass(settings.width, 'max-w-5xl')}`}
          style={{ gap: settings.gap ?? 1 }}
        >
          {collections.map((c) => (
            <a
              key={c.id}
              href={`/collections/${c.handle}`}
              className={`flex items-center justify-center bg-white text-neutral-900 font-bold uppercase tracking-wide hover:bg-neutral-100 transition-colors ${aspectClass || 'aspect-[4/3]'}`}
            >
              {c.name}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
