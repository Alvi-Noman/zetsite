import { Clock } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface CtaUrgencySettings {
  urgencyText: string;
  backgroundColor: string;
}

export const ctaUrgencySchema: SectionSchema = {
  type: 'ctaUrgency',
  label: 'Final CTA (urgency strip)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Ready to get started?', size: 'lg' } },
    { type: 'text', settings: { content: 'Join the customers already getting results.' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'urgencyText', type: 'text', label: 'Urgency line', default: 'Limited stock — order today', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#1C1917', tab: 'style' },
  ],
  defaultSettings: { urgencyText: 'Limited stock — order today', backgroundColor: '#1C1917' },
};

export function CtaUrgency({ settings, renderBlocks }: SectionComponentProps<CtaUrgencySettings>) {
  return (
    <section className="px-6 py-16 text-center text-white sm:py-24" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        {settings.urgencyText ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-500">
            <Clock size={13} />
            {settings.urgencyText}
          </span>
        ) : null}
        {renderBlocks?.()}
      </div>
    </section>
  );
}
