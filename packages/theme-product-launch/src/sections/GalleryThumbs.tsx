import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface GalleryThumbsSettings {}

export const galleryThumbsSchema: SectionSchema = {
  type: 'galleryThumbs',
  label: 'Gallery (thumbnail strip)',
  allowedBlockTypes: ['heading', 'galleryImage'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'See it in action', size: 'md' } },
    { type: 'galleryImage', settings: {} },
    { type: 'galleryImage', settings: {} },
    { type: 'galleryImage', settings: {} },
    { type: 'galleryImage', settings: {} },
  ],
  fields: [],
  defaultSettings: {},
};

interface ImageData {
  imageUrl?: string;
}

export function GalleryThumbs({ blocks, renderBlocks, priority }: SectionComponentProps<GalleryThumbsSettings>) {
  const images = (blocks ?? []).filter((b) => b.type === 'galleryImage').map((b) => b.settings as ImageData);
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  const current = images[index];
  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      {current.imageUrl ? (
        <ResponsiveImage src={current.imageUrl} alt="" className="aspect-square w-full rounded-lg object-cover" priority={priority} />
      ) : (
        <div className="aspect-square w-full rounded-lg bg-neutral-100" />
      )}
      <div className="mt-3 flex justify-center gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 ${i === index ? 'border-neutral-900' : 'border-transparent opacity-70'}`}
          >
            {img.imageUrl ? <ResponsiveImage src={img.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-neutral-100" />}
          </button>
        ))}
      </div>
    </section>
  );
}
