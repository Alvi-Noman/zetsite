import { CheckCircle2 } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, type ContentWidth } from '@zetsite/theme-kit';
import type { SpecRowSettings } from '../blocks/SpecRow.js';

export interface SpecsIconCardsSettings {
  width: ContentWidth;
}

export const specsIconCardsSchema: SectionSchema = {
  type: 'specsIconCards',
  label: 'Product specs (icon cards)',
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

export function SpecsIconCards({ settings, blocks, renderBlocks }: SectionComponentProps<SpecsIconCardsSettings>) {
  const rows = (blocks?.filter((b) => b.type === 'specRow').map((b) => b.settings as unknown as SpecRowSettings) ?? []) as SpecRowSettings[];
  return (
    <section className="px-4 py-9">
      <div className={`mx-auto ${widthClass(settings.width, 'max-w-3xl')}`}>
        <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border border-neutral-200 p-4">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-yellow-700" />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{row.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-neutral-900">{row.value}</dd>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
