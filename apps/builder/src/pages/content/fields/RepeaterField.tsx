import { Plus, Trash2, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { SettingField } from '@zetsite/theme-kit';
import { IconButton, Button } from '@/components/ui';
import FieldRow from './FieldRow';

export default function RepeaterField({
  label,
  itemFields,
  itemDefault,
  value,
  onChange,
}: {
  label: string;
  itemFields: SettingField[];
  itemDefault?: Record<string, unknown>;
  value: Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null);

  function updateItem(index: number, patch: Record<string, unknown>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    onChange([...items, { ...(itemDefault ?? {}) }]);
    setOpenIndex(items.length);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    setOpenIndex(null);
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-medium text-ink-secondary">{label}</span>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="rounded-md border border-border">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex flex-1 items-center gap-1.5 text-left text-sm text-ink"
              >
                <ChevronRight size={13} className={openIndex === index ? 'rotate-90 transition-transform' : 'transition-transform'} />
                Item {index + 1}
              </button>
              <IconButton onClick={() => moveItem(index, 'up')} disabled={index === 0} aria-label="Move up">
                <ChevronUp size={13} />
              </IconButton>
              <IconButton onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} aria-label="Move down">
                <ChevronDown size={13} />
              </IconButton>
              <IconButton onClick={() => removeItem(index)} aria-label="Remove item">
                <Trash2 size={13} />
              </IconButton>
            </div>
            {openIndex === index && (
              <div className="space-y-3 border-t border-border p-3">
                {itemFields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={item[field.key] ?? field.default ?? ''}
                    onChange={(v) => updateItem(index, { [field.key]: v })}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={addItem}>
        <Plus size={13} />
        Add item
      </Button>
    </div>
  );
}
