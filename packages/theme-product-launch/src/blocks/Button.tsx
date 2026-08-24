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
  const url = settings.url || '/';

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (onFieldChange) {
      // Inside the builder canvas, clicks edit text in place rather than navigate.
      e.preventDefault();
      return;
    }
    // On-page anchors (e.g. "#order" pointing at the checkout section) slide
    // down smoothly instead of an instant jump — there's no cart to add to,
    // every buy button on this theme leads straight to the order form.
    if (url.startsWith('#')) {
      const target = document.getElementById(url.slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  return (
    <a
      href={url}
      onClick={handleClick}
      className="inline-block rounded-full bg-yellow-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-yellow-700/25 transition-all hover:-translate-y-0.5 hover:bg-yellow-800 hover:shadow-xl hover:shadow-yellow-700/30"
    >
      <Editable as="span" fieldKey="text" value={settings.text} onFieldChange={onFieldChange} />
    </a>
  );
}
