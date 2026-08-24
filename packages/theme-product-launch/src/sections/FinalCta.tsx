import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, ALIGN_CLASS, type ContentAlign } from '@zetsite/theme-kit';

export interface FinalCtaSettings {
  backgroundColor: string;
  align: ContentAlign;
}

export const finalCtaSchema: SectionSchema = {
  type: 'finalCta',
  label: 'Final CTA',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Ready to get started?', size: 'lg' } },
    { type: 'text', settings: { content: "Join thousands of customers already getting results. No risk — cancel or return it anytime." } },
    { type: 'button', settings: { text: 'Get started now', url: '#order' } },
  ],
  fields: [{ key: 'backgroundColor', type: 'color', label: 'Background color', default: '#1C1917', tab: 'style' }, ALIGN_FIELD],
  defaultSettings: { backgroundColor: '#1C1917', align: 'center' },
};

export function FinalCta({ settings, renderBlocks }: SectionComponentProps<FinalCtaSettings>) {
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  return (
    <section className="px-6 py-16 sm:py-20" style={{ backgroundColor: settings.backgroundColor }}>
      <div className={`mx-auto flex max-w-2xl flex-col gap-4 text-white ${align}`}>{renderBlocks?.()}</div>
    </section>
  );
}
