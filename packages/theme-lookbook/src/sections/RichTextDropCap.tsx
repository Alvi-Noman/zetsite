import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface RichTextDropCapSettings {
  eyebrow: string;
  backgroundColor: string;
}

export const richTextDropCapSchema: SectionSchema = {
  type: 'richTextDropCap',
  label: 'Rich text (editorial drop-cap)',
  allowedBlockTypes: ['heading', 'text'],
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

export function RichTextDropCap({ settings, renderBlocks }: SectionComponentProps<RichTextDropCapSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-xl">
        {settings.eyebrow ? (
          <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-neutral-500">{settings.eyebrow}</span>
        ) : null}
        <div className="[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:mt-4 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-neutral-600 [&_p]:first-letter:float-left [&_p]:first-letter:mr-2 [&_p]:first-letter:font-serif [&_p]:first-letter:text-5xl [&_p]:first-letter:font-normal [&_p]:first-letter:text-stone-900">
          {renderBlocks?.()}
        </div>
      </div>
    </section>
  );
}
