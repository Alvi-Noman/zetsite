import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface GalleryImageSettings {
  imageUrl: string;
  caption: string;
}

export const galleryImageSchema: SectionSchema = {
  type: 'galleryImage',
  label: 'Image',
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Image', default: '', tab: 'content' },
    { key: 'caption', type: 'text', label: 'Caption', default: '', tab: 'content' },
  ],
  defaultSettings: { imageUrl: '', caption: '' },
};

// Rendered by the Gallery section (grid + lightbox needs the full list).
export function GalleryImage(_props: SectionComponentProps<GalleryImageSettings>) {
  return null;
}
