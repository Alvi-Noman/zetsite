import type { ReactElement } from 'react';
import type { PageBlock, PageSection, SectionDefinition, SectionFamily, SectionSchema, SectionVisibility, Theme } from './types.js';
import { ScrollReveal } from './ScrollReveal.js';

export function createSectionRegistry(defs: SectionDefinition[]): Record<string, SectionDefinition> {
  const registry: Record<string, SectionDefinition> = {};
  for (const def of defs) {
    registry[def.schema.type] = def;
  }
  return registry;
}

export function getSection(theme: Theme, type: string): SectionDefinition | undefined {
  return theme.sections[type];
}

/** Which family (if any) a given section type belongs to, for showing/switching designs. */
export function familyFor(theme: Theme, sectionType: string): SectionFamily | undefined {
  return theme.sectionFamilies?.find((f) => f.variants.some((v) => v.sectionType === sectionType));
}

/**
 * Settings to use when swapping a section from one design (type) to another
 * within the same family. Keeps every value the section already had — even
 * ones the new design doesn't currently show — and only fills in defaults
 * for keys the new design needs that aren't already set. This is
 * deliberately non-destructive: a field a design doesn't display (e.g. the
 * linked product on a design with no price shown, or an image on a
 * text-only design) is never lost, so switching back to a design that does
 * use it recovers the original value instead of showing it empty again.
 */
export function mergeSettingsForVariantSwap(
  theme: Theme,
  oldSettings: Record<string, unknown>,
  newType: string,
): Record<string, unknown> {
  const newDef = getSection(theme, newType);
  if (!newDef) return oldSettings;
  return { ...newDef.schema.defaultSettings, ...oldSettings };
}

export function getBlock(theme: Theme, type: string): SectionDefinition | undefined {
  return theme.blocks[type];
}

// Instantiates a section schema's `defaultBlocks` into real PageBlocks with
// generated ids, so a freshly-added section isn't empty. Used wherever a new
// section instance is created (Navigator "Add section", starter templates).
export function createDefaultBlocks(schema: SectionSchema, theme: Theme): PageBlock[] {
  return (schema.defaultBlocks ?? [])
    .map(({ type, settings }) => {
      const def = getBlock(theme, type);
      if (!def) return null;
      const block: PageBlock = {
        id: crypto.randomUUID() as string,
        type,
        settings: { ...def.schema.defaultSettings, ...settings },
      };
      return block;
    })
    .filter((b): b is PageBlock => b !== null);
}

export function renderBlocksFor(
  blocks: PageBlock[] | undefined,
  theme: Theme,
  storeSlug: string,
  filter?: (block: PageBlock) => boolean,
  onBlockFieldChange?: (blockId: string, key: string, value: string) => void,
): ReactElement[] {
  return (blocks ?? [])
    .filter((block) => !filter || filter(block))
    .map((block) => {
      const def = getBlock(theme, block.type);
      if (!def) return <></>;
      const settings = { ...def.schema.defaultSettings, ...block.settings };
      return (
        <def.Component
          key={block.id}
          settings={settings}
          storeSlug={storeSlug}
          onFieldChange={onBlockFieldChange ? (key, value) => onBlockFieldChange(block.id, key, value) : undefined}
        />
      );
    });
}

export function FallbackSection({ type }: { type: string }): ReactElement {
  return (
    <div className="p-6 border border-dashed border-neutral-300 text-neutral-400 text-sm text-center">
      Section type &quot;{type}&quot; is not supported by this theme
    </div>
  );
}

const DEFAULT_VISIBILITY: SectionVisibility = { desktop: true, tablet: true, mobile: true };

// Tailwind responsive utility classes that hide a section per breakpoint.
// Mobile-first: base class targets <768px, md: targets >=768px (tablet),
// lg: targets >=1024px (desktop) — matches the device switcher's breakpoints.
export function getVisibilityClassName(visibility?: SectionVisibility): string {
  const v = visibility ?? DEFAULT_VISIBILITY;
  const classes: string[] = [];
  classes.push(v.mobile ? 'block' : 'hidden');
  classes.push(v.tablet ? 'md:block' : 'md:hidden');
  classes.push(v.desktop ? 'lg:block' : 'lg:hidden');
  return classes.join(' ');
}

export function isWithinSchedule(section: PageSection, now: Date = new Date()): boolean {
  if (section.scheduleStart && now < new Date(section.scheduleStart)) return false;
  if (section.scheduleEnd && now > new Date(section.scheduleEnd)) return false;
  return true;
}

// Universal, wrapper-level style controls that apply to every section
// regardless of type — extra padding, a bottom divider, and sticky
// positioning. Deliberately additive on top of each section's own built-in
// spacing rather than replacing it, so it's safe without touching every
// section's internal markup.
export function getSectionWrapperStyle(section: PageSection): Record<string, string | number> {
  const style: Record<string, string | number> = {};
  if (section.sticky) {
    style.position = 'sticky';
    style.top = 0;
    style.zIndex = 30;
  }
  if (section.paddingTop) style.paddingTop = section.paddingTop;
  if (section.paddingBottom) style.paddingBottom = section.paddingBottom;
  if (section.dividerThickness) {
    style.borderBottomWidth = section.dividerThickness;
    style.borderBottomStyle = 'solid';
    style.borderBottomColor = section.dividerColor || '#e5e5e5';
  }
  return style;
}

export function sectionCssScopeClass(section: PageSection): string {
  return `zt-s-${section.id}`;
}

export function SectionCustomCss({ section }: { section: PageSection }): ReactElement | null {
  if (!section.customCss?.trim()) return null;
  return <style>{`.${sectionCssScopeClass(section)} { ${section.customCss} }`}</style>;
}

// Shared by apps/storefront (published sections) and apps/builder's preview
// pane (draft sections) so both render from one implementation.
export function renderSections(
  sections: PageSection[],
  theme: Theme,
  storeSlug: string,
  options?: { showFallback?: boolean; ignoreSchedule?: boolean },
): ReactElement[] {
  return sections
    .filter((section) => options?.ignoreSchedule || isWithinSchedule(section))
    .map((section, index) => {
      const def = getSection(theme, section.type);
      const wrapperClassName = [
        getVisibilityClassName(section.visibility),
        sectionCssScopeClass(section),
        section.customClass,
      ]
        .filter(Boolean)
        .join(' ');
      const wrapperStyle = getSectionWrapperStyle(section);

      return (
        <ScrollReveal key={section.id} animation={section.animation}>
          <SectionCustomCss section={section} />
          <div className={wrapperClassName} style={wrapperStyle}>
            {def ? (
              <def.Component
                settings={{ ...def.schema.defaultSettings, ...section.settings }}
                storeSlug={storeSlug}
                blocks={section.blocks}
                renderBlocks={(filter) => <>{renderBlocksFor(section.blocks, theme, storeSlug, filter)}</>}
                priority={index === 0}
              />
            ) : options?.showFallback === false ? null : (
              <FallbackSection type={section.type} />
            )}
          </div>
        </ScrollReveal>
      );
    });
}
