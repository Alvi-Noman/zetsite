import { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import type { SectionDefinition, SectionFamily, Theme } from '@zetsite/theme-kit';
import { familyFor } from '@zetsite/theme-kit';
import { Input } from '@/components/ui';
import { SECTION_CATEGORIES } from './sectionCategories';

type CategoryEntry = { kind: 'section'; def: SectionDefinition } | { kind: 'family'; family: SectionFamily };

// Collapses any section types that belong to a family (e.g. 'hero' + 'shopHero')
// into a single family entry, so the merchant picks a job ("Hero") before a
// design, instead of seeing every design variant as its own top-level row.
function entriesForCategory(theme: Theme, types: string[]): CategoryEntry[] {
  const entries: CategoryEntry[] = [];
  const seenFamilies = new Set<string>();
  for (const type of types) {
    const def = theme.sections[type];
    if (!def) continue;
    const family = familyFor(theme, type);
    if (family) {
      if (seenFamilies.has(family.id)) continue;
      seenFamilies.add(family.id);
      entries.push({ kind: 'family', family });
    } else {
      entries.push({ kind: 'section', def });
    }
  }
  return entries;
}

const RECENT_KEY = 'zetsite:content-editor:recent-section-types';

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushRecentSectionType(type: string) {
  const next = [type, ...readRecent().filter((t) => t !== type)].slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export default function AddSectionPopover({
  theme,
  onAdd,
  className,
}: {
  theme: Theme;
  onAdd: (type: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [openFamily, setOpenFamily] = useState<SectionFamily | null>(null);
  const [showAllDesigns, setShowAllDesigns] = useState(false);
  const available = useMemo(
    () => Object.values(theme.sections).filter((def) => def.schema.type !== 'header' && def.schema.type !== 'footer'),
    [theme],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return available.filter((def) => def.schema.label.toLowerCase().includes(q));
  }, [available, query]);

  const recent = useMemo(() => {
    if (query.trim()) return [];
    return readRecent()
      .map((type) => theme.sections[type])
      .filter(Boolean);
  }, [theme, query]);

  function handleAdd(type: string) {
    pushRecentSectionType(type);
    onAdd(type);
  }

  if (openFamily) {
    return (
      <div className={`max-h-80 overflow-y-auto rounded-md border border-border bg-surface shadow-md ${className ?? ''}`}>
        <div className="sticky top-0 flex items-center gap-1.5 border-b border-border bg-surface p-2">
          <button
            type="button"
            onClick={() => setOpenFamily(null)}
            aria-label="Back to sections"
            className="rounded p-1 text-ink-tertiary hover:bg-surface-hover hover:text-ink"
          >
            <ArrowLeft size={14} />
          </button>
          <p className="text-sm font-medium text-ink">{openFamily.label} — choose a design</p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2">
          {(showAllDesigns ? openFamily.variants : openFamily.variants.slice(0, 2)).map((variant) => (
            <button
              key={variant.sectionType}
              type="button"
              onClick={() => handleAdd(variant.sectionType)}
              className="flex flex-col gap-1.5 rounded-md border border-border p-1.5 text-left hover:border-link hover:bg-surface-hover"
            >
              <variant.Skeleton />
              <span className="text-xs font-medium text-ink">{variant.label}</span>
            </button>
          ))}
        </div>
        {openFamily.variants.length > 2 && (
          <button
            type="button"
            onClick={() => setShowAllDesigns((prev) => !prev)}
            className="block w-full border-t border-border px-3 py-2 text-center text-xs font-medium text-link hover:bg-surface-hover"
          >
            {showAllDesigns ? 'Show less' : `See all (${openFamily.variants.length} designs)`}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`max-h-80 overflow-y-auto rounded-md border border-border bg-surface shadow-md ${className ?? ''}`}>
      <div className="sticky top-0 border-b border-border bg-surface p-2">
        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sections" className="pl-7" />
        </div>
      </div>

      {filtered ? (
        <div className="py-1">
          {filtered.length === 0 && <p className="px-3 py-2 text-sm text-ink-tertiary">No matching sections</p>}
          {filtered.map((def) => (
            <button
              key={def.schema.type}
              type="button"
              onClick={() => handleAdd(def.schema.type)}
              className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-hover"
            >
              {def.schema.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          {recent.length > 0 && (
            <div className="border-b border-border py-1">
              <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">Recently used</p>
              {recent.map((def) => (
                <button
                  key={`recent-${def.schema.type}`}
                  type="button"
                  onClick={() => handleAdd(def.schema.type)}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-hover"
                >
                  {def.schema.label}
                </button>
              ))}
            </div>
          )}
          {SECTION_CATEGORIES.map((category) => {
            const entries = entriesForCategory(theme, category.types);
            if (entries.length === 0) return null;
            return (
              <div key={category.label} className="border-b border-border py-1 last:border-0">
                <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">{category.label}</p>
                {entries.map((entry) =>
                  entry.kind === 'family' ? (
                    <button
                      key={`family-${entry.family.id}`}
                      type="button"
                      onClick={() => {
                        setShowAllDesigns(false);
                        setOpenFamily(entry.family);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-surface-hover"
                    >
                      {entry.family.label}
                      <span className="text-[11px] text-ink-tertiary">{entry.family.variants.length} designs</span>
                    </button>
                  ) : (
                    <button
                      key={entry.def.schema.type}
                      type="button"
                      onClick={() => handleAdd(entry.def.schema.type)}
                      className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-hover"
                    >
                      {entry.def.schema.label}
                    </button>
                  ),
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
