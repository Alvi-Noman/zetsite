import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FaqNumberedSettings {}

export const faqNumberedSchema: SectionSchema = {
  type: 'faqNumbered',
  label: 'FAQ (numbered list)',
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

export function FaqNumbered({ blocks, renderBlocks }: SectionComponentProps<FaqNumberedSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'faqItem').map((b) => b.settings as FaqData);
  return (
    <section className="mx-auto max-w-xl px-6 py-14 sm:py-20">
      <div className="mb-8 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-col gap-5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-sm font-black text-neutral-300">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{item.question}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
