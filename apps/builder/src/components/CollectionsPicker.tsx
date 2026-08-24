import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';
import { api } from '@/lib/api';

export interface Collection {
  id: string;
  name: string;
}

interface CollectionsPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export default function CollectionsPicker({ value, onChange }: CollectionsPickerProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/collections').then((res) => setCollections(res.data.collections));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = collections.filter((c) => value.includes(c.id));
  const filtered = collections.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const exactMatch = collections.some((c) => c.name.toLowerCase() === query.trim().toLowerCase());

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  async function createCollection() {
    const name = query.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const res = await api.post('/collections', { name });
      const collection: Collection = res.data.collection;
      setCollections((prev) =>
        prev.some((c) => c.id === collection.id)
          ? prev
          : [...prev, collection].sort((a, b) => a.name.localeCompare(b.name)),
      );
      onChange([...value, collection.id]);
      setQuery('');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1 rounded-sm bg-surface-secondary px-2.5 py-1 text-xs font-medium text-ink-secondary"
            >
              {c.name}
              <button
                type="button"
                aria-label={`Remove ${c.name}`}
                onClick={() => toggle(c.id)}
                className="text-ink-tertiary hover:text-ink"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm text-ink-secondary transition-colors hover:border-border-strong"
      >
        <span>{selected.length ? 'Add another collection' : 'Choose collections'}</span>
        <ChevronDown
          size={15}
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
        />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-md">
          <div className="border-b border-border p-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or create collection"
              className="w-full rounded-md border border-border px-2 py-1.5 text-sm text-ink focus:border-link focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim() && !exactMatch) {
                  e.preventDefault();
                  createCollection();
                }
              }}
            />
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && !query && (
              <p className="px-3 py-2 text-sm text-ink-tertiary">No collections yet</p>
            )}
            {filtered.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-hover"
              >
                <input
                  type="checkbox"
                  checked={value.includes(c.id)}
                  onChange={() => toggle(c.id)}
                  className="rounded border-border"
                />
                {c.name}
              </label>
            ))}

            {query.trim() && !exactMatch && (
              <button
                type="button"
                onClick={createCollection}
                disabled={creating}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-ink hover:bg-surface-hover disabled:opacity-60"
              >
                <Plus size={14} />
                {creating ? 'Creating...' : `Create "${query.trim()}"`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
