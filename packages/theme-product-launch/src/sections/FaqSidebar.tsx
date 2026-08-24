import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FaqSidebarSettings {
  heading: string;
  text: string;
}

export const faqSidebarSchema: SectionSchema = {
  type: 'faqSidebar',
  label: 'FAQ (sidebar)',
  allowedBlockTypes: ['faqItem'],
  defaultBlocks: [
    { type: 'faqItem', settings: { question: 'Is there a free trial?', answer: 'Yes — every plan includes a 14-day free trial.' } },
    { type: 'faqItem', settings: { question: 'Can I cancel anytime?', answer: 'Yes, cancel or change your plan any time.' } },
    { type: 'faqItem', settings: { question: 'Do you offer support?', answer: 'Yes — every plan includes email support.' } },
  ],
  fields: [
    { key: 'heading', type: 'text', label: 'Heading', default: 'Questions?', tab: 'content' },
    { key: 'text', type: 'richtext', label: 'Text', default: "We're happy to help — reach out any time.", tab: 'content' },
  ],
  defaultSettings: { heading: 'Questions?', text: "We're happy to help — reach out any time." },
};

interface FaqData {
  question?: string;
  answer?: string;
}

export function FaqSidebar({ settings, blocks }: SectionComponentProps<FaqSidebarSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'faqItem').map((b) => b.settings as FaqData);
  const [open, setOpen] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">{settings.heading}</h2>
          {settings.text ? <p className="mt-2 text-sm text-neutral-600">{settings.text}</p> : null}
        </div>
        <div className="sm:col-span-2">
          {items.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div key={i} className="border-b border-neutral-200 py-3.5">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-neutral-900"
                >
                  {item.question}
                  <ChevronDown size={15} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen ? <p className="mt-2 text-sm text-neutral-600">{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
