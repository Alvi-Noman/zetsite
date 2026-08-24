import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FaqChatSettings {}

export const faqChatSchema: SectionSchema = {
  type: 'faqChat',
  label: 'FAQ (chat bubbles)',
  allowedBlockTypes: ['heading', 'faqItem'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Frequently asked questions', size: 'md' } },
    { type: 'faqItem', settings: { question: 'Is there a free trial?', answer: 'Yes — every plan includes a 14-day free trial.' } },
    { type: 'faqItem', settings: { question: 'Can I cancel anytime?', answer: 'Yes, cancel or change your plan any time.' } },
  ],
  fields: [],
  defaultSettings: {},
};

interface FaqData {
  question?: string;
  answer?: string;
}

export function FaqChat({ blocks, renderBlocks }: SectionComponentProps<FaqChatSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'faqItem').map((b) => b.settings as FaqData);
  return (
    <section className="mx-auto max-w-xl px-6 py-14 sm:py-20">
      <div className="mb-8 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-900">
              {item.question}
            </div>
            <div className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-neutral-900 px-4 py-2.5 text-sm text-white">
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
