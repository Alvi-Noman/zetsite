import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, EyeOff, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { PageSection } from '@zetsite/shared';
import { IconButton } from '@/components/ui';

export default function SectionListItem({
  section,
  label,
  active,
  multiSelected,
  hasHiddenBreakpoint,
  expandable,
  expanded,
  onToggleExpand,
  onSelect,
  onDelete,
  onDuplicate,
  onContextMenu,
  children,
  sortable = true,
}: {
  section: PageSection;
  label: string;
  active: boolean;
  multiSelected: boolean;
  hasHiddenBreakpoint: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onSelect: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  children?: ReactNode;
  sortable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !sortable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        onContextMenu={onContextMenu}
        className={clsx(
          'group flex items-center gap-1 rounded-md border px-2 py-2 text-sm',
          isDragging ? 'opacity-50' : '',
          active
            ? 'border-link bg-link-subtle text-ink'
            : multiSelected
              ? 'border-link/50 bg-surface-selected text-ink'
              : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover',
        )}
      >
        {expandable && (
          <button type="button" onClick={onToggleExpand} className="text-ink-tertiary hover:text-ink" aria-label="Toggle blocks">
            <ChevronRight size={13} className={expanded ? 'rotate-90 transition-transform' : 'transition-transform'} />
          </button>
        )}
        {sortable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-ink-tertiary hover:text-ink"
            aria-label="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>
        )}
        <button type="button" onClick={onSelect} className="flex flex-1 items-center gap-1.5 truncate text-left">
          {label}
          {hasHiddenBreakpoint && <EyeOff size={12} className="shrink-0 text-ink-tertiary" />}
        </button>
        {onDuplicate && (
          <IconButton onClick={onDuplicate} aria-label="Duplicate section">
            <Copy size={13} />
          </IconButton>
        )}
        {onDelete && (
          <IconButton onClick={onDelete} aria-label="Delete section">
            <Trash2 size={13} />
          </IconButton>
        )}
      </div>
      {expanded && children}
    </div>
  );
}
