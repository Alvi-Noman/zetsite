import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import type { SwatchSettings } from '../blocks/Swatch.js';

export interface SwatchesCardsSettings {
  heading: string;
}

export const swatchesCardsSchema: SectionSchema = {
  type: 'swatchesCards',
  label: 'Variant swatches (card select)',
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

export function SwatchesCards({ settings, blocks }: SectionComponentProps<SwatchesCardsSettings>) {
  const swatches = (blocks?.length ? blocks.map((b) => b.settings as unknown as SwatchSettings) : []) as SwatchSettings[];
  const [selected, setSelected] = useState(0);
  if (!swatches.length) return null;
  return (
    <div className="px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {settings.heading ? <h2 className="mb-5 text-center text-lg font-medium text-stone-900">{settings.heading}</h2> : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map((swatch, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={i === selected}
              className={`flex flex-col items-center gap-2 rounded-md border p-3 transition-colors ${
                i === selected ? 'border-stone-900' : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div
                className="h-10 w-10 rounded-full"
                style={swatch.imageUrl ? undefined : { backgroundColor: swatch.colorHex || '#111111' }}
              >
                {swatch.imageUrl ? <ResponsiveImage src={swatch.imageUrl} alt="" className="h-full w-full rounded-full object-cover" /> : null}
              </div>
              <span className="text-xs font-medium text-neutral-800">{swatch.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
