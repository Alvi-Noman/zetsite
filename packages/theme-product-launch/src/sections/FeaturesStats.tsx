import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FeaturesStatsSettings {}

export const featuresStatsSchema: SectionSchema = {
  type: 'featuresStats',
  label: 'Features & benefits (stat callouts)',
  allowedBlockTypes: ['heading', 'column'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'By the numbers', size: 'md' } },
    { type: 'column', settings: { heading: '99.9%', text: 'Uptime' } },
    { type: 'column', settings: { heading: '10k+', text: 'Customers' } },
    { type: 'column', settings: { heading: '24/7', text: 'Support' } },
  ],
  fields: [],
  defaultSettings: {},
};

interface ColumnData {
  heading?: string;
  text?: string;
}

export function FeaturesStats({ blocks, renderBlocks }: SectionComponentProps<FeaturesStatsSettings>) {
  const columns = (blocks ?? []).filter((b) => b.type === 'column').map((b) => b.settings as ColumnData);
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {columns.map((col, i) => (
          <div key={i} className="text-center">
            <p className="text-3xl font-black text-neutral-900">{col.heading}</p>
            {col.text ? <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{col.text}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
