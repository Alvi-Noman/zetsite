import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface HowItWorksCardsSettings {
  heading: string;
}

export const howItWorksCardsSchema: SectionSchema = {
  type: 'howItWorksCards',
  label: 'How it works (cards)',
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

export function HowItWorksCards({ settings, blocks }: SectionComponentProps<HowItWorksCardsSettings>) {
  const steps = (blocks ?? []).filter((b) => b.type === 'step').map((b) => b.settings as StepData);
  if (!steps.length) return null;
  return (
    <div className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        {settings.heading ? <h2 className="mb-10 text-center text-2xl font-bold text-neutral-900 sm:text-3xl">{settings.heading}</h2> : null}
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-900">
                {i + 1}
              </div>
              <h3 className="text-base font-bold text-neutral-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
