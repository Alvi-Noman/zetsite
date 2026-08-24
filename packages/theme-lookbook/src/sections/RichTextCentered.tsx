import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface RichTextCenteredSettings {
  eyebrow: string;
  backgroundColor: string;
}

export const richTextCenteredSchema: SectionSchema = {
  type: 'richTextCentered',
  label: 'Rich text (centered, no image)',
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

export function RichTextCentered({ settings, renderBlocks }: SectionComponentProps<RichTextCenteredSettings>) {
  return (
    <section className="px-6 py-12 text-center" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-lg">
        {settings.eyebrow ? (
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-500">{settings.eyebrow}</span>
        ) : null}
        <div className="[&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-normal [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-neutral-600">
          {renderBlocks?.()}
        </div>
      </div>
    </section>
  );
}
