import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, type ContentWidth } from '@zetsite/theme-kit';
import type { SpecRowSettings } from '../blocks/SpecRow.js';

export interface SpecsGridSettings {
  width: ContentWidth;
}

export const specsGridSchema: SectionSchema = {
  type: 'specsGrid',
  label: 'Product specs (two-column grid)',
  allowedBlockTypes: ['heading', 'specRow'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Specifications', size: 'md' } },
    { type: 'specRow', settings: { label: 'Material', value: 'Premium stainless steel' } },
    { type: 'specRow', settings: { label: 'Dimensions', value: '4.2 x 4.2 x 1.1 cm' } },
    { type: 'specRow', settings: { label: 'Battery life', value: 'Up to 30 hours' } },
    { type: 'specRow', settings: { label: 'Warranty', value: '1 year, replacement guarantee' } },
  ],
  fields: [WIDTH_FIELD],
  defaultSettings: { width: 'page' },
};

export function SpecsGrid({ settings, blocks, renderBlocks }: SectionComponentProps<SpecsGridSettings>) {
  const rows = (blocks?.filter((b) => b.type === 'specRow').map((b) => b.settings as unknown as SpecRowSettings) ?? []) as SpecRowSettings[];
  return (
    <section className="px-4 py-9">
      <div className={`mx-auto ${widthClass(settings.width, 'max-w-2xl')}`}>
        <div className="mb-5">{renderBlocks?.((b) => b.type === 'heading')}</div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          {rows.map((row, i) => (
            <div key={i} className="border-t border-neutral-200 pt-2">
              <dt className="text-xs uppercase tracking-wide text-neutral-500">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-neutral-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
