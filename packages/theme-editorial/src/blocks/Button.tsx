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
      className="inline-block border border-emerald-800 px-7 py-3 text-sm font-medium uppercase tracking-wide text-emerald-800 transition-colors hover:bg-emerald-800 hover:text-white"
    >
      <Editable as="span" fieldKey="text" value={settings.text} onFieldChange={onFieldChange} />
    </a>
  );
}
