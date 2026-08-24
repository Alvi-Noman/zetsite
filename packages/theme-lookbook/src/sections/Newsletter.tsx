import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { submitStorefrontForm, ALIGN_FIELD, ALIGN_CLASS, successMessageField, type ContentAlign } from '@zetsite/theme-kit';

export interface NewsletterSettings {
  buttonText: string;
  backgroundColor: string;
  align: ContentAlign;
  successMessage: string;
}

export const newsletterSchema: SectionSchema = {
  type: 'newsletter',
  label: 'Email signup',
  allowedBlockTypes: ['heading', 'text'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Join our newsletter', size: 'md' } },
    { type: 'text', settings: { content: 'Get updates on new products and sales' } },
  ],
  fields: [
    { key: 'buttonText', type: 'text', label: 'Button text', default: 'Subscribe', tab: 'content' },
    successMessageField('Thanks for subscribing!'),
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#f5f5f5', tab: 'style' },
    ALIGN_FIELD,
  ],
  defaultSettings: { buttonText: 'Subscribe', backgroundColor: '#f5f5f5', align: 'center', successMessage: 'Thanks for subscribing!' },
};

export function Newsletter({ settings, storeSlug, onFieldChange, renderBlocks }: SectionComponentProps<NewsletterSettings>) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onFieldChange) return;
    const ok = await submitStorefrontForm(storeSlug, 'newsletter', { email });
    if (ok) {
      setStatus('sent');
      setEmail('');
    }
  }

  return (
    <section className={`px-6 py-10 flex flex-col ${align}`} style={{ backgroundColor: settings.backgroundColor }}>
      <div className="space-y-2 max-w-md">{renderBlocks?.()}</div>
      {status === 'sent' ? (
        <p className="mt-6 text-sm font-semibold text-neutral-900">{settings.successMessage || 'Thanks for subscribing!'}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-sm gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-800">
            {settings.buttonText}
          </button>
        </form>
      )}
    </section>
  );
}
