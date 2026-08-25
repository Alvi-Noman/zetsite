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
    { type: 'plan', settings: { name: 'Pro', price: '৳59', highlighted: true } },
  ],
  fields: [
    { key: 'highlightBadgeText', type: 'text', label: 'Highlighted plan badge text', default: 'Most popular', tab: 'content' },
    { key: 'noteText', type: 'text', label: 'Note below table (optional)', default: '', tab: 'content' },
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(1),
  ],
  defaultSettings: { align: 'center', width: 'page', gap: 1, highlightBadgeText: 'Most popular', noteText: '' },
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
    <section className={`px-6 py-20 mx-auto bg-white ${widthClass(settings.width, 'max-w-4xl')}`}>
      <div className={`flex flex-col mb-12 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      {plans.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">Add plan blocks</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 bg-black border border-black" style={{ gap: settings.gap ?? 1 }}>
          {plans.map((plan, i) => (
            <div key={i} className={`relative p-6 ${plan.highlighted ? 'bg-black text-white' : 'bg-white text-neutral-900'}`}>
              {plan.highlighted && settings.highlightBadgeText ? (
                <span className="absolute -top-3 left-6 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                  {settings.highlightBadgeText}
                </span>
              ) : null}
              <h3 className="text-sm font-bold uppercase tracking-wide">{plan.name}</h3>
              <p className="mt-2 text-3xl font-black">{plan.price}</p>
              <ul className="mt-5 space-y-2">
                {(plan.featuresText ?? '').split('\n').filter(Boolean).map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {settings.noteText ? <p className="mt-8 text-center text-xs text-neutral-500">{settings.noteText}</p> : null}
    </section>
  );
}
