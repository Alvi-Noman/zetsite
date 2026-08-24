import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface ProductHeroSettings {
  imageUrl: string;
  backgroundColor: string;
}

export const productHeroSchema: SectionSchema = {
  type: 'productHero',
  label: 'Product hero',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'The best protection for your device', size: 'lg' } },
    { type: 'heading', settings: { text: 'Premium, durable, and built to last', size: 'md' } },
    { type: 'text', settings: { content: 'A stylish, tough case collection designed to keep your flagship looking brand new.' } },
    { type: 'button', settings: { text: 'Order now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Product image', default: '', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
  ],
  defaultSettings: { imageUrl: '', backgroundColor: '#ffffff' },
};

export function ProductHero({ settings, renderBlocks, priority }: SectionComponentProps<ProductHeroSettings>) {
  return (
    <section
      className="relative overflow-hidden px-4 py-16 sm:py-24 lg:py-28"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* Soft ambient gradient glow behind the content — the theme's signature backdrop. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-[70%] -translate-y-1/3 rounded-full bg-[#ff71cd]/20 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] translate-x-[10%] -translate-y-1/4 rounded-full bg-[#9b51e0]/20 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 text-center">
        <div className="flex max-w-2xl flex-col items-center gap-4">{renderBlocks?.((b) => b.type !== 'button')}</div>
        {settings.imageUrl ? (
          <ResponsiveImage
            src={settings.imageUrl}
            alt=""
            className="w-full max-w-sm rounded-3xl object-cover shadow-2xl shadow-purple-500/20 ring-1 ring-black/5"
            priority={priority}
          />
        ) : null}
        <div>{renderBlocks?.((b) => b.type === 'button')}</div>
      </div>
    </section>
  );
}
