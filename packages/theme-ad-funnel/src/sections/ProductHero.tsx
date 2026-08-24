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
    { type: 'heading', settings: { text: 'The best protection for your device', size: 'md' } },
    { type: 'heading', settings: { text: 'Military-grade drop protection cover', size: 'md' } },
    { type: 'heading', settings: { text: 'Premium, stylish, and durable covers for your flagship phone. Keep your device looking brand new.', size: 'sm' } },
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
    <section className="px-4 py-8 sm:py-10" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <div className="flex flex-col items-center gap-2">{renderBlocks?.((b) => b.type !== 'button')}</div>
        {settings.imageUrl ? (
          <ResponsiveImage src={settings.imageUrl} alt="" className="w-full max-w-sm rounded-xl object-cover" priority={priority} />
        ) : null}
        <div className="mt-2">{renderBlocks?.((b) => b.type === 'button')}</div>
      </div>
    </section>
  );
}
