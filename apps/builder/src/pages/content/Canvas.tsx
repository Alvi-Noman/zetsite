import { Copy, Trash2, ChevronUp, ChevronDown, Clipboard } from 'lucide-react';
import clsx from 'clsx';
import type { PageBlock, PageSection } from '@zetsite/shared';
import type { Theme } from '@zetsite/theme-kit';
import {
  getSection,
  getBlock,
  getVisibilityClassName,
  getSectionWrapperStyle,
  sectionCssScopeClass,
  SectionCustomCss,
  FallbackSection,
} from '@zetsite/theme-kit';

export type DeviceKind = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<DeviceKind, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export default function Canvas({
  sections,
  theme,
  storeSlug,
  device,
  selectedId,
  onSelect,
  onFieldChange,
  selectedBlock,
  onSelectBlock,
  onBlockFieldChange,
  onDuplicate,
  onDelete,
  onMove,
  onCopyStyle,
  onPasteStyle,
  clipboardStyleType,
}: {
  sections: PageSection[];
  theme: Theme;
  storeSlug: string;
  device: DeviceKind;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFieldChange: (sectionId: string, key: string, value: unknown) => void;
  selectedBlock: { sectionId: string; blockId: string } | null;
  onSelectBlock: (sectionId: string, blockId: string) => void;
  onBlockFieldChange: (sectionId: string, blockId: string, key: string, value: unknown) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onCopyStyle: (id: string) => void;
  onPasteStyle: (id: string) => void;
  clipboardStyleType: string | null;
}) {
  function renderCanvasBlocks(
    sectionId: string,
    blocks: PageBlock[] | undefined,
    filter?: (block: PageBlock) => boolean,
  ) {
    return (blocks ?? [])
      .filter((b) => !filter || filter(b))
      .map((block) => {
        const def = getBlock(theme, block.type);
        if (!def) return null;
        const settings = { ...def.schema.defaultSettings, ...block.settings };
        const selected = selectedBlock?.sectionId === sectionId && selectedBlock.blockId === block.id;

        return (
          <div
            key={block.id}
            className="relative group/block"
            onClick={(e) => {
              e.stopPropagation();
              onSelectBlock(sectionId, block.id);
            }}
          >
            <div
              className={clsx(
                'pointer-events-none absolute -inset-1 z-10 rounded border-2 border-dashed transition-colors',
                selected ? 'border-amber-500' : 'border-transparent group-hover/block:border-amber-500/50',
              )}
            />
            <def.Component
              settings={settings}
              storeSlug={storeSlug}
              onFieldChange={(key, value) => onBlockFieldChange(sectionId, block.id, key, value)}
            />
          </div>
        );
      });
  }

  return (
    <div className="h-full overflow-y-auto bg-neutral-100 p-6">
      <div
        onClickCapture={(e) => {
          const anchor = (e.target as HTMLElement).closest('a');
          if (anchor) e.preventDefault();
        }}
        className="mx-auto border border-border bg-white shadow-sm transition-[width] duration-200"
        style={{ width: DEVICE_WIDTH[device], maxWidth: '100%' }}
      >
        {sections.length === 0 ? (
          <div className="p-16 text-center text-sm text-neutral-400">
            Add a section from the panel on the left to see it here.
          </div>
        ) : (
          sections.map((section, index) => {
            const def = getSection(theme, section.type);
            const settings = { ...def?.schema.defaultSettings, ...section.settings };
            const selected = section.id === selectedId;
            const visibilityClass = getVisibilityClassName(section.visibility);

            return (
              <div key={section.id}>
              <SectionCustomCss section={section} />
              <div
                className={clsx(
                  'relative group/section',
                  visibilityClass,
                  sectionCssScopeClass(section),
                  section.customClass,
                )}
                style={getSectionWrapperStyle(section)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(section.id);
                }}
              >
                <div
                  className={clsx(
                    'pointer-events-none absolute inset-0 z-10 border-2 transition-colors',
                    selected
                      ? 'border-link'
                      : 'border-transparent group-hover/section:border-link/40',
                  )}
                />
                {selected && (
                  <div className="absolute -top-8 left-0 z-20 flex items-center gap-0.5 rounded-t-md bg-link px-1.5 py-1 text-white shadow-sm">
                    <span className="mr-1 px-1 text-xs font-medium">
                      {def?.schema.label ?? section.type}
                    </span>
                    <button
                      type="button"
                      title="Move up"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(section.id, 'up');
                      }}
                      className="rounded p-1 hover:bg-white/20 disabled:opacity-40"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={index === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(section.id, 'down');
                      }}
                      className="rounded p-1 hover:bg-white/20 disabled:opacity-40"
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button
                      type="button"
                      title="Copy style"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyStyle(section.id);
                      }}
                      className="rounded p-1 hover:bg-white/20"
                    >
                      <Clipboard size={13} />
                    </button>
                    {clipboardStyleType === section.type && (
                      <button
                        type="button"
                        title="Paste style"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPasteStyle(section.id);
                        }}
                        className="rounded p-1 hover:bg-white/20"
                      >
                        <Clipboard size={13} className="rotate-180" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(section.id);
                      }}
                      className="rounded p-1 hover:bg-white/20"
                    >
                      <Copy size={13} />
                    </button>
                    {section.type !== 'header' && section.type !== 'footer' && (
                      <button
                        type="button"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(section.id);
                        }}
                        className="rounded p-1 hover:bg-white/20"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
                {def ? (
                  <def.Component
                    settings={settings}
                    storeSlug={storeSlug}
                    onFieldChange={(key, value) => onFieldChange(section.id, key, value)}
                    blocks={section.blocks}
                    renderBlocks={(filter) => <>{renderCanvasBlocks(section.id, section.blocks, filter)}</>}
                    onBlockFieldChange={(blockId, key, value) => onBlockFieldChange(section.id, blockId, key, value)}
                  />
                ) : (
                  <FallbackSection type={section.type} />
                )}
              </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
