import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface CtaDualSettings {
  backgroundColor: string;
}

export const ctaDualSchema: SectionSchema = {
  type: 'ctaDual',
  label: 'Final CTA (dual button)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Ready to get started?', size: 'lg' } },
    { type: 'text', settings: { content: 'Join the customers already getting results.' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
    { type: 'button', settings: { text: 'Contact sales', url: '#' } },
  ],
  fields: [{ key: 'backgroundColor', type: 'color', label: 'Background color', default: '#1C1917', tab: 'style' }],
  defaultSettings: { backgroundColor: '#1C1917' },
};

export function CtaDual({ settings, renderBlocks }: SectionComponentProps<CtaDualSettings>) {
  return (
    <section className="px-6 py-16 text-center text-white sm:py-24" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        {renderBlocks?.((b) => b.type !== 'button')}
        <div className="flex flex-wrap justify-center gap-3">{renderBlocks?.((b) => b.type === 'button')}</div>
      </div>
    </section>
  );
}
