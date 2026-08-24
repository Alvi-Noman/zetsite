import { useState } from 'react';
import { X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  ALIGN_FIELD,
  WIDTH_FIELD,
  gapField,
  ALIGN_CLASS,
  widthClass,
  IMAGE_ASPECT_FIELD,
  ASPECT_CLASS,
  ResponsiveImage,
  type ContentAlign,
  type ContentWidth,
  type ImageAspect,
} from '@zetsite/theme-kit';

export interface GallerySettings {
  align: ContentAlign;
  width: ContentWidth;
  gap: number;
  columns: '2' | '3' | '4';
  imageAspect: ImageAspect;
  enableLightbox: boolean;
  layout: 'grid' | 'masonry';
}

export const gallerySchema: SectionSchema = {
  type: 'gallery',
  label: 'Image gallery',
  allowedBlockTypes: ['heading', 'galleryImage'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Gallery', size: 'md' } }],
  fields: [
    {
      key: 'layout',
      type: 'select',
      label: 'Layout',
      default: 'grid',
      tab: 'style',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
      ],
    },
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
    { ...IMAGE_ASPECT_FIELD, default: 'square' },
    { key: 'enableLightbox', type: 'boolean', label: 'Enable click-to-zoom lightbox', default: true, tab: 'advanced' },
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(1),
  ],
  defaultSettings: {
    align: 'center',
    width: 'page',
    gap: 1,
    columns: '3',
    imageAspect: 'square',
    enableLightbox: true,
    layout: 'grid',
  },
};

const COLUMN_CLASS: Record<GallerySettings['columns'], string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 md:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-4',
};

const MASONRY_COLUMN_CLASS: Record<GallerySettings['columns'], string> = {
  '2': 'columns-2',
  '3': 'columns-2 md:columns-3',
  '4': 'columns-2 md:columns-4',
};

interface GalleryImageData {
  imageUrl?: string;
  caption?: string;
}

export function Gallery({ settings, blocks, renderBlocks, priority }: SectionComponentProps<GallerySettings>) {
  const images = (blocks ?? [])
    .filter((b) => b.type === 'galleryImage')
    .map((b) => b.settings as GalleryImageData)
    .filter((i) => i.imageUrl);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const aspectClass = ASPECT_CLASS[settings.imageAspect] ?? ASPECT_CLASS.square;
  const enableLightbox = settings.enableLightbox ?? true;
  const isMasonry = settings.layout === 'masonry';
  const gap = settings.gap ?? 1;

  return (
    <section className={`px-6 py-20 mx-auto bg-white ${widthClass(settings.width, 'max-w-5xl')}`}>
      <div className={`flex flex-col mb-12 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      {images.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">Add image blocks</p>
      ) : isMasonry ? (
        <div className={MASONRY_COLUMN_CLASS[settings.columns] ?? MASONRY_COLUMN_CLASS['3']} style={{ columnGap: gap || 16 }}>
          {images.map((img, i) =>
            enableLightbox ? (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(i)}
                className="block w-full break-inside-avoid overflow-hidden border border-black"
                style={{ marginBottom: gap || 16 }}
              >
                <ResponsiveImage src={img.imageUrl} alt={img.caption ?? ''} className="w-full object-cover grayscale hover:grayscale-0 transition-all" priority={priority && i === 0} />
              </button>
            ) : (
              <div key={i} className="break-inside-avoid overflow-hidden border border-black" style={{ marginBottom: gap || 16 }}>
                <ResponsiveImage src={img.imageUrl} alt={img.caption ?? ''} className="w-full object-cover grayscale hover:grayscale-0 transition-all" priority={priority && i === 0} />
              </div>
            ),
          )}
        </div>
      ) : (
        <div
          className={`grid ${COLUMN_CLASS[settings.columns] ?? COLUMN_CLASS['3']} bg-black border border-black`}
          style={{ gap }}
        >
          {images.map((img, i) =>
            enableLightbox ? (
              <button key={i} type="button" onClick={() => setLightbox(i)} className={`overflow-hidden bg-white ${aspectClass || 'aspect-square'}`}>
                <ResponsiveImage src={img.imageUrl} alt={img.caption ?? ''} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all" priority={priority && i === 0} />
              </button>
            ) : (
              <div key={i} className={`overflow-hidden bg-white ${aspectClass || 'aspect-square'}`}>
                <ResponsiveImage src={img.imageUrl} alt={img.caption ?? ''} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all" priority={priority && i === 0} />
              </div>
            ),
          )}
        </div>
      )}
      {enableLightbox && lightbox !== null && images[lightbox] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6" onClick={() => setLightbox(null)}>
          <button type="button" className="absolute right-6 top-6 text-white" onClick={() => setLightbox(null)} aria-label="Close">
            <X size={24} />
          </button>
          <img src={images[lightbox].imageUrl} alt={images[lightbox].caption} className="max-h-[85vh] max-w-full" />
        </div>
      )}
    </section>
  );
}
