import { Check } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, WIDTH_FIELD, gapField, ALIGN_CLASS, widthClass, type ContentAlign, type ContentWidth } from '@zetsite/theme-kit';

export interface ComparisonTableSettings {
  align: ContentAlign;
  width: ContentWidth;
  gap: number;
  highlightBadgeText: string;
  noteText: string;
}

export const comparisonTableSchema: SectionSchema = {
  type: 'comparisonTable',
  label: 'Comparison table',
  allowedBlockTypes: ['heading', 'plan'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Compare plans', size: 'md' } },
    { type: 'plan', settings: {} },
    { type: 'plan', settings: { name: 'Pro', price: '$59', highlighted: true } },
  ],
  fields: [
    { key: 'highlightBadgeText', type: 'text', label: 'Highlighted plan badge text', default: 'Most popular', tab: 'content' },
    { key: 'noteText', type: 'text', label: 'Note below table (optional)', default: '', tab: 'content' },
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(24),
  ],
  defaultSettings: { align: 'center', width: 'page', gap: 24, highlightBadgeText: 'Most popular', noteText: '' },
};

interface PlanData {
  name?: string;
  price?: string;
  featuresText?: string;
  highlighted?: boolean;
}

export function ComparisonTable({ settings, blocks, renderBlocks }: SectionComponentProps<ComparisonTableSettings>) {
  const plans = (blocks ?? []).filter((b) => b.type === 'plan').map((b) => b.settings as PlanData);
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  return (
    <section className={`px-6 py-16 mx-auto ${widthClass(settings.width, 'max-w-4xl')}`}>
      <div className={`flex flex-col mb-10 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      {plans.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">Add plan blocks</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: settings.gap ?? 24 }}>
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-md border p-6 ${plan.highlighted ? 'border-neutral-900 shadow-md' : 'border-neutral-200'}`}>
              {plan.highlighted && settings.highlightBadgeText ? (
                <span className="absolute -top-3 left-6 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
                  {settings.highlightBadgeText}
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-neutral-900">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {(plan.featuresText ?? '').split('\n').filter(Boolean).map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm text-neutral-600">
                    <Check size={14} className="mt-0.5 shrink-0 text-neutral-900" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {settings.noteText ? <p className="mt-6 text-center text-xs text-neutral-500">{settings.noteText}</p> : null}
    </section>
  );
}
