import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FaqItemSettings {
  question: string;
  answer: string;
}

export const faqItemSchema: SectionSchema = {
  type: 'faqItem',
  label: 'Question',
  fields: [
    { key: 'question', type: 'text', label: 'Question', default: 'What is your return policy?', tab: 'content' },
    { key: 'answer', type: 'richtext', label: 'Answer', default: 'We accept returns within 30 days.', tab: 'content' },
  ],
  defaultSettings: { question: 'What is your return policy?', answer: 'We accept returns within 30 days.' },
};

// Rendered by the Faq section (needs the full list for the accordion).
export function FaqItem(_props: SectionComponentProps<FaqItemSettings>) {
  return null;
}
