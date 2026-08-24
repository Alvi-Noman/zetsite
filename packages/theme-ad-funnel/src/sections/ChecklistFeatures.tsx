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
    { type: 'checklistItem', settings: { title: 'Military-grade drop protection', description: "Won't damage your phone even if dropped. Uses shock-absorbing technology." } },
    { type: 'checklistItem', settings: { title: "Won't fade or yellow", description: 'Stays looking brand new even after long-term use.' } },
    { type: 'checklistItem', settings: { title: 'MagSafe (wireless charging) support', description: "No need to remove the cover to charge. Built-in magnetic ring included." } },
    { type: 'checklistItem', settings: { title: 'Camera lens guard', description: 'The raised bezel design protects your expensive lenses from scratching on surfaces.' } },
    { type: 'checklistItem', settings: { title: 'Slim fit & premium grip', description: 'Maximum protection without adding bulk. No risk of slipping from your hand.' } },
  ],
  fields: [
    { key: 'heading', type: 'text', label: 'Heading', default: 'Why is this the best choice for you?', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
  ],
  defaultSettings: { heading: 'Why is this the best choice for you?', backgroundColor: '#ffffff' },
};

export function ChecklistFeatures({ settings, blocks }: SectionComponentProps<ChecklistFeaturesSettings>) {
  const items = (blocks?.length ? blocks.map((b) => b.settings as unknown as ChecklistItemSettings) : []) as ChecklistItemSettings[];

  if (!items.length) return null;

  return (
    <div className="px-4 py-4" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto max-w-2xl">
        {settings.heading ? (
          <h2 className="mb-5 text-center text-[22px] font-extrabold leading-snug text-[#111827] sm:text-2xl">{settings.heading}</h2>
        ) : null}
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 rounded-[10px] border border-[#f3f4f6] bg-white p-3.5 shadow-[0_2px_10px_rgba(59,130,246,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(59,130,246,0.15)]"
            >
              <span className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white">
                <Check size={14} strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-[#1a2542]">{item.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#5b6883]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
