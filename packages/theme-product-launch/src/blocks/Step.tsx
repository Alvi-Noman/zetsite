import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface StepSettings {
  title: string;
  description: string;
}

export const stepSchema: SectionSchema = {
  type: 'step',
  label: 'Step',
  fields: [
    { key: 'title', type: 'text', label: 'Title', default: 'Step title', tab: 'content' },
    { key: 'description', type: 'text', label: 'Description', default: 'Short description of this step.', tab: 'content' },
  ],
  defaultSettings: { title: 'Step title', description: 'Short description of this step.' },
};

// Rendered by the HowItWorks section (needs the full list to number them).
export function Step(_props: SectionComponentProps<StepSettings>) {
  return null;
}
