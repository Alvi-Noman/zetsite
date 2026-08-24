import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface ButtonSettings {
  text: string;
  url: string;
}

export const buttonSchema: SectionSchema = {
  type: 'button',
  label: 'Button',
  fields: [
    { key: 'text', type: 'text', label: 'Button text', default: 'Shop now', tab: 'content' },
    { key: 'url', type: 'url', label: 'Link', default: '/', tab: 'content' },
  ],
  defaultSettings: { text: 'Shop now', url: '/' },
};

export function Button({ settings, onFieldChange }: SectionComponentProps<ButtonSettings>) {
  if (!settings.text) return null;
  return (
    <a
      href={settings.url || '/'}
      onClick={onFieldChange ? (e) => e.preventDefault() : undefined}
      className="inline-block px-6 py-3 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
    >
      <Editable as="span" fieldKey="text" value={settings.text} onFieldChange={onFieldChange} />
    </a>
  );
}
