import { Check } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FeaturesChecklistSettings {}

export const featuresChecklistSchema: SectionSchema = {
  type: 'featuresChecklist',
  label: 'Features & benefits (checklist)',
  allowedBlockTypes: ['heading', 'column'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Everything included', size: 'md' } },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
  ],
  fields: [],
  defaultSettings: {},
};

interface ColumnData {
  heading?: string;
}

export function FeaturesChecklist({ blocks, renderBlocks }: SectionComponentProps<FeaturesChecklistSettings>) {
  const columns = (blocks ?? []).filter((b) => b.type === 'column').map((b) => b.settings as ColumnData);
  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {columns.map((col, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-neutral-800">
            <Check size={16} className="shrink-0 text-yellow-700" />
            {col.heading}
          </div>
        ))}
      </div>
    </section>
  );
}
