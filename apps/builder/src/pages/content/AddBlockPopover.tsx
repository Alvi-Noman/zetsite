import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Theme } from '@zetsite/theme-kit';
import { Input } from '@/components/ui';
import { BLOCK_CATEGORIES } from './blockCategories';

export default function AddBlockPopover({
  theme,
  allowedBlockTypes,
  onAdd,
  className,
}: {
  theme: Theme;
  allowedBlockTypes: string[];
  onAdd: (type: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const allowed = new Set(allowedBlockTypes);

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return allowedBlockTypes.map((t) => theme.blocks[t]).filter((def) => def && def.schema.label.toLowerCase().includes(q));
  }, [allowedBlockTypes, theme, query]);

  return (
    <div className={`max-h-80 w-56 overflow-y-auto rounded-md border border-border bg-surface shadow-md ${className ?? ''}`}>
      <div className="sticky top-0 border-b border-border bg-surface p-2">
        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blocks" className="pl-7" />
        </div>
      </div>

      {filtered ? (
        <div className="py-1">
          {filtered.length === 0 && <p className="px-3 py-2 text-sm text-ink-tertiary">No matching blocks</p>}
          {filtered.map((def) => (
            <button
              key={def!.schema.type}
              type="button"
              onClick={() => onAdd(def!.schema.type)}
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-hover"
            >
              {def!.schema.label}
            </button>
          ))}
        </div>
      ) : (
        BLOCK_CATEGORIES.map((category) => {
          const defs = category.types.filter((t) => allowed.has(t)).map((t) => theme.blocks[t]).filter(Boolean);
          if (defs.length === 0) return null;
          return (
            <div key={category.label} className="border-b border-border py-1 last:border-0">
              <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">{category.label}</p>
              {defs.map((def) => (
                <button
                  key={def.schema.type}
                  type="button"
                  onClick={() => onAdd(def.schema.type)}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-hover"
                >
                  {def.schema.label}
                </button>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
