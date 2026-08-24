import { Check } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { ChecklistItemSettings } from '../blocks/ChecklistItem.js';

export interface ChecklistFeaturesSettings {
  heading: string;
  backgroundColor: string;
}

export const checklistFeaturesSchema: SectionSchema = {
  type: 'checklistFeatures',
  label: 'Checklist features',
  allowedBlockTypes: ['checklistItem'],
  defaultBlocks: [
    { type: 'checklistItem', settings: { title: 'Built to last', description: 'Reinforced construction stands up to daily wear and tear.' } },
    { type: 'checklistItem', settings: { title: "Won't fade or yellow", description: 'Stays looking new long after purchase.' } },
    { type: 'checklistItem', settings: { title: 'Wireless charging ready', description: 'No need to remove anything to charge.' } },
    { type: 'checklistItem', settings: { title: 'Slim, premium grip', description: 'Full protection without added bulk.' } },
  ],
  fields: [
    { key: 'heading', type: 'text', label: 'Heading', default: "Why customers choose us", tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#f8fafc', tab: 'style' },
  ],
  defaultSettings: { heading: 'Why customers choose us', backgroundColor: '#f8fafc' },
};

export function ChecklistFeatures({ settings, blocks }: SectionComponentProps<ChecklistFeaturesSettings>) {
  const items = (blocks?.length ? blocks.map((b) => b.settings as unknown as ChecklistItemSettings) : []) as ChecklistItemSettings[];

  if (!items.length) return null;

  return (
    <div className="px-4 py-14 sm:py-16" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-3xl">
        {settings.heading ? (
          <h2 className="mb-8 text-center text-2xl font-extrabold text-neutral-900 sm:text-3xl">{settings.heading}</h2>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm shadow-purple-500/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-purple-500/10"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff71cd] to-[#9b51e0] text-white shadow-sm">
                <Check size={14} strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900">{item.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-neutral-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
