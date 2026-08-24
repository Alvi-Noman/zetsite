import { useState } from 'react';
import clsx from 'clsx';
import type { PageBlock } from '@zetsite/shared';
import type { SectionSchema } from '@zetsite/theme-kit';
import FieldRow from './fields/FieldRow';

type Tab = 'content' | 'style';

export default function BlockSettingsPanel({
  block,
  schema,
  onChange,
}: {
  block: PageBlock;
  schema: SectionSchema | undefined;
  onChange: (settings: Record<string, unknown>) => void;
}) {
  const [tab, setTab] = useState<Tab>('content');

  if (!schema) {
    return <div className="p-4 text-sm text-ink-tertiary">This block type isn&apos;t available in the active theme.</div>;
  }

  const contentFields = schema.fields.filter((f) => (f.tab ?? 'content') === 'content');
  const styleFields = schema.fields.filter((f) => f.tab === 'style');

  function setField(key: string, value: unknown) {
    onChange({ ...block.settings, [key]: value });
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'content', label: 'Content' },
    { id: 'style', label: 'Style' },
  ];

  const fields = tab === 'content' ? contentFields : styleFields;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        {schema.label} block
      </div>
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex-1 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab === t.id ? 'border-link text-ink' : 'border-transparent text-ink-tertiary hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {fields.length === 0 ? (
          <p className="text-sm text-ink-tertiary">No {tab} settings for this block.</p>
        ) : (
          fields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              value={block.settings[field.key] ?? field.default ?? ''}
              onChange={(v) => setField(field.key, v)}
            />
          ))
        )}
      </div>
    </div>
  );
}
