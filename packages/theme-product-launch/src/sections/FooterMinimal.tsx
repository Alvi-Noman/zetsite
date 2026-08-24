import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FooterMinimalSettings {
  text: string;
  showYear: boolean;
  backgroundColor: string;
  textColor: string;
}

export const footerMinimalSchema: SectionSchema = {
  type: 'footerMinimal',
  label: 'Footer (minimal)',
  allowedBlockTypes: ['copyright', 'policyLinks', 'socialLinks'],
  defaultBlocks: [{ type: 'copyright', settings: {} }],
  fields: [
    { key: 'text', type: 'text', label: 'Footer text', default: '', tab: 'content' },
    { key: 'showYear', type: 'boolean', label: 'Show current year', default: true, tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#a3a3a3', tab: 'style' },
  ],
  defaultSettings: { text: '', showYear: true, backgroundColor: '#ffffff', textColor: '#a3a3a3' },
};

export function FooterMinimal({ settings }: SectionComponentProps<FooterMinimalSettings>) {
  const year = new Date().getFullYear();
  return (
    <footer className="px-6 py-6 text-center text-xs" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      {settings.showYear ? `© ${year} ` : ''}
      {settings.text}
    </footer>
  );
}
