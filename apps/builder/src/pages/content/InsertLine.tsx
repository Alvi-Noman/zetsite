import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { Theme } from '@zetsite/theme-kit';
import AddSectionPopover from './AddSectionPopover';

export default function InsertLine({ theme, onAdd }: { theme: Theme; onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="group/insert relative h-2 -my-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Insert section here"
        className={`absolute inset-x-1 top-1/2 z-10 flex -translate-y-1/2 items-center opacity-0 transition-opacity group-hover/insert:opacity-100 ${open ? 'opacity-100' : ''}`}
      >
        <span className="h-px flex-1 bg-link" />
        <span className="mx-1 flex h-4 w-4 items-center justify-center rounded-full bg-link text-white">
          <Plus size={11} />
        </span>
        <span className="h-px flex-1 bg-link" />
      </button>
      {open && (
        <AddSectionPopover
          theme={theme}
          onAdd={(type) => {
            onAdd(type);
            setOpen(false);
          }}
          className="absolute left-0 right-0 top-3 z-20"
        />
      )}
    </div>
  );
}
