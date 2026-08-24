import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FaqTabsSettings {}

export const faqTabsSchema: SectionSchema = {
  type: 'faqTabs',
  label: 'FAQ (tabbed)',
  allowedBlockTypes: ['heading', 'faqItem'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Frequently asked questions', size: 'md' } },
    { type: 'faqItem', settings: { question: 'Is there a free trial?', answer: 'Yes — every plan includes a 14-day free trial.' } },
    { type: 'faqItem', settings: { question: 'Can I cancel anytime?', answer: 'Yes, cancel or change your plan any time.' } },
    { type: 'faqItem', settings: { question: 'Do you offer support?', answer: 'Yes — every plan includes email support.' } },
  ],
  fields: [],
  defaultSettings: {},
};

interface FaqData {
  question?: string;
  answer?: string;
}

export function FaqTabs({ blocks, renderBlocks }: SectionComponentProps<FaqTabsSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'faqItem').map((b) => b.settings as FaqData);
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const current = items[active];
  return (
    <section className="mx-auto max-w-xl px-6 py-14 sm:py-20">
      <div className="mb-8 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              i === active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {item.question}
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-sm leading-relaxed text-neutral-600">{current.answer}</p>
    </section>
  );
}
