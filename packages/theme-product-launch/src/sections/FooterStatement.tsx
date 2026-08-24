import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FooterStatementSettings {
  text: string;
  statement: string;
  showYear: boolean;
}

export const footerStatementSchema: SectionSchema = {
  type: 'footerStatement',
  label: 'Footer (dark statement)',
  allowedBlockTypes: ['copyright', 'policyLinks', 'socialLinks'],
  defaultBlocks: [
    { type: 'copyright', settings: {} },
    { type: 'policyLinks', settings: {} },
    { type: 'socialLinks', settings: {} },
  ],
  fields: [
    { key: 'statement', type: 'text', label: 'Brand statement', default: 'Built for people who want results.', tab: 'content' },
    { key: 'text', type: 'text', label: 'Footer text', default: '', tab: 'content' },
    { key: 'showYear', type: 'boolean', label: 'Show current year', default: true, tab: 'content' },
  ],
  defaultSettings: { statement: 'Built for people who want results.', text: '', showYear: true },
};

export function FooterStatement({ settings, blocks, renderBlocks }: SectionComponentProps<FooterStatementSettings>) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-neutral-900 px-6 py-10 text-center text-sm text-neutral-300">
      {settings.statement ? <p className="mb-6 font-serif text-lg text-white">{settings.statement}</p> : null}
      {(settings.text || settings.showYear) && (
        <p className="mb-4">
          {settings.showYear ? `© ${year} ` : ''}
          {settings.text}
        </p>
      )}
      {blocks?.length ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {renderBlocks?.((b) => b.type !== 'socialLinks')}
          {renderBlocks?.((b) => b.type === 'socialLinks')}
        </div>
      ) : null}
    </footer>
  );
}
