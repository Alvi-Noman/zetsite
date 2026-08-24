import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface LogoImageSettings {
  imageUrl: string;
  linkUrl: string;
}

export const logoImageSchema: SectionSchema = {
  type: 'logoImage',
  label: 'Logo',
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Logo image', default: '', tab: 'content' },
    { key: 'linkUrl', type: 'url', label: 'Link (optional)', default: '', tab: 'content' },
  ],
  defaultSettings: { imageUrl: '', linkUrl: '' },
};

// Rendered by the LogoBar section (lays the full row out together).
export function LogoImage(_props: SectionComponentProps<LogoImageSettings>) {
  return null;
}
