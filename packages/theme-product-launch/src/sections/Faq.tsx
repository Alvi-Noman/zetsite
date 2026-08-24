import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, WIDTH_FIELD, ALIGN_CLASS, widthClass, faqJsonLd, Editable, type ContentAlign, type ContentWidth } from '@zetsite/theme-kit';

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

function FaqRow({
  item,
  open,
  onToggle,
  fieldChange,
}: {
  item: FaqItemData;
  open: boolean;
  onToggle: () => void;
  fieldChange?: (key: string, value: string) => void;
}) {
  return (
    <div className="border-b border-neutral-200 py-4">
      <div
        role={fieldChange ? undefined : 'button'}
        tabIndex={fieldChange ? undefined : 0}
        onClick={fieldChange ? undefined : onToggle}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-neutral-900 cursor-pointer"
      >
        <Editable as="span" fieldKey="question" value={item.question ?? ''} onFieldChange={fieldChange} className="block flex-1" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="shrink-0"
        >
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open ? (
        <Editable
          as="p"
          fieldKey="answer"
          value={item.answer ?? ''}
          onFieldChange={fieldChange}
          html
          multiline
          className="prose prose-neutral mt-3 text-sm text-neutral-600"
        />
      ) : null}
    </div>
  );
}

export function Faq({ settings, blocks, renderBlocks, onBlockFieldChange }: SectionComponentProps<FaqSettings>) {
  const itemBlocks = (blocks ?? []).filter((b) => b.type === 'faqItem');
  const items = itemBlocks.map((b) => b.settings as FaqItemData);
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
    <section className={`px-6 py-10 mx-auto ${widthClass(settings.width, 'max-w-2xl')}`}>
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} /> : null}
      <div className={`flex flex-col mb-8 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      {renderBlocks?.((b) => b.type === 'divider')}
      <div>
        {items.length === 0 ? (
          <p className="text-center text-sm text-neutral-400">Add a question block</p>
        ) : (
          items.map((item, i) => (
            <FaqRow
              key={itemBlocks[i].id}
              item={item}
              open={openIndexes.has(i)}
              onToggle={() => toggle(i)}
              fieldChange={onBlockFieldChange ? (key, value) => onBlockFieldChange(itemBlocks[i].id, key, value) : undefined}
            />
          ))
        )}
      </div>
    </section>
  );
}
