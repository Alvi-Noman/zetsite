import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface HowItWorksTabsSettings {
  heading: string;
}

export const howItWorksTabsSchema: SectionSchema = {
  type: 'howItWorksTabs',
  label: 'How it works (tabbed)',
  allowedBlockTypes: ['step'],
  defaultBlocks: [
    { type: 'step', settings: { title: 'Sign up', description: 'Create your account in under a minute — no credit card required.' } },
    { type: 'step', settings: { title: 'Set things up', description: 'Connect your data and customize it to fit how you work.' } },
    { type: 'step', settings: { title: 'See results', description: 'Get value from day one, with support if you need it.' } },
  ],
  fields: [{ key: 'heading', type: 'text', label: 'Heading', default: 'How it works', tab: 'content' }],
  defaultSettings: { heading: 'How it works' },
};

interface StepData {
  title?: string;
  description?: string;
}

export function HowItWorksTabs({ settings, blocks }: SectionComponentProps<HowItWorksTabsSettings>) {
  const steps = (blocks ?? []).filter((b) => b.type === 'step').map((b) => b.settings as StepData);
  const [active, setActive] = useState(0);
  if (!steps.length) return null;
  const current = steps[active];
  return (
    <div className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        {settings.heading ? <h2 className="mb-8 text-center text-2xl font-bold text-neutral-900 sm:text-3xl">{settings.heading}</h2> : null}
        <div className="flex justify-center gap-2">
          {steps.map((step, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                i === active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {current ? (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-bold text-neutral-900">{current.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{current.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
