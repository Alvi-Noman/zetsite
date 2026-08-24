import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, type ContentWidth } from '@zetsite/theme-kit';
import type { SpecRowSettings } from '../blocks/SpecRow.js';

export interface ProductSpecsSettings {
  width: ContentWidth;
  backgroundColor: string;
}

export const productSpecsSchema: SectionSchema = {
  type: 'productSpecs',
  label: 'Product specs',
  allowedBlockTypes: ['heading', 'specRow'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Specifications', size: 'md' } },
    { type: 'specRow', settings: { label: 'Material', value: 'Premium stainless steel' } },
    { type: 'specRow', settings: { label: 'Dimensions', value: '4.2 x 4.2 x 1.1 cm' } },
    { type: 'specRow', settings: { label: 'Battery life', value: 'Up to 30 hours' } },
    { type: 'specRow', settings: { label: 'Warranty', value: '1 year, replacement guarantee' } },
  ],
  fields: [WIDTH_FIELD, { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' }],
  defaultSettings: { width: 'page', backgroundColor: '#ffffff' },
};

export function ProductSpecs({ settings, blocks, renderBlocks }: SectionComponentProps<ProductSpecsSettings>) {
  const rows = (blocks?.filter((b) => b.type === 'specRow').map((b) => b.settings as unknown as SpecRowSettings) ?? []) as SpecRowSettings[];

  return (
    <section className={`px-4 py-9 mx-auto ${widthClass(settings.width, 'max-w-2xl')}`} style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mb-5">{renderBlocks?.((b) => b.type === 'heading')}</div>
      {rows.length ? (
        <dl className="overflow-hidden rounded-lg border border-neutral-200">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}`}
            >
              <dt className="font-semibold text-neutral-500">{row.label}</dt>
              <dd className="text-right font-bold text-neutral-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
