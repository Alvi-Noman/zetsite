import { useEffect, useMemo, useState } from 'react';
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
import type { PageSection } from '@zetsite/shared';
import type { SectionSchema, Theme } from '@zetsite/theme-kit';
import { createDefaultBlocks } from '@zetsite/theme-kit';
import SectionListItem from './SectionListItem';
import BlockList from './BlockList';
import InsertLine from './InsertLine';
import AddSectionPopover, { pushRecentSectionType } from './AddSectionPopover';
import ContextMenu, { type ContextMenuItem } from './ContextMenu';

// A landing page is generated for exactly one product; pre-fill any 'product'
// field with it on insert so a merchant never has to re-pick the same product
// for every section that needs one (Hero's live price, the order form, etc.).
function withSourceProduct(schema: SectionSchema, sourceProductHandle: string | null): Record<string, unknown> {
  const settings: Record<string, unknown> = { ...schema.defaultSettings };
  if (sourceProductHandle) {
    for (const field of schema.fields) {
      if (field.type === 'product') settings[field.key] = sourceProductHandle;
    }
  }
  return settings;
}

export default function SectionList({
  sections,
  theme,
  selectedIds,
  onSelect,
  onChange,
  onDuplicate,
  onDelete,
  onCopyStyle,
  onPasteStyle,
  clipboardStyleType,
  selectedBlock,
  onSelectBlock,
  sourceProductHandle,
}: {
  sections: PageSection[];
  theme: Theme;
  selectedIds: string[];
  onSelect: (id: string, e: React.MouseEvent) => void;
  onChange: (sections: PageSection[]) => void;
  onDuplicate: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onCopyStyle: (id: string) => void;
  onPasteStyle: (ids: string[]) => void;
  clipboardStyleType: string | null;
  selectedBlock: { sectionId: string; blockId: string } | null;
  onSelectBlock: (sectionId: string, blockId: string) => void;
  sourceProductHandle: string | null;
}) {
  const [menu, setMenu] = useState<{ x: number; y: number; sectionId: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (selectedBlock) setExpandedId(selectedBlock.sectionId);
  }, [selectedBlock]);

  const header = sections.find((s) => s.type === 'header');
  const footer = sections.find((s) => s.type === 'footer');
  const template = useMemo(() => sections.filter((s) => s.type !== 'header' && s.type !== 'footer'), [sections]);

  function setTemplate(next: PageSection[]) {
    onChange([...(header ? [header] : []), ...next, ...(footer ? [footer] : [])]);
  }

  function addFixedSection(type: 'header' | 'footer') {
    const def = theme.sections[type];
    if (!def) return;
    const newSection: PageSection = {
      id: crypto.randomUUID(),
      type,
      settings: { ...def.schema.defaultSettings },
      blocks: createDefaultBlocks(def.schema, theme),
    };
    onChange(type === 'header' ? [newSection, ...sections] : [...sections, newSection]);
  }

  function updateSection(id: string, patch: Partial<PageSection>) {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = template.findIndex((s) => s.id === active.id);
    const newIndex = template.findIndex((s) => s.id === over.id);
    setTemplate(arrayMove(template, oldIndex, newIndex));
  }

  function insertAt(index: number, type: string) {
    const def = theme.sections[type];
    if (!def) return;
    const newSection: PageSection = {
      id: crypto.randomUUID(),
      type,
      settings: withSourceProduct(def.schema, sourceProductHandle),
      blocks: createDefaultBlocks(def.schema, theme),
    };
    const next = [...template];
    next.splice(index, 0, newSection);
    setTemplate(next);
    onSelect(newSection.id, {} as React.MouseEvent);
  }

  function appendSection(type: string) {
    insertAt(template.length, type);
    setAddOpen(false);
  }

  function contextItemsFor(sectionId: string): ContextMenuItem[] {
    const section = sections.find((s) => s.id === sectionId);
    const ids = selectedIds.includes(sectionId) ? selectedIds : [sectionId];
    return [
      { label: 'Duplicate', onClick: () => onDuplicate(ids) },
      { label: 'Copy style', onClick: () => onCopyStyle(sectionId), disabled: !section },
      {
        label: 'Paste style',
        onClick: () => onPasteStyle(ids),
        disabled: !clipboardStyleType || clipboardStyleType !== section?.type,
      },
      ...(section?.type !== 'header' && section?.type !== 'footer'
        ? [{ label: 'Delete', onClick: () => onDelete(ids), danger: true }]
        : []),
    ];
  }

  function renderFixedItem(section: PageSection, groupLabel: string) {
    const def = theme.sections[section.type];
    const allowedBlockTypes = def?.schema.allowedBlockTypes ?? [];
    const visibility = section.visibility;
    const hasHiddenBreakpoint = !!visibility && (!visibility.desktop || !visibility.tablet || !visibility.mobile);

    return (
      <SectionListItem
        key={section.id}
        section={section}
        label={def?.schema.label ?? groupLabel}
        active={selectedIds[selectedIds.length - 1] === section.id}
        multiSelected={selectedIds.includes(section.id)}
        hasHiddenBreakpoint={hasHiddenBreakpoint}
        expandable={allowedBlockTypes.length > 0}
        expanded={expandedId === section.id}
        onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
        onSelect={(e) => onSelect(section.id, e)}
        onDuplicate={undefined}
        onDelete={undefined}
        sortable={false}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY, sectionId: section.id });
        }}
      >
        <BlockList
          theme={theme}
          allowedBlockTypes={allowedBlockTypes}
          blocks={section.blocks ?? []}
          selectedBlockId={selectedBlock?.sectionId === section.id ? selectedBlock.blockId : null}
          onSelectBlock={(blockId) => onSelectBlock(section.id, blockId)}
          onChange={(blocks) => updateSection(section.id, { blocks })}
        />
      </SectionListItem>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3 space-y-4">
      <div>
        <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Header</p>
        {header ? (
          renderFixedItem(header, 'Header')
        ) : (
          <button
            type="button"
            onClick={() => addFixedSection('header')}
            className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-sm text-ink-tertiary hover:bg-surface-hover"
          >
            <Plus size={13} />
            Add header
          </button>
        )}
      </div>

      <div>
        <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Template</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={template.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <InsertLine theme={theme} onAdd={(type) => insertAt(0, type)} />
            {template.map((section, index) => {
              const def = theme.sections[section.type];
              const allowedBlockTypes = def?.schema.allowedBlockTypes ?? [];
              const visibility = section.visibility;
              const hasHiddenBreakpoint = !!visibility && (!visibility.desktop || !visibility.tablet || !visibility.mobile);
              return (
                <div key={section.id}>
                  <SectionListItem
                    section={section}
                    label={def?.schema.label ?? section.type}
                    active={selectedIds[selectedIds.length - 1] === section.id}
                    multiSelected={selectedIds.includes(section.id)}
                    hasHiddenBreakpoint={hasHiddenBreakpoint}
                    expandable={allowedBlockTypes.length > 0}
                    expanded={expandedId === section.id}
                    onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
                    onSelect={(e) => onSelect(section.id, e)}
                    onDelete={() => onDelete([section.id])}
                    onDuplicate={() => onDuplicate([section.id])}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenu({ x: e.clientX, y: e.clientY, sectionId: section.id });
                    }}
                  >
                    <BlockList
                      theme={theme}
                      allowedBlockTypes={allowedBlockTypes}
                      blocks={section.blocks ?? []}
                      selectedBlockId={selectedBlock?.sectionId === section.id ? selectedBlock.blockId : null}
                      onSelectBlock={(blockId) => onSelectBlock(section.id, blockId)}
                      onChange={(blocks) => updateSection(section.id, { blocks })}
                    />
                  </SectionListItem>
                  <InsertLine theme={theme} onAdd={(type) => insertAt(index + 1, type)} />
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
        {template.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-ink-tertiary">No sections yet — add one below.</p>
        )}

        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-sm text-ink-secondary hover:bg-surface-hover"
          >
            <Plus size={13} />
            Add section
          </button>
          {addOpen && (
            <AddSectionPopover
              theme={theme}
              onAdd={(type) => {
                appendSection(type);
                pushRecentSectionType(type);
              }}
              className="absolute bottom-full left-0 right-0 mb-1"
            />
          )}
        </div>
      </div>

      <div>
        <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Footer</p>
        {footer ? (
          renderFixedItem(footer, 'Footer')
        ) : (
          <button
            type="button"
            onClick={() => addFixedSection('footer')}
            className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-sm text-ink-tertiary hover:bg-surface-hover"
          >
            <Plus size={13} />
            Add footer
          </button>
        )}
      </div>

      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={contextItemsFor(menu.sectionId)} onClose={() => setMenu(null)} />
      )}
    </div>
  );
}
