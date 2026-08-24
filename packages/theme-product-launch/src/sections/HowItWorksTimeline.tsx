import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface HowItWorksTimelineSettings {
  heading: string;
}

export const howItWorksTimelineSchema: SectionSchema = {
  type: 'howItWorksTimeline',
  label: 'How it works (timeline)',
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

export function HowItWorksTimeline({ settings, blocks }: SectionComponentProps<HowItWorksTimelineSettings>) {
  const steps = (blocks ?? []).filter((b) => b.type === 'step').map((b) => b.settings as StepData);
  if (!steps.length) return null;
  return (
    <div className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        {settings.heading ? <h2 className="mb-10 text-center text-2xl font-bold text-neutral-900 sm:text-3xl">{settings.heading}</h2> : null}
        <div className="relative border-l-2 border-neutral-200 pl-8">
          {steps.map((step, i) => (
            <div key={i} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full bg-yellow-700 text-xs font-bold text-white">
                {i + 1}
              </span>
              <h3 className="text-base font-bold text-neutral-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
