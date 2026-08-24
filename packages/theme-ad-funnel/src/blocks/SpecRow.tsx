import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface SpecRowSettings {
  label: string;
  value: string;
}

export const specRowSchema: SectionSchema = {
  type: 'specRow',
  label: 'Spec row',
  fields: [
    { key: 'label', type: 'text', label: 'Label', default: 'Material', tab: 'content' },
    { key: 'value', type: 'text', label: 'Value', default: 'Premium stainless steel', tab: 'content' },
  ],
  defaultSettings: { label: 'Material', value: 'Premium stainless steel' },
};

// Rendered by the ProductSpecs section (needs the full list for the table).
export function SpecRow(_props: SectionComponentProps<SpecRowSettings>) {
  return null;
}
