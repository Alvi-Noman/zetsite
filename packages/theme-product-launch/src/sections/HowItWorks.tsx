import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable, ALIGN_FIELD, ALIGN_CLASS, type ContentAlign } from '@zetsite/theme-kit';
import type { StepSettings } from '../blocks/Step.js';

export interface HowItWorksSettings {
  heading: string;
  backgroundColor: string;
  align: ContentAlign;
}

export const howItWorksSchema: SectionSchema = {
  type: 'howItWorks',
  label: 'How it works',
  allowedBlockTypes: ['step'],
  defaultBlocks: [
    { type: 'step', settings: { title: 'Sign up', description: 'Create your account in under a minute — no credit card required.' } },
    { type: 'step', settings: { title: 'Set things up', description: 'Connect your data and customize it to fit how you work.' } },
    { type: 'step', settings: { title: 'See results', description: 'Get value from day one, with support if you need it.' } },
  ],
  fields: [
    { key: 'heading', type: 'text', label: 'Heading', default: 'How it works', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
    ALIGN_FIELD,
  ],
  defaultSettings: { heading: 'How it works', backgroundColor: '#ffffff', align: 'center' },
};

export function HowItWorks({ settings, blocks, onBlockFieldChange }: SectionComponentProps<HowItWorksSettings>) {
  const steps = blocks ?? [];
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  if (!steps.length) return null;

  return (
    <div className="px-6 py-14 sm:py-20" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-5xl">
        {settings.heading ? (
          <div className={`mb-10 flex flex-col ${align}`}>
            <h2 className="text-2xl font-serif font-normal text-neutral-900 sm:text-3xl">{settings.heading}</h2>
          </div>
        ) : null}
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((block, i) => {
            const step = block.settings as unknown as StepSettings;
            const fieldChange = onBlockFieldChange ? (key: string, value: string) => onBlockFieldChange(block.id, key, value) : undefined;
            return (
              <div key={block.id} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                {i < steps.length - 1 ? (
                  <span className="absolute left-1/2 top-6 hidden h-px w-full -translate-x-0 bg-neutral-200 sm:left-[calc(50%+28px)] sm:block sm:w-[calc(100%-28px)]" />
                ) : null}
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-700 text-lg font-bold text-white">
                  {i + 1}
                </span>
                <Editable as="h3" fieldKey="title" value={step.title ?? ''} onFieldChange={fieldChange} className="mt-4 text-base font-bold text-neutral-900 block" />
                <Editable
                  as="p"
                  fieldKey="description"
                  value={step.description ?? ''}
                  onFieldChange={fieldChange}
                  className="mt-1.5 text-sm leading-relaxed text-neutral-600 block"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
