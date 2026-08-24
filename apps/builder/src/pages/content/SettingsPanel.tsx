import { useState } from 'react';
import clsx from 'clsx';
import type { PageSection, SectionAnimation, SectionVisibility } from '@zetsite/shared';
import type { SectionSchema, Theme } from '@zetsite/theme-kit';
import { familyFor, mergeSettingsForVariantSwap } from '@zetsite/theme-kit';
import { Input, Textarea, Select, Button } from '@/components/ui';
import ColorField from './fields/ColorField';
import FieldRow from './fields/FieldRow';

type Tab = 'content' | 'style' | 'advanced';

const DEFAULT_VISIBILITY: SectionVisibility = { desktop: true, tablet: true, mobile: true };

export default function SettingsPanel({
  theme,
  section,
  schema,
  onSettingsChange,
  onSectionChange,
  onBlockFieldChange,
  onSaveAsGlobal,
  onOpenThemeSettings,
  onRemoveSection,
  sourceProductHandle,
}: {
  theme: Theme;
  section: PageSection;
  schema: SectionSchema | undefined;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  onSectionChange: (patch: Partial<PageSection>) => void;
  onBlockFieldChange: (blockId: string, key: string, value: unknown) => void;
  onSaveAsGlobal: () => void;
  onOpenThemeSettings: () => void;
  onRemoveSection: () => void;
  sourceProductHandle: string | null;
}) {
  const [tab, setTab] = useState<Tab>('content');
  // null = no explicit choice yet (auto-expand only if the active design
  // isn't in the first 2); true/false once the merchant clicks the toggle,
  // which always wins from then on — otherwise "Show less" could never
  // collapse a family whose active design happens to be past the first 2.
  const [showAllDesigns, setShowAllDesigns] = useState<boolean | null>(null);

  if (!schema) {
    return (
      <div className="p-4 text-sm text-ink-tertiary">
        This section type isn&apos;t available in the active theme.
      </div>
    );
  }

  const family = familyFor(theme, section.type);
  const activeVariantIndex = family?.variants.findIndex((v) => v.sectionType === section.type) ?? -1;
  const effectiveShowAll = showAllDesigns ?? activeVariantIndex >= 2;

  function switchDesign(newType: string) {
    if (newType === section.type) return;
    const merged = mergeSettingsForVariantSwap(theme, section.settings, newType);
    // If the new design has a product field that's still empty (never set on
    // this section before), default it to the page's own product instead of
    // asking the merchant to pick — same product the page was generated for.
    const newSchema = theme.sections[newType]?.schema;
    if (sourceProductHandle && newSchema) {
      for (const field of newSchema.fields) {
        if (field.type === 'product' && !merged[field.key]) merged[field.key] = sourceProductHandle;
      }
    }
    onSectionChange({ type: newType, settings: merged });
  }

  // The page already has one product (sourceProductHandle) that every
  // price-aware section is auto-linked to (see switchDesign above and
  // SectionList's insert path) — once that's set, showing a per-section
  // "Product" picker would just be asking the merchant to redundantly
  // confirm something already decided, so hide it entirely in that case.
  const visibleFields = sourceProductHandle ? schema.fields.filter((f) => f.type !== 'product') : schema.fields;
  const contentFields = visibleFields.filter((f) => (f.tab ?? 'content') === 'content');
  const styleFields = visibleFields.filter((f) => f.tab === 'style');
  const advancedFields = visibleFields.filter((f) => f.tab === 'advanced');
  const hasBlocks = (schema.allowedBlockTypes?.length ?? 0) > 0;
  const visibility = section.visibility ?? DEFAULT_VISIBILITY;

  // For sections whose actual copy/styling lives on child blocks (Features &
  // benefits' columns, Testimonials, How it works' steps, FAQ items, ...)
  // rather than on the section's own settings — unlike e.g. Problem/solution,
  // which has none of these and puts its fields directly on section settings
  // — surface each block's own fields right here too, grouped by block, so
  // every section's content AND style is editable from these tabs without
  // having to select each block separately in the sidebar or on the canvas.
  function blockGroupsForTab(fieldTab: Tab) {
    if (!hasBlocks) return [];
    const typeCounts: Record<string, number> = {};
    return (section.blocks ?? []).flatMap((block) => {
      const blockSchema = theme.blocks[block.type]?.schema;
      const fields = blockSchema?.fields.filter((f) => (f.tab ?? 'content') === fieldTab) ?? [];
      typeCounts[block.type] = (typeCounts[block.type] ?? 0) + (blockSchema ? 1 : 0);
      if (!blockSchema || fields.length === 0) return [];
      return [{ block, schema: blockSchema, fields, label: `${blockSchema.label} ${typeCounts[block.type]}` }];
    });
  }
  const contentBlockGroups = blockGroupsForTab('content');
  const styleBlockGroups = blockGroupsForTab('style');

  function setField(key: string, value: unknown) {
    onSettingsChange({ ...section.settings, [key]: value });
  }

  function setVisibility(patch: Partial<SectionVisibility>) {
    onSectionChange({ visibility: { ...visibility, ...patch } });
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'content', label: 'Content' },
    { id: 'style', label: 'Style' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="flex h-full flex-col">
      {family && (
        <div className="border-b border-border p-3">
          <p className="mb-2 text-xs font-medium text-ink-secondary">Design</p>
          <div className="grid grid-cols-2 gap-2">
            {(effectiveShowAll ? family.variants : family.variants.slice(0, 2)).map((variant) => {
              const active = variant.sectionType === section.type;
              return (
                <button
                  key={variant.sectionType}
                  type="button"
                  onClick={() => switchDesign(variant.sectionType)}
                  className={clsx(
                    'flex flex-col gap-1.5 rounded-md border p-1.5 text-left transition-colors',
                    active ? 'border-link bg-link-subtle' : 'border-border hover:bg-surface-hover',
                  )}
                >
                  <variant.Skeleton />
                  <span className="text-xs font-medium text-ink">{variant.label}</span>
                </button>
              );
            })}
          </div>
          {family.variants.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAllDesigns(!effectiveShowAll)}
              className="mt-2 w-full text-center text-xs font-medium text-link hover:underline"
            >
              {effectiveShowAll ? 'Show less' : `See all (${family.variants.length} designs)`}
            </button>
          )}
        </div>
      )}

      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex-1 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-link text-ink'
                : 'border-transparent text-ink-tertiary hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {tab === 'content' && (
          <>
            {contentFields.length === 0 && contentBlockGroups.length === 0 ? (
              <p className="text-sm text-ink-tertiary">
                {hasBlocks
                  ? "This section's content lives in blocks, not settings. Expand it in the Sections panel on the left (or click a block directly on the canvas) to add or edit its content."
                  : advancedFields.length > 0
                    ? 'This section is configured entirely from the Advanced tab.'
                    : 'This section has no configurable content.'}
              </p>
            ) : (
              contentFields.map((field) => (
                <FieldRow
                  key={field.key}
                  field={field}
                  value={section.settings[field.key] ?? field.default ?? ''}
                  onChange={(v) => setField(field.key, v)}
                />
              ))
            )}

            {contentBlockGroups.map(({ block, fields, label }, i) => (
              <div key={block.id} className={contentFields.length > 0 || i > 0 ? 'space-y-4 border-t border-border pt-4' : 'space-y-4'}>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">{label}</p>
                {fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={block.settings[field.key] ?? field.default ?? ''}
                    onChange={(v) => onBlockFieldChange(block.id, field.key, v)}
                  />
                ))}
              </div>
            ))}
          </>
        )}

        {tab === 'style' && (
          <>
            {styleFields.length === 0 && styleBlockGroups.length === 0 ? (
              <p className="text-sm text-ink-tertiary">No style settings for this section or its blocks.</p>
            ) : (
              styleFields.map((field) => (
                <FieldRow
                  key={field.key}
                  field={field}
                  value={section.settings[field.key] ?? field.default ?? ''}
                  onChange={(v) => setField(field.key, v)}
                />
              ))
            )}

            {styleBlockGroups.map(({ block, fields, label }, i) => (
              <div key={block.id} className={styleFields.length > 0 || i > 0 ? 'space-y-4 border-t border-border pt-4' : 'space-y-4'}>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">{label}</p>
                {fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={block.settings[field.key] ?? field.default ?? ''}
                    onChange={(v) => onBlockFieldChange(block.id, field.key, v)}
                  />
                ))}
              </div>
            ))}
          </>
        )}

        {tab === 'advanced' && (
          <>
            <div>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Visible on</span>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={visibility.desktop}
                    onChange={(e) => setVisibility({ desktop: e.target.checked })}
                    className="rounded border-border"
                  />
                  Desktop
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={visibility.tablet}
                    onChange={(e) => setVisibility({ tablet: e.target.checked })}
                    className="rounded border-border"
                  />
                  Tablet
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={visibility.mobile}
                    onChange={(e) => setVisibility({ mobile: e.target.checked })}
                    className="rounded border-border"
                  />
                  Mobile
                </label>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Schedule (optional)</span>
              <div className="space-y-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-tertiary">Show from</span>
                  <Input
                    type="datetime-local"
                    value={section.scheduleStart ? section.scheduleStart.slice(0, 16) : ''}
                    onChange={(e) => onSectionChange({ scheduleStart: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-tertiary">Show until</span>
                  <Input
                    type="datetime-local"
                    value={section.scheduleEnd ? section.scheduleEnd.slice(0, 16) : ''}
                    onChange={(e) => onSectionChange({ scheduleEnd: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                </label>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={!!section.sticky}
                onChange={(e) => onSectionChange({ sticky: e.target.checked })}
                className="rounded border-border"
              />
              Stick to top of viewport on scroll
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Scroll animation</span>
              <Select
                value={section.animation ?? 'none'}
                onChange={(e) => onSectionChange({ animation: e.target.value as SectionAnimation })}
                className="w-full"
              >
                <option value="none">None</option>
                <option value="fade-in">Fade in</option>
                <option value="fade-up">Fade up</option>
                <option value="fade-down">Fade down</option>
                <option value="fade-left">Fade left</option>
                <option value="fade-right">Fade right</option>
                <option value="zoom-in">Zoom in</option>
                <option value="slide-up">Slide up</option>
              </Select>
            </label>

            {advancedFields.length > 0 && (
              <div className="space-y-4 border-t border-border pt-4">
                {advancedFields.map((field) => (
                  <FieldRow
                    key={field.key}
                    field={field}
                    value={section.settings[field.key] ?? field.default ?? ''}
                    onChange={(v) => setField(field.key, v)}
                  />
                ))}
              </div>
            )}

            <div className={advancedFields.length > 0 ? 'border-t border-border pt-4' : undefined}>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Padding</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-tertiary">Top (px)</span>
                  <Input
                    type="number"
                    value={section.paddingTop ?? 0}
                    onChange={(e) => onSectionChange({ paddingTop: Number(e.target.value) })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-tertiary">Bottom (px)</span>
                  <Input
                    type="number"
                    value={section.paddingBottom ?? 0}
                    onChange={(e) => onSectionChange({ paddingBottom: Number(e.target.value) })}
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-ink-tertiary">Adds on top of the section&apos;s own built-in spacing.</p>
            </div>

            <div>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Divider</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-ink-tertiary">Thickness (px)</span>
                  <Input
                    type="number"
                    value={section.dividerThickness ?? 0}
                    onChange={(e) => onSectionChange({ dividerThickness: Number(e.target.value) })}
                  />
                </label>
                <ColorField
                  label="Color"
                  value={section.dividerColor ?? '#e5e5e5'}
                  onChange={(v) => onSectionChange({ dividerColor: v })}
                />
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Custom CSS class</span>
              <Input
                value={section.customClass ?? ''}
                onChange={(e) => onSectionChange({ customClass: e.target.value })}
                placeholder="e.g. my-promo-banner"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Custom CSS</span>
              <Textarea
                rows={4}
                value={section.customCss ?? ''}
                onChange={(e) => onSectionChange({ customCss: e.target.value })}
                placeholder={`background: #fafafa;\npadding-inline: 2rem;`}
                className="font-mono text-xs"
              />
              <p className="mt-1 text-xs text-ink-tertiary">Applies only to this section instance.</p>
            </label>

            <div className="border-t border-border pt-4">
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Reusable section</span>
              {section.globalId ? (
                <p className="text-xs text-ink-tertiary">
                  Linked to a global section — editing it here only affects this instance.
                </p>
              ) : (
                <Button variant="secondary" size="sm" onClick={onSaveAsGlobal}>
                  Save as reusable section
                </Button>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <Button variant="secondary" size="sm" className="w-full" onClick={onOpenThemeSettings}>
                Theme settings
              </Button>
            </div>

            {section.type !== 'header' && section.type !== 'footer' && (
              <div className="border-t border-border pt-4">
                <Button variant="danger" size="sm" className="w-full" onClick={onRemoveSection}>
                  Remove section
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
