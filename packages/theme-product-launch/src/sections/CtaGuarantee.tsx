import { ShieldCheck } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface CtaGuaranteeSettings {
  guaranteeText: string;
}

export const ctaGuaranteeSchema: SectionSchema = {
  type: 'ctaGuarantee',
  label: 'Final CTA (guarantee split)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Ready to get started?', size: 'lg' } },
    { type: 'text', settings: { content: 'Join the customers already getting results.' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [{ key: 'guaranteeText', type: 'text', label: 'Guarantee text', default: '30-day money-back guarantee', tab: 'content' }],
  defaultSettings: { guaranteeText: '30-day money-back guarantee' },
};

// Deliberately no configurable backgroundColor: this design's text is only
// legible on a light background, and CtaGuarantee shares a family with
// always-dark designs (finalCta/CtaUrgency/CtaDual) whose backgroundColor
// would otherwise silently carry over when a merchant switches designs.
export function CtaGuarantee({ settings, renderBlocks }: SectionComponentProps<CtaGuaranteeSettings>) {
  return (
    <section className="bg-[#FAF7F2] px-6 py-14 sm:py-20">
      <div className="mx-auto grid max-w-3xl items-center gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-start gap-3">{renderBlocks?.()}</div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-6 text-center">
          <ShieldCheck size={28} className="text-yellow-700" />
          <p className="text-sm font-semibold text-neutral-900">{settings.guaranteeText}</p>
        </div>
      </div>
    </section>
  );
}
