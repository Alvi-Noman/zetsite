import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface HowItWorksAccordionSettings {
  heading: string;
}

export const howItWorksAccordionSchema: SectionSchema = {
  type: 'howItWorksAccordion',
  label: 'How it works (accordion)',
  allowedBlockTypes: ['step'],
  defaultBlocks: [
    { type: 'step', settings: { title: 'Sign up', description: 'Create your account in under a minute.' } },
    { type: 'step', settings: { title: 'Set things up', description: 'Connect your data and customize it.' } },
    { type: 'step', settings: { title: 'See results', description: 'Get value from day one.' } },
  ],
  fields: [{ key: 'heading', type: 'text', label: 'Heading', default: 'How it works', tab: 'content' }],
  defaultSettings: { heading: 'How it works' },
};

interface StepData {
  title?: string;
  description?: string;
}

export function HowItWorksAccordion({ settings, blocks }: SectionComponentProps<HowItWorksAccordionSettings>) {
  const steps = (blocks ?? []).filter((b) => b.type === 'step').map((b) => b.settings as StepData);
  const [open, setOpen] = useState(0);
  if (!steps.length) return null;
  return (
    <div className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        {settings.heading ? <h2 className="mb-8 text-center text-2xl font-bold text-neutral-900 sm:text-3xl">{settings.heading}</h2> : null}
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {steps.map((step, i) => {
            const isOpen = i === open;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="text-sm font-bold text-neutral-900">
                    {i + 1}. {step.title}
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen ? <p className="pb-4 text-sm leading-relaxed text-neutral-600">{step.description}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
