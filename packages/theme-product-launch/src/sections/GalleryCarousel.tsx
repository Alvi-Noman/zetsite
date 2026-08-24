import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface GalleryCarouselSettings {}

export const galleryCarouselSchema: SectionSchema = {
  type: 'galleryCarousel',
  label: 'Gallery (carousel)',
  allowedBlockTypes: ['heading', 'galleryImage'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'See it in action', size: 'md' } },
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

export function GalleryCarousel({ blocks, renderBlocks, priority }: SectionComponentProps<GalleryCarouselSettings>) {
  const images = (blocks ?? []).filter((b) => b.type === 'galleryImage').map((b) => b.settings as ImageData);
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  const current = images[index];
  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      {current.imageUrl ? (
        <ResponsiveImage src={current.imageUrl} alt="" className="aspect-video w-full rounded-lg object-cover" priority={priority} />
      ) : (
        <div className="aspect-video w-full rounded-lg bg-neutral-100" />
      )}
      {images.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-1.5 w-6 rounded-full transition-colors ${i === index ? 'bg-neutral-900' : 'bg-neutral-300'}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
