import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FaqGridSettings {}

export const faqGridSchema: SectionSchema = {
  type: 'faqGrid',
  label: 'FAQ (grid)',
  allowedBlockTypes: ['heading', 'faqItem'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Frequently asked questions', size: 'md' } },
    { type: 'faqItem', settings: { question: 'Is there a free trial?', answer: 'Yes — every plan includes a 14-day free trial.' } },
    { type: 'faqItem', settings: { question: 'Can I cancel anytime?', answer: 'Yes, cancel or change your plan any time.' } },
    { type: 'faqItem', settings: { question: 'Do you offer support?', answer: 'Yes — every plan includes email support.' } },
    { type: 'faqItem', settings: { question: 'Is my data secure?', answer: 'Yes, everything is encrypted in transit and at rest.' } },
  ],
  fields: [],
  defaultSettings: {},
};

interface FaqData {
  question?: string;
  answer?: string;
}

export function FaqGrid({ blocks, renderBlocks }: SectionComponentProps<FaqGridSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'faqItem').map((b) => b.settings as FaqData);
  return (
    <section className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      <div className="mb-10 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i}>
            <h3 className="text-sm font-bold text-neutral-900">{item.question}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
