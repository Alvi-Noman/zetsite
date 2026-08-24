import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FooterColumnsSettings {
  text: string;
  showYear: boolean;
  backgroundColor: string;
  textColor: string;
}

export const footerColumnsSchema: SectionSchema = {
  type: 'footerColumns',
  label: 'Footer (multi-column links)',
  allowedBlockTypes: ['copyright', 'policyLinks', 'socialLinks'],
  defaultBlocks: [
    { type: 'copyright', settings: {} },
    { type: 'policyLinks', settings: {} },
    { type: 'socialLinks', settings: {} },
  ],
  fields: [
    { key: 'text', type: 'text', label: 'Footer text', default: '', tab: 'content' },
    { key: 'showYear', type: 'boolean', label: 'Show current year', default: true, tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#737373', tab: 'style' },
  ],
  defaultSettings: { text: '', showYear: true, backgroundColor: '#ffffff', textColor: '#737373' },
};

export function FooterColumns({ settings, blocks, renderBlocks }: SectionComponentProps<FooterColumnsSettings>) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 px-6 py-10 text-sm" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Shop</p>
            {renderBlocks?.((b) => b.type === 'policyLinks')}
          </div>
        </div>
        {blocks?.some((b) => b.type === 'socialLinks') ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Follow</p>
            {renderBlocks?.((b) => b.type === 'socialLinks')}
          </div>
        ) : null}
      </div>
      {(settings.text || settings.showYear) && (
        <p className="mx-auto mt-8 max-w-5xl border-t border-neutral-200 pt-4 text-xs">
          {settings.showYear ? `© ${year} ` : ''}
          {settings.text}
        </p>
      )}
    </footer>
  );
}
