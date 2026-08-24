import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface HeadingSettings {
  text: string;
  size: 'sm' | 'md' | 'lg';
}

export const headingSchema: SectionSchema = {
  type: 'heading',
  label: 'Heading',
  fields: [
    { key: 'text', type: 'text', label: 'Text', default: 'Heading', tab: 'content' },
    {
      key: 'size',
      type: 'select',
      label: 'Size',
      default: 'md',
      tab: 'style',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
  ],
  defaultSettings: { text: 'Heading', size: 'md' },
};

const SIZE_CLASS: Record<HeadingSettings['size'], string> = {
  sm: 'text-lg font-bold',
  md: 'text-2xl font-bold',
  lg: 'text-4xl font-bold',
};

export function Heading({ settings, onFieldChange }: SectionComponentProps<HeadingSettings>) {
  return (
    <Editable
      as="h2"
      fieldKey="text"
      value={settings.text}
      onFieldChange={onFieldChange}
      className={`${SIZE_CLASS[settings.size] ?? SIZE_CLASS.md} tracking-tight text-current block`}
    />
  );
}
