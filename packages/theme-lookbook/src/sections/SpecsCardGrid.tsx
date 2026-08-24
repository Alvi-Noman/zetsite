import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, type ContentWidth } from '@zetsite/theme-kit';
import type { SpecRowSettings } from '../blocks/SpecRow.js';

export interface SpecsCardGridSettings {
  width: ContentWidth;
}

export const specsCardGridSchema: SectionSchema = {
  type: 'specsCardGrid',
  label: 'Product specs (card grid)',
  allowedBlockTypes: ['heading', 'specRow'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Specifications', size: 'md' } },
    { type: 'specRow', settings: { label: 'Material', value: 'Premium stainless steel' } },
    { type: 'specRow', settings: { label: 'Dimensions', value: '4.2 x 4.2 x 1.1 cm' } },
    { type: 'specRow', settings: { label: 'Warranty', value: '1 year, replacement guarantee' } },
  ],
  fields: [WIDTH_FIELD],
  defaultSettings: { width: 'page' },
};

export function SpecsCardGrid({ settings, blocks, renderBlocks }: SectionComponentProps<SpecsCardGridSettings>) {
  const rows = (blocks?.filter((b) => b.type === 'specRow').map((b) => b.settings as unknown as SpecRowSettings) ?? []) as SpecRowSettings[];
  return (
    <section className="px-4 py-9">
      <div className={`mx-auto ${widthClass(settings.width, 'max-w-3xl')}`}>
        <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {rows.map((row, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
              <dt className="text-xs uppercase tracking-wide text-neutral-500">{row.label}</dt>
              <dd className="mt-1 text-sm font-bold text-neutral-900">{row.value}</dd>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
