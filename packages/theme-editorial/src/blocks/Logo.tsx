import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface LogoSettings {
  imageUrl: string;
  width: number;
}

export const logoSchema: SectionSchema = {
  type: 'logo',
  label: 'Logo',
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Logo image', default: '', tab: 'content' },
    { key: 'width', type: 'number', label: 'Width (px)', default: 120, tab: 'style' },
  ],
  defaultSettings: { imageUrl: '', width: 120 },
};

export function Logo({ settings }: SectionComponentProps<LogoSettings>) {
  if (!settings.imageUrl) return null;
  return (
    <ResponsiveImage
      src={settings.imageUrl}
      alt="Logo"
      style={{ width: settings.width || 120 }}
      className="object-contain"
      priority
    />
  );
}
