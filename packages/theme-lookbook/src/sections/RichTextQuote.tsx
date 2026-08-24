import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface RichTextQuoteSettings {
  eyebrow: string;
  backgroundColor: string;
}

export const richTextQuoteSchema: SectionSchema = {
  type: 'richTextQuote',
  label: 'Rich text (quote-style)',
  allowedBlockTypes: ['heading', 'text'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Our story', size: 'md' } },
    { type: 'text', settings: { content: 'Tell your brand story here.' } },
  ],
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Eyebrow text', default: '', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#FAF7F2', tab: 'style' },
  ],
  defaultSettings: { eyebrow: '', backgroundColor: '#FAF7F2' },
};

export function RichTextQuote({ settings, renderBlocks }: SectionComponentProps<RichTextQuoteSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-xl text-center">
        {settings.eyebrow ? (
          <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-neutral-500">{settings.eyebrow}</span>
        ) : null}
        <div className="[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mt-4 [&_p]:text-lg [&_p]:italic [&_p]:leading-relaxed [&_p]:text-neutral-700">
          {renderBlocks?.()}
        </div>
      </div>
    </section>
  );
}
