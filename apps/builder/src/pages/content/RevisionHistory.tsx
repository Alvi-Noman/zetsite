import { useEffect, useRef, useState } from 'react';
import { History, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, IconButton } from '@/components/ui';

interface Revision {
  index: number;
  publishedAt: string;
  sectionCount: number;
}

interface Diff {
  added: string[];
  removed: string[];
  countChanged: boolean;
  currentCount: number;
  revisionCount: number;
}

export default function RevisionHistory({
  basePath,
  supportsDiff = false,
  onRestore,
}: {
  basePath: string;
  supportsDiff?: boolean;
  onRestore: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [diffs, setDiffs] = useState<Record<number, Diff>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const res = await api.get(`${basePath}/revisions`);
      setRevisions(res.data.revisions);
    }
  }

  async function toggleDiff(index: number) {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      return;
    }
    setExpandedIndex(index);
    if (!diffs[index] && supportsDiff) {
      const res = await api.get(`${basePath}/revisions/${index}/diff`);
      setDiffs((prev) => ({ ...prev, [index]: res.data }));
    }
  }

  async function restore(index: number) {
    await api.post(`${basePath}/revisions/${index}/restore`);
    setOpen(false);
    onRestore();
  }

  return (
    <div ref={ref} className="relative">
      <IconButton onClick={toggle} aria-label="Revision history" title="Revision history">
        <History size={16} />
      </IconButton>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-80 rounded-md border border-border bg-surface shadow-md">
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">Published history</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {revisions === null && <p className="px-3 py-3 text-sm text-ink-tertiary">Loading…</p>}
            {revisions?.length === 0 && (
              <p className="px-3 py-3 text-sm text-ink-tertiary">No previous versions yet.</p>
            )}
            {revisions?.map((r) => (
              <div key={r.index} className="border-b border-border last:border-0">
                <div className="flex items-center justify-between px-3 py-2 hover:bg-surface-hover">
                  <button
                    type="button"
                    onClick={() => supportsDiff && toggleDiff(r.index)}
                    className="flex flex-1 items-center gap-1.5 text-left"
                  >
                    {supportsDiff && <ChevronDown size={12} className={`text-ink-tertiary transition-transform ${expandedIndex === r.index ? 'rotate-180' : ''}`} />}
                    <div>
                      <p className="text-sm text-ink">{new Date(r.publishedAt).toLocaleString()}</p>
                      <p className="text-xs text-ink-tertiary">{r.sectionCount} sections</p>
                    </div>
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => restore(r.index)}>
                    Restore to draft
                  </Button>
                </div>
                {supportsDiff && expandedIndex === r.index && (
                  <div className="bg-surface-secondary px-3 py-2 text-xs">
                    {!diffs[r.index] ? (
                      <p className="text-ink-tertiary">Loading diff…</p>
                    ) : diffs[r.index].added.length === 0 && diffs[r.index].removed.length === 0 && !diffs[r.index].countChanged ? (
                      <p className="text-ink-tertiary">No structural changes since this version.</p>
                    ) : (
                      <div className="space-y-1">
                        {diffs[r.index].added.map((t) => (
                          <p key={`a-${t}`} className="text-success">+ Added {t}</p>
                        ))}
                        {diffs[r.index].removed.map((t) => (
                          <p key={`r-${t}`} className="text-danger">− Removed {t}</p>
                        ))}
                        {diffs[r.index].countChanged && diffs[r.index].added.length === 0 && diffs[r.index].removed.length === 0 && (
                          <p className="text-ink-tertiary">
                            Section count changed ({diffs[r.index].revisionCount} → {diffs[r.index].currentCount})
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
