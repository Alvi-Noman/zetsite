import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, WIDTH_FIELD, ALIGN_CLASS, widthClass, faqJsonLd, type ContentAlign, type ContentWidth } from '@zetsite/theme-kit';

export interface FaqSettings {
  align: ContentAlign;
  width: ContentWidth;
  allowMultipleOpen: boolean;
  enableSchema: boolean;
}

export const faqSchema: SectionSchema = {
  type: 'faq',
  label: 'FAQ',
  allowedBlockTypes: ['heading', 'faqItem', 'divider'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Frequently asked questions', size: 'md' } },
    { type: 'faqItem', settings: {} },
  ],
  fields: [
    ALIGN_FIELD,
    WIDTH_FIELD,
    { key: 'allowMultipleOpen', type: 'boolean', label: 'Allow multiple questions open at once', default: true, tab: 'style' },
    { key: 'enableSchema', type: 'boolean', label: 'Enable FAQ rich results (SEO structured data)', default: true, tab: 'advanced' },
  ],
  defaultSettings: { align: 'center', width: 'page', allowMultipleOpen: true, enableSchema: true },
};

interface FaqItemData {
  question?: string;
  answer?: string;
}

function FaqRow({ item, open, onToggle }: { item: FaqItemData; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-black py-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-sm font-bold uppercase tracking-wide text-neutral-900"
      >
        {item.question}
        <Plus size={16} className={`transition-transform ${open ? 'rotate-45' : ''}`} />
      </button>
      {open ? <p className="mt-3 text-sm text-neutral-600">{item.answer}</p> : null}
    </div>
  );
}

export function Faq({ settings, blocks, renderBlocks }: SectionComponentProps<FaqSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'faqItem').map((b) => b.settings as FaqItemData);
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const allowMultipleOpen = settings.allowMultipleOpen ?? true;
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());
  const schema = (settings.enableSchema ?? true) ? faqJsonLd(items) : null;

  function toggle(i: number) {
    setOpenIndexes((prev) => {
      if (allowMultipleOpen) {
        const next = new Set(prev);
        next.has(i) ? next.delete(i) : next.add(i);
        return next;
      }
      return prev.has(i) ? new Set() : new Set([i]);
    });
  }

  return (
    <section className={`px-6 py-20 mx-auto bg-white ${widthClass(settings.width, 'max-w-2xl')}`}>
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /> : null}
      <div className={`flex flex-col mb-10 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      {renderBlocks?.((b) => b.type === 'divider')}
      <div>
        {items.length === 0 ? (
          <p className="text-center text-sm text-neutral-400">Add a question block</p>
        ) : (
          items.map((item, i) => (
            <FaqRow key={i} item={item} open={openIndexes.has(i)} onToggle={() => toggle(i)} />
          ))
        )}
      </div>
    </section>
  );
}
