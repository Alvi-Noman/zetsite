import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface FooterSettings {
  text: string;
  showYear: boolean;
  backgroundColor: string;
  textColor: string;
}

export const footerSchema: SectionSchema = {
  type: 'footer',
  label: 'Footer',
  allowedBlockTypes: ['copyright', 'policyLinks', 'socialLinks'],
  defaultBlocks: [
    { type: 'copyright', settings: {} },
    { type: 'policyLinks', settings: {} },
    { type: 'socialLinks', settings: {} },
  ],
  fields: [
    { key: 'text', type: 'text', label: 'Footer text', default: '', tab: 'content' },
    { key: 'showYear', type: 'boolean', label: 'Show current year', default: true, tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#000000', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#ffffff', tab: 'style' },
  ],
  defaultSettings: { text: '', showYear: true, backgroundColor: '#000000', textColor: '#ffffff' },
};

export function Footer({ settings, onFieldChange, blocks, renderBlocks }: SectionComponentProps<FooterSettings>) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="px-6 py-10 text-xs uppercase tracking-widest"
      style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}
    >
      {(settings.text || settings.showYear) && (
        <p className="text-center mb-5">
          {settings.showYear ? `© ${year} ` : ''}
          <Editable as="span" fieldKey="text" value={settings.text} onFieldChange={onFieldChange} />
        </p>
      )}
      {blocks?.length ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">{renderBlocks?.((b) => b.type !== 'socialLinks')}</div>
          {renderBlocks?.((b) => b.type === 'socialLinks')}
        </div>
      ) : null}
    </footer>
  );
}
