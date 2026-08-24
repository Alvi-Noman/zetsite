import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface PlanSettings {
  name: string;
  price: string;
  featuresText: string;
  highlighted: boolean;
}

export const planSchema: SectionSchema = {
  type: 'plan',
  label: 'Plan',
  fields: [
    { key: 'name', type: 'text', label: 'Plan name', default: 'Standard', tab: 'content' },
    { key: 'price', type: 'text', label: 'Price', default: '$29', tab: 'content' },
    { key: 'featuresText', type: 'richtext', label: 'Features (one per line)', default: 'Feature one\nFeature two', tab: 'content' },
    { key: 'highlighted', type: 'boolean', label: 'Highlight this plan', default: false, tab: 'content' },
  ],
  defaultSettings: { name: 'Standard', price: '$29', featuresText: 'Feature one\nFeature two', highlighted: false },
};

// Rendered by the ComparisonTable section (needs the full list for the grid).
export function Plan(_props: SectionComponentProps<PlanSettings>) {
  return null;
}
