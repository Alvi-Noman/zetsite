import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FormFieldSettings {
  label: string;
  fieldType: 'text' | 'email' | 'textarea';
}

export const formFieldSchema: SectionSchema = {
  type: 'formField',
  label: 'Form field',
  fields: [
    { key: 'label', type: 'text', label: 'Field label', default: 'Name', tab: 'content' },
    {
      key: 'fieldType',
      type: 'select',
      label: 'Field type',
      default: 'text',
      tab: 'content',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Long text', value: 'textarea' },
      ],
    },
  ],
  defaultSettings: { label: 'Name', fieldType: 'text' },
};

// Rendered by the ContactForm section (needs the full list to build the form).
export function FormField(_props: SectionComponentProps<FormFieldSettings>) {
  return null;
}
