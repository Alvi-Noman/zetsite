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
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#000000', tab: 'style' },
    ALIGN_FIELD,
  ],
  defaultSettings: { buttonText: 'Subscribe', backgroundColor: '#000000', align: 'center', successMessage: 'Thanks for subscribing!' },
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
    <section className={`px-6 py-20 text-white flex flex-col ${align}`} style={{ backgroundColor: settings.backgroundColor }}>
      <div className="space-y-3 max-w-md">{renderBlocks?.()}</div>
      {status === 'sent' ? (
        <p className="mt-8 text-sm font-bold uppercase tracking-widest">{settings.successMessage || 'Thanks for subscribing!'}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-sm gap-0">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 border border-white bg-transparent px-3 py-3 text-sm text-white placeholder:text-neutral-400"
          />
          <button type="submit" className="bg-white px-5 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-neutral-200">
            {settings.buttonText}
          </button>
        </form>
      )}
    </section>
  );
}
