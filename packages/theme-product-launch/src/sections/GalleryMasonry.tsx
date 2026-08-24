import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface GalleryMasonrySettings {}

export const galleryMasonrySchema: SectionSchema = {
  type: 'galleryMasonry',
  label: 'Gallery (masonry)',
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

const HEIGHTS = ['h-40', 'h-56', 'h-48', 'h-64'];

export function GalleryMasonry({ blocks, renderBlocks, priority }: SectionComponentProps<GalleryMasonrySettings>) {
  const images = (blocks ?? []).filter((b) => b.type === 'galleryImage').map((b) => b.settings as ImageData);
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="columns-2 gap-3 sm:columns-3">
        {images.map((img, i) =>
          img.imageUrl ? (
            <ResponsiveImage
              key={i}
              src={img.imageUrl}
              alt=""
              priority={priority && i === 0}
              className={`mb-3 w-full break-inside-avoid rounded-lg object-cover ${HEIGHTS[i % HEIGHTS.length]}`}
            />
          ) : (
            <div key={i} className={`mb-3 w-full break-inside-avoid rounded-lg bg-neutral-100 ${HEIGHTS[i % HEIGHTS.length]}`} />
          ),
        )}
      </div>
    </section>
  );
}
