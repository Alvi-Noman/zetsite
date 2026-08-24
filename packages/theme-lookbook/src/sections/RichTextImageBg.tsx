import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { backgroundImageSet } from '@zetsite/theme-kit';

export interface RichTextImageBgSettings {
  eyebrow: string;
  imageUrl: string;
  overlayOpacity: number;
}

export const richTextImageBgSchema: SectionSchema = {
  type: 'richTextImageBg',
  label: 'Rich text (image background)',
  allowedBlockTypes: ['heading', 'text'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Our story', size: 'md' } },
    { type: 'text', settings: { content: 'Tell your brand story here.' } },
  ],
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Eyebrow text', default: '', tab: 'content' },
    { key: 'imageUrl', type: 'image', label: 'Background image', default: '', tab: 'content' },
    { key: 'overlayOpacity', type: 'number', label: 'Overlay opacity (0-1)', default: 0.5, tab: 'style' },
  ],
  defaultSettings: { eyebrow: '', imageUrl: '', overlayOpacity: 0.5 },
};

export function RichTextImageBg({ settings, renderBlocks }: SectionComponentProps<RichTextImageBgSettings>) {
  const overlay = `linear-gradient(rgba(28,25,23,${settings.overlayOpacity}), rgba(28,25,23,${settings.overlayOpacity}))`;
  return (
    <section className="relative flex min-h-[360px] items-center justify-center overflow-hidden px-6 py-16 text-center">
      {settings.imageUrl ? (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `${overlay}, ${backgroundImageSet(settings.imageUrl)}`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      ) : (
        <div className="absolute inset-0 bg-stone-700" />
      )}
      <div className="relative mx-auto max-w-lg text-white">
        {settings.eyebrow ? (
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest opacity-80">{settings.eyebrow}</span>
        ) : null}
        <div className="[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:opacity-90">
          {renderBlocks?.()}
        </div>
      </div>
    </section>
  );
}
