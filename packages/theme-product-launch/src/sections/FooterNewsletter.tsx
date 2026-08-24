import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface FooterNewsletterSettings {
  text: string;
  showYear: boolean;
  backgroundColor: string;
  textColor: string;
}

export const footerNewsletterSchema: SectionSchema = {
  type: 'footerNewsletter',
  label: 'Footer (newsletter band)',
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

export function FooterNewsletter({ settings, blocks, renderBlocks }: SectionComponentProps<FooterNewsletterSettings>) {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  return (
    <footer className="border-t border-neutral-200 text-sm" style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      <div className="border-b border-neutral-200 px-6 py-8 text-center">
        <p className="mb-3 text-sm font-semibold text-neutral-900">Get updates and offers</p>
        <form onSubmit={(e) => e.preventDefault()} className="mx-auto flex max-w-sm gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-800">
            Sign up
          </button>
        </form>
      </div>
      <div className="px-6 py-6">
        {(settings.text || settings.showYear) && (
          <p className="mb-3 text-center">
            {settings.showYear ? `© ${year} ` : ''}
            {settings.text}
          </p>
        )}
        {blocks?.length ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">{renderBlocks?.((b) => b.type !== 'socialLinks')}</div>
            {renderBlocks?.((b) => b.type === 'socialLinks')}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
