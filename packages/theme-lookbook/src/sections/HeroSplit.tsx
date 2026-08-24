import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface HeroSplitSettings {
  imageUrl: string;
  badgeText: string;
  backgroundColor: string;
  imagePosition: 'left' | 'right';
}

export const heroSplitSchema: SectionSchema = {
  type: 'heroSplit',
  label: 'Hero (split)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Product name', size: 'lg' } },
    { type: 'text', settings: { content: 'A short, evocative tagline that sets the tone.' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Image', default: '', tab: 'content' },
    { key: 'badgeText', type: 'text', label: 'Eyebrow badge (optional)', default: 'New arrival', tab: 'content' },
    {
      key: 'imagePosition',
      type: 'select',
      label: 'Image position',
      default: 'right',
      tab: 'style',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#FAF7F2', tab: 'style' },
  ],
  defaultSettings: { imageUrl: '', badgeText: 'New arrival', backgroundColor: '#FAF7F2', imagePosition: 'right' },
};

export function HeroSplit({ settings, renderBlocks, priority }: SectionComponentProps<HeroSplitSettings>) {
  const imageFirst = settings.imagePosition === 'left';
  return (
    <section
      className="grid items-center gap-8 px-6 py-14 sm:grid-cols-2 sm:py-20"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className={imageFirst ? 'sm:order-1' : 'sm:order-2'}>
        {settings.imageUrl ? (
          <ResponsiveImage src={settings.imageUrl} alt="" className="aspect-[4/5] w-full object-cover" priority={priority} />
        ) : (
          <div className="aspect-[4/5] w-full bg-neutral-100" />
        )}
      </div>
      <div className={imageFirst ? 'sm:order-2' : 'sm:order-1'}>
        {settings.badgeText ? (
          <span className="mb-3 inline-block rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {settings.badgeText}
          </span>
        ) : null}
        {renderBlocks?.()}
      </div>
    </section>
  );
}
