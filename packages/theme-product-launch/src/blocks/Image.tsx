import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface ImageSettings {
  url: string;
}

export const imageSchema: SectionSchema = {
  type: 'image',
  label: 'Image',
  fields: [{ key: 'url', type: 'image', label: 'Image', default: '', tab: 'content' }],
  defaultSettings: { url: '' },
};

export function Image({ settings }: SectionComponentProps<ImageSettings>) {
  if (!settings.url) return null;
  return <ResponsiveImage src={settings.url} alt="" className="w-full rounded-md object-cover" />;
}
