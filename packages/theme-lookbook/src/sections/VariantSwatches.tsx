import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import type { SwatchSettings } from '../blocks/Swatch.js';

export interface VariantSwatchesSettings {
  heading: string;
}

export const variantSwatchesSchema: SectionSchema = {
  type: 'variantSwatches',
  label: 'Variant swatches',
  allowedBlockTypes: ['swatch'],
  defaultBlocks: [
    { type: 'swatch', settings: { label: 'Black', colorHex: '#111111', imageUrl: '' } },
    { type: 'swatch', settings: { label: 'Walnut', colorHex: '#5C4433', imageUrl: '' } },
    { type: 'swatch', settings: { label: 'Silver', colorHex: '#C7C7C7', imageUrl: '' } },
    { type: 'swatch', settings: { label: 'Gold', colorHex: '#B08D57', imageUrl: '' } },
  ],
  fields: [{ key: 'heading', type: 'text', label: 'Heading', default: 'Choose your finish', tab: 'content' }],
  defaultSettings: { heading: 'Choose your finish' },
};

export function VariantSwatches({ settings, blocks }: SectionComponentProps<VariantSwatchesSettings>) {
  const swatches = (blocks?.length ? blocks.map((b) => b.settings as unknown as SwatchSettings) : []) as SwatchSettings[];
  const [selected, setSelected] = useState(0);

  if (!swatches.length) return null;

  return (
    <div className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-2xl text-center">
        {settings.heading ? <h2 className="mb-1 text-lg font-medium text-stone-900">{settings.heading}</h2> : null}
        {swatches[selected]?.label ? <p className="mb-5 text-sm text-stone-500">{swatches[selected].label}</p> : null}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {swatches.map((swatch, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={swatch.label}
              aria-pressed={i === selected}
              className={`h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-offset-2 transition-all ${
                i === selected ? 'ring-2 ring-stone-900' : 'ring-stone-200 hover:ring-stone-400'
              }`}
              style={swatch.imageUrl ? undefined : { backgroundColor: swatch.colorHex || '#111111' }}
            >
              {swatch.imageUrl ? <ResponsiveImage src={swatch.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
