import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, type ContentWidth } from '@zetsite/theme-kit';
import type { SpecRowSettings } from '../blocks/SpecRow.js';

export interface SpecsAccordionSettings {
  width: ContentWidth;
}

export const specsAccordionSchema: SectionSchema = {
  type: 'specsAccordion',
  label: 'Product specs (accordion)',
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

export function SpecsAccordion({ settings, blocks, renderBlocks }: SectionComponentProps<SpecsAccordionSettings>) {
  const rows = (blocks?.filter((b) => b.type === 'specRow').map((b) => b.settings as unknown as SpecRowSettings) ?? []) as SpecRowSettings[];
  const [open, setOpen] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <section className="px-4 py-9">
      <div className={`mx-auto ${widthClass(settings.width, 'max-w-xl')}`}>
        <div className="mb-5">{renderBlocks?.((b) => b.type === 'heading')}</div>
        <div className="border-t border-neutral-200">
          {rows.map((row, i) => {
            const isOpen = open.has(i);
            return (
              <div key={i} className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-neutral-900"
                >
                  {row.label}
                  <ChevronDown size={15} className={`shrink-0 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen ? <p className="pb-3 text-sm text-neutral-600">{row.value}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
