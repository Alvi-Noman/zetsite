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
      className="inline-block rounded-full bg-gradient-to-r from-[#ff71cd] to-[#9b51e0] px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_0_4px_rgba(255,113,205,0.2),0_10px_20px_-5px_rgba(155,81,224,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_0_6px_rgba(255,113,205,0.25),0_15px_25px_-5px_rgba(155,81,224,0.4)]"
    >
      <Editable as="span" fieldKey="text" value={settings.text} onFieldChange={onFieldChange} />
    </a>
  );
}
