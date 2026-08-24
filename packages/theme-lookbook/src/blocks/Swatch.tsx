import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface SwatchSettings {
  label: string;
  colorHex: string;
  imageUrl: string;
}

export const swatchSchema: SectionSchema = {
  type: 'swatch',
  label: 'Swatch',
  fields: [
    { key: 'label', type: 'text', label: 'Label', default: 'Black', tab: 'content' },
    { key: 'colorHex', type: 'color', label: 'Color (used if no image)', default: '#111111', tab: 'content' },
    { key: 'imageUrl', type: 'image', label: 'Swatch image (optional, overrides color)', default: '', tab: 'content' },
  ],
  defaultSettings: { label: 'Black', colorHex: '#111111', imageUrl: '' },
};

// Rendered by the VariantSwatches section (needs the full list for the row).
export function Swatch(_props: SectionComponentProps<SwatchSettings>) {
  return null;
}
