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
      className="inline-block rounded-full bg-amber-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-600/25 transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl hover:shadow-amber-600/30"
    >
      <Editable as="span" fieldKey="text" value={settings.text} onFieldChange={onFieldChange} />
    </a>
  );
}
