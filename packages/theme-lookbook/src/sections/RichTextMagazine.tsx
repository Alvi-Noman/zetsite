import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface RichTextMagazineSettings {
  eyebrow: string;
  backgroundColor: string;
}

export const richTextMagazineSchema: SectionSchema = {
  type: 'richTextMagazine',
  label: 'Rich text (magazine two-column)',
  allowedBlockTypes: ['heading', 'text', 'image'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Our story', size: 'md' } },
    { type: 'text', settings: { content: 'Tell your brand story here.' } },
  ],
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Eyebrow text', default: '', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
  ],
  defaultSettings: { eyebrow: '', backgroundColor: '#ffffff' },
};

export function RichTextMagazine({ settings, blocks, renderBlocks }: SectionComponentProps<RichTextMagazineSettings>) {
  const hasImage = blocks?.some((b) => b.type === 'image');
  return (
    <section className="px-6 py-12" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-3xl">
        {hasImage ? <div className="mb-6 overflow-hidden">{renderBlocks?.((b) => b.type === 'image')}</div> : null}
        {settings.eyebrow ? (
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-500">{settings.eyebrow}</span>
        ) : null}
        <div className="[&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-normal [&_p]:columns-1 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-neutral-600 sm:[&_p]:columns-2 sm:[&_p]:gap-8">
          {renderBlocks?.((b) => b.type !== 'image')}
        </div>
      </div>
    </section>
  );
}
