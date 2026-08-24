import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FeaturesNumberedSettings {}

export const featuresNumberedSchema: SectionSchema = {
  type: 'featuresNumbered',
  label: 'Features & benefits (numbered)',
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

export function FeaturesNumbered({ blocks, renderBlocks }: SectionComponentProps<FeaturesNumberedSettings>) {
  const columns = (blocks ?? []).filter((b) => b.type === 'column').map((b) => b.settings as ColumnData);
  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-col divide-y divide-neutral-200 border-y border-neutral-200">
        {columns.map((col, i) => (
          <div key={i} className="flex items-start gap-4 py-4">
            <span className="text-lg font-black text-neutral-300">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-base font-bold text-neutral-900">{col.heading}</h3>
              {col.text ? <p className="mt-1 text-sm text-neutral-600">{col.text}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
