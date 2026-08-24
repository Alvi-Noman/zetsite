import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FeaturesTabsSettings {}

export const featuresTabsSchema: SectionSchema = {
  type: 'featuresTabs',
  label: 'Features & benefits (tabbed)',
  allowedBlockTypes: ['heading', 'column'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Why choose us', size: 'md' } },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
  ],
  fields: [],
  defaultSettings: {},
};

interface ColumnData {
  heading?: string;
  text?: string;
}

export function FeaturesTabs({ blocks, renderBlocks }: SectionComponentProps<FeaturesTabsSettings>) {
  const columns = (blocks ?? []).filter((b) => b.type === 'column').map((b) => b.settings as ColumnData);
  const [active, setActive] = useState(0);
  const current = columns[active];

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-wrap justify-center gap-2 border-b border-neutral-200 pb-3">
        {columns.map((col, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              i === active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {col.heading}
          </button>
        ))}
      </div>
      {current ? (
        <div className="pt-6 text-center">
          <h3 className="text-lg font-bold text-neutral-900">{current.heading}</h3>
          {current.text ? <p className="mt-2 text-sm text-neutral-600">{current.text}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
