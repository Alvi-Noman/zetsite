import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import type { SwatchSettings } from '../blocks/Swatch.js';

export interface SwatchesListSettings {
  heading: string;
}

export const swatchesListSchema: SectionSchema = {
  type: 'swatchesList',
  label: 'Variant swatches (list with preview)',
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

export function SwatchesList({ settings, blocks }: SectionComponentProps<SwatchesListSettings>) {
  const swatches = (blocks?.length ? blocks.map((b) => b.settings as unknown as SwatchSettings) : []) as SwatchSettings[];
  const [selected, setSelected] = useState(0);
  if (!swatches.length) return null;
  const current = swatches[selected];
  return (
    <div className="px-4 py-10 sm:py-12">
      <div className="mx-auto grid max-w-lg items-center gap-6 sm:grid-cols-2">
        <div
          className="aspect-square w-full overflow-hidden rounded-md bg-neutral-100"
          style={current.imageUrl ? undefined : { backgroundColor: current.colorHex || '#111111' }}
        >
          {current.imageUrl ? <ResponsiveImage src={current.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div>
          {settings.heading ? <h2 className="mb-3 text-lg font-medium text-stone-900">{settings.heading}</h2> : null}
          <div className="flex flex-col gap-1.5">
            {swatches.map((swatch, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  i === selected ? 'border-stone-900 bg-stone-50' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-stone-900" style={{ backgroundColor: i === selected ? '#1C1917' : 'transparent' }} />
                {swatch.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
