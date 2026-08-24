import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { submitStorefrontForm, ALIGN_FIELD, WIDTH_FIELD, ALIGN_CLASS, widthClass, successMessageField, type ContentAlign, type ContentWidth } from '@zetsite/theme-kit';

export interface ContactFormSettings {
  submitButtonText: string;
  align: ContentAlign;
  width: ContentWidth;
  successMessage: string;
}

export const contactFormSchema: SectionSchema = {
  type: 'contactForm',
  label: 'Contact form',
  allowedBlockTypes: ['heading', 'formField'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Get in touch', size: 'md' } },
    { type: 'formField', settings: { label: 'Name', fieldType: 'text' } },
    { type: 'formField', settings: { label: 'Email', fieldType: 'email' } },
    { type: 'formField', settings: { label: 'Message', fieldType: 'textarea' } },
  ],
  fields: [
    { key: 'submitButtonText', type: 'text', label: 'Submit button text', default: 'Send', tab: 'content' },
    successMessageField("Thanks — we'll be in touch."),
    ALIGN_FIELD,
    WIDTH_FIELD,
  ],
  defaultSettings: { submitButtonText: 'Send', align: 'center', width: 'page', successMessage: "Thanks — we'll be in touch." },
};

interface FormFieldData {
  label: string;
  fieldType: 'text' | 'email' | 'textarea';
}

const DEFAULT_FIELDS: FormFieldData[] = [
  { label: 'Name', fieldType: 'text' },
  { label: 'Email', fieldType: 'email' },
  { label: 'Message', fieldType: 'textarea' },
];

export function ContactForm({ settings, storeSlug, onFieldChange, blocks, renderBlocks }: SectionComponentProps<ContactFormSettings>) {
  const fields = blocks?.some((b) => b.type === 'formField')
    ? blocks.filter((b) => b.type === 'formField').map((b) => b.settings as unknown as FormFieldData)
    : DEFAULT_FIELDS;
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onFieldChange) return;
    const ok = await submitStorefrontForm(storeSlug, 'contact', values);
    if (ok) setStatus('sent');
  }

  return (
    <section className={`px-6 py-10 mx-auto flex flex-col ${align} ${widthClass(settings.width, 'max-w-lg')}`}>
      <div className="mb-8 w-full text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      {status === 'sent' ? (
        <p className="text-center text-sm font-semibold text-neutral-900">{settings.successMessage || "Thanks — we'll be in touch."}</p>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {fields.map((field, i) => (
            <label key={i} className="block">
              <span className="mb-1 block text-sm font-semibold text-neutral-700">{field.label}</span>
              {field.fieldType === 'textarea' ? (
                <textarea
                  rows={4}
                  required
                  onChange={(e) => setValues((v) => ({ ...v, [field.label]: e.target.value }))}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              ) : (
                <input
                  type={field.fieldType}
                  required
                  onChange={(e) => setValues((v) => ({ ...v, [field.label]: e.target.value }))}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              )}
            </label>
          ))}
          <button type="submit" className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            {settings.submitButtonText}
          </button>
        </form>
      )}
    </section>
  );
}
