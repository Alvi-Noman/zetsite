import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface HeroMinimalSettings {
  imageUrl: string;
  badgeText: string;
  backgroundColor: string;
  textColor: string;
}

export const heroMinimalSchema: SectionSchema = {
  type: 'heroMinimal',
  label: 'Hero (minimal)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Welcome to our store', size: 'lg' } },
    { type: 'text', settings: { content: 'Shop the latest arrivals' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Small supporting image', default: '', tab: 'content' },
    { key: 'badgeText', type: 'text', label: 'Eyebrow badge (optional)', default: 'New arrival', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#111111', tab: 'style' },
  ],
  defaultSettings: { imageUrl: '', badgeText: 'New arrival', backgroundColor: '#ffffff', textColor: '#111111' },
};

// Deliberately not full-bleed/dominant like the other designs — a small
// modest image keeps this one reading as "minimal" while still satisfying
// the family rule that every design shows a product image.
export function HeroMinimal({ settings, renderBlocks, priority }: SectionComponentProps<HeroMinimalSettings>) {
  return (
    <section
      className="px-6 py-20 text-center sm:py-28"
      style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        {settings.imageUrl ? (
          <ResponsiveImage src={settings.imageUrl} alt="" className="mb-1 h-24 w-24 rounded-full object-cover shadow-sm" priority={priority} />
        ) : null}
        {settings.badgeText ? (
          <span className="inline-block rounded-full border border-current px-3 py-1 text-xs font-semibold uppercase tracking-wide opacity-70">
            {settings.badgeText}
          </span>
        ) : null}
        {renderBlocks?.()}
      </div>
    </section>
  );
}
