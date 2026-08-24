import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { PageBlock } from '@zetsite/shared';
import type { Theme } from '@zetsite/theme-kit';
import BlockListItem from './BlockListItem';
import AddBlockPopover from './AddBlockPopover';

export default function BlockList({
  theme,
  allowedBlockTypes,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onChange,
}: {
  theme: Theme;
  allowedBlockTypes: string[];
  blocks: PageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onChange: (blocks: PageBlock[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const addableTypes = allowedBlockTypes.map((t) => theme.blocks[t]).filter(Boolean);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function addBlock(type: string) {
    const def = theme.blocks[type];
    if (!def) return;
    const newBlock: PageBlock = { id: crypto.randomUUID(), type, settings: { ...def.schema.defaultSettings } };
    onChange([...blocks, newBlock]);
    onSelectBlock(newBlock.id);
    setAddOpen(false);
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  return (
    <div className="ml-4 space-y-1 border-l border-border pl-3 pb-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockListItem
              key={block.id}
              block={block}
              label={theme.blocks[block.type]?.schema.label ?? block.type}
              selected={block.id === selectedBlockId}
              onSelect={() => onSelectBlock(block.id)}
              onDelete={() => removeBlock(block.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {addableTypes.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-xs text-link hover:bg-surface-hover"
          >
            <Plus size={12} />
            Add block
          </button>
          {addOpen && (
            <AddBlockPopover
              theme={theme}
              allowedBlockTypes={allowedBlockTypes}
              onAdd={addBlock}
              className="absolute left-0 top-full z-20 mt-1"
            />
          )}
        </div>
      )}
    </div>
  );
}
