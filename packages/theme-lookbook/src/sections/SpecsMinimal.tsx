import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, type ContentWidth } from '@zetsite/theme-kit';
import type { SpecRowSettings } from '../blocks/SpecRow.js';

export interface SpecsMinimalSettings {
  width: ContentWidth;
}

export const specsMinimalSchema: SectionSchema = {
  type: 'specsMinimal',
  label: 'Product specs (minimal list)',
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

export function SpecsMinimal({ settings, blocks, renderBlocks }: SectionComponentProps<SpecsMinimalSettings>) {
  const rows = (blocks?.filter((b) => b.type === 'specRow').map((b) => b.settings as unknown as SpecRowSettings) ?? []) as SpecRowSettings[];
  return (
    <section className="px-4 py-9">
      <div className={`mx-auto ${widthClass(settings.width, 'max-w-md')}`}>
        <div className="mb-5">{renderBlocks?.((b) => b.type === 'heading')}</div>
        <dl className="space-y-2.5 text-sm">
          {rows.map((row, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              <dt className="text-neutral-500">{row.label}</dt>
              <dd className="text-right font-medium text-neutral-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
