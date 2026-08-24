import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { backgroundImageSet } from '@zetsite/theme-kit';

export interface CtaImageSettings {
  imageUrl: string;
  overlayOpacity: number;
}

export const ctaImageSchema: SectionSchema = {
  type: 'ctaImage',
  label: 'Final CTA (image background)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Ready to get started?', size: 'lg' } },
    { type: 'text', settings: { content: 'Join the customers already getting results.' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Background image', default: '', tab: 'content' },
    { key: 'overlayOpacity', type: 'number', label: 'Overlay opacity (0-1)', default: 0.55, tab: 'style' },
  ],
  defaultSettings: { imageUrl: '', overlayOpacity: 0.55 },
};

export function CtaImage({ settings, renderBlocks }: SectionComponentProps<CtaImageSettings>) {
  const overlay = `linear-gradient(rgba(0,0,0,${settings.overlayOpacity}), rgba(0,0,0,${settings.overlayOpacity}))`;
  return (
    <section className="relative flex flex-col items-center gap-3 overflow-hidden px-6 py-16 text-center text-white sm:py-24">
      {settings.imageUrl ? (
        <div className="absolute inset-0" style={{ backgroundImage: `${overlay}, ${backgroundImageSet(settings.imageUrl)}`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <div className="absolute inset-0 bg-neutral-800" />
      )}
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-3">{renderBlocks?.()}</div>
    </section>
  );
}
