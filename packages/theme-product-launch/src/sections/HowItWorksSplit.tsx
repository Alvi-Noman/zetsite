import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface HowItWorksSplitSettings {
  heading: string;
  imageUrl: string;
}

export const howItWorksSplitSchema: SectionSchema = {
  type: 'howItWorksSplit',
  label: 'How it works (split)',
  allowedBlockTypes: ['step'],
  defaultBlocks: [
    { type: 'step', settings: { title: 'Sign up', description: 'Create your account in under a minute.' } },
    { type: 'step', settings: { title: 'Set things up', description: 'Connect your data and customize it.' } },
    { type: 'step', settings: { title: 'See results', description: 'Get value from day one.' } },
  ],
  fields: [
    { key: 'heading', type: 'text', label: 'Heading', default: 'How it works', tab: 'content' },
    { key: 'imageUrl', type: 'image', label: 'Supporting image', default: '', tab: 'content' },
  ],
  defaultSettings: { heading: 'How it works', imageUrl: '' },
};

interface StepData {
  title?: string;
  description?: string;
}

export function HowItWorksSplit({ settings, blocks }: SectionComponentProps<HowItWorksSplitSettings>) {
  const steps = (blocks ?? []).filter((b) => b.type === 'step').map((b) => b.settings as StepData);
  if (!steps.length) return null;
  return (
    <div className="px-6 py-14 sm:py-20">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:items-center">
        <div>
          {settings.heading ? <h2 className="mb-6 text-2xl font-bold text-neutral-900 sm:text-3xl">{settings.heading}</h2> : null}
          <div className="flex flex-col gap-5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {settings.imageUrl ? (
          <ResponsiveImage src={settings.imageUrl} alt="" className="aspect-square w-full rounded-xl object-cover" />
        ) : (
          <div className="aspect-square w-full rounded-xl bg-neutral-100" />
        )}
      </div>
    </div>
  );
}
