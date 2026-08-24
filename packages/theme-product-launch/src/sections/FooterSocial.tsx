import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FooterSocialSettings {
  text: string;
  showYear: boolean;
  backgroundColor: string;
  textColor: string;
}

export const footerSocialSchema: SectionSchema = {
  type: 'footerSocial',
  label: 'Footer (social-prominent)',
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

export function FooterSocial({ settings, renderBlocks }: SectionComponentProps<FooterSocialSettings>) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 px-6 py-10 text-center text-sm" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="mb-4 flex justify-center [&_a]:!h-10 [&_a]:!w-10 [&_a]:!text-base">{renderBlocks?.((b) => b.type === 'socialLinks')}</div>
      <div className="mb-3">{renderBlocks?.((b) => b.type === 'policyLinks')}</div>
      {(settings.text || settings.showYear) && (
        <p className="text-xs">
          {settings.showYear ? `© ${year} ` : ''}
          {settings.text}
        </p>
      )}
    </footer>
  );
}
