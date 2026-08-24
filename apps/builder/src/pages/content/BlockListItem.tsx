import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { PageBlock } from '@zetsite/shared';
import { IconButton } from '@/components/ui';

export default function BlockListItem({
  block,
  label,
  selected,
  onSelect,
  onDelete,
}: {
  block: PageBlock;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs',
        isDragging ? 'opacity-50' : '',
        selected ? 'border-link bg-link-subtle text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-ink-tertiary hover:text-ink"
        aria-label="Drag to reorder"
      >
        <GripVertical size={12} />
      </button>
      <button type="button" onClick={onSelect} className="flex-1 truncate text-left">
        {label}
      </button>
      <IconButton onClick={onDelete} aria-label="Remove block">
        <Trash2 size={11} />
      </IconButton>
    </div>
  );
}
