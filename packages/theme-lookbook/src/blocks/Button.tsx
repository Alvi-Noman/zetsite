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
      className="inline-block bg-stone-900 px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-yellow-800"
    >
      <Editable as="span" fieldKey="text" value={settings.text} onFieldChange={onFieldChange} />
    </a>
  );
}
