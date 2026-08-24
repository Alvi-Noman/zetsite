import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface GalleryStorySettings {}

export const galleryStorySchema: SectionSchema = {
  type: 'galleryStory',
  label: 'Gallery (story split)',
  allowedBlockTypes: ['heading', 'galleryImage'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'In detail', size: 'md' } },
    { type: 'galleryImage', settings: { caption: 'Made with care, built to last.' } },
    { type: 'galleryImage', settings: { caption: 'Every detail considered.' } },
  ],
  fields: [],
  defaultSettings: {},
};

interface ImageData {
  imageUrl?: string;
  caption?: string;
}

export function GalleryStory({ blocks, renderBlocks, priority }: SectionComponentProps<GalleryStorySettings>) {
  const images = (blocks ?? []).filter((b) => b.type === 'galleryImage').map((b) => b.settings as ImageData);
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-col gap-12">
        {images.map((img, i) => (
          <div key={i} className={`flex flex-col items-center gap-6 sm:flex-row ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
            {img.imageUrl ? (
              <ResponsiveImage src={img.imageUrl} alt="" className="aspect-[4/3] w-full object-cover sm:w-1/2" priority={priority && i === 0} />
            ) : (
              <div className="aspect-[4/3] w-full bg-neutral-100 sm:w-1/2" />
            )}
            <p className="text-sm leading-relaxed text-neutral-600 sm:w-1/2">{img.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
