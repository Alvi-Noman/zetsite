import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { backgroundImageSet } from '@zetsite/theme-kit';

export interface HeroFullBleedSettings {
  imageUrl: string;
  badgeText: string;
  overlayOpacity: number;
}

export const heroFullBleedSchema: SectionSchema = {
  type: 'heroFullBleed',
  label: 'Hero (full-bleed)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Product name', size: 'lg' } },
    { type: 'text', settings: { content: 'A short, evocative tagline that sets the tone.' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Background image', default: '', tab: 'content' },
    { key: 'badgeText', type: 'text', label: 'Eyebrow badge (optional)', default: 'New arrival', tab: 'content' },
    { key: 'overlayOpacity', type: 'number', label: 'Image overlay opacity (0-1)', default: 0.45, tab: 'style' },
  ],
  defaultSettings: { imageUrl: '', badgeText: 'New arrival', overlayOpacity: 0.45 },
};

export function HeroFullBleed({ settings, renderBlocks }: SectionComponentProps<HeroFullBleedSettings>) {
  const overlay = `linear-gradient(to top, rgba(28,25,23,${Math.min(1, settings.overlayOpacity + 0.25)}), rgba(28,25,23,${settings.overlayOpacity}) 40%, rgba(28,25,23,0.05))`;
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden px-6 py-10 sm:min-h-[520px]">
      {settings.imageUrl ? (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `${overlay}, ${backgroundImageSet(settings.imageUrl)}`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      ) : (
        <div className="absolute inset-0 bg-stone-800" style={{ backgroundImage: overlay }} />
      )}
      <div className="relative flex max-w-xl flex-col items-start gap-3 text-white">
        {settings.badgeText ? (
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
            {settings.badgeText}
          </span>
        ) : null}
        {renderBlocks?.()}
      </div>
    </section>
  );
}
