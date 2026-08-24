import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface TextSettings {
  content: string;
}

export const textSchema: SectionSchema = {
  type: 'text',
  label: 'Text',
  fields: [{ key: 'content', type: 'richtext', label: 'Text', default: 'Add your text here.', tab: 'content' }],
  defaultSettings: { content: 'Add your text here.' },
};

export function Text({ settings, onFieldChange }: SectionComponentProps<TextSettings>) {
  return (
    <Editable
      as="div"
      fieldKey="content"
      value={settings.content}
      onFieldChange={onFieldChange}
      html
      multiline
      className="prose prose-neutral text-current opacity-80"
    />
  );
}
