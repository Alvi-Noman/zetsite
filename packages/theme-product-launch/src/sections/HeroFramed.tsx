import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface HeroFramedSettings {
  imageUrl: string;
  badgeText: string;
  backgroundColor: string;
}

export const heroFramedSchema: SectionSchema = {
  type: 'heroFramed',
  label: 'Hero (framed card)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Welcome to our store', size: 'lg' } },
    { type: 'text', settings: { content: 'Shop the latest arrivals' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Image', default: '', tab: 'content' },
    { key: 'badgeText', type: 'text', label: 'Eyebrow badge (optional)', default: 'New arrival', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Page background color', default: '#FAF7F2', tab: 'style' },
  ],
  defaultSettings: { imageUrl: '', badgeText: 'New arrival', backgroundColor: '#FAF7F2' },
};

// The one design in this family that's fully contained — a bordered, shadowed
// card centered on the page (image on top, copy below inside the same card)
// instead of a full-width or full-bleed treatment. Distinct from Split (image
// beside copy), Centered/Full-bleed (image as backdrop), and Image
// first/Minimal (no card boundary at all).
export function HeroFramed({ settings, renderBlocks, priority }: SectionComponentProps<HeroFramedSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg shadow-neutral-900/5">
        {settings.imageUrl ? (
          <ResponsiveImage src={settings.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" priority={priority} />
        ) : (
          <div className="aspect-[4/3] w-full bg-neutral-100" />
        )}
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          {settings.badgeText ? (
            <span className="inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {settings.badgeText}
            </span>
          ) : null}
          {renderBlocks?.()}
        </div>
      </div>
    </section>
  );
}
