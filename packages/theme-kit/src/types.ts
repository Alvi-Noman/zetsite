import type { ComponentType, ReactNode } from 'react';
import type { PageBlock, PageSection, SectionAnimation, SectionVisibility, ThemeGlobalSettings, ThemeId } from '@zetsite/shared';

export type FieldType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'color'
  | 'number'
  | 'select'
  | 'url'
  | 'boolean'
  | 'product'
  | 'collection'
  | 'repeater';

export type FieldTab = 'content' | 'style' | 'advanced';

export interface SettingField {
  key: string;
  type: FieldType;
  label: string;
  default?: unknown;
  options?: { label: string; value: string }[];
  /** Which settings-panel tab this field appears under. Defaults to 'content'. */
  tab?: FieldTab;
  /** Sub-field schema for each item, required when type is 'repeater'. */
  itemFields?: SettingField[];
  /** Shape of a freshly-added repeater item, required when type is 'repeater'. */
  itemDefault?: Record<string, unknown>;
}

export interface SectionSchema {
  type: string;
  label: string;
  fields: SettingField[];
  defaultSettings: Record<string, unknown>;
  /** Block types (keys into theme.blocks) this section can contain, e.g. Header -> ['logo','menu']. */
  allowedBlockTypes?: string[];
  /** Blocks a freshly-added instance of this section starts with, so it isn't empty. */
  defaultBlocks?: { type: string; settings?: Record<string, unknown> }[];
}

export interface SectionComponentProps<TSettings = Record<string, unknown>> {
  settings: TSettings;
  storeSlug: string;
  /**
   * Present only inside the builder canvas. When set, section components
   * should route their editable text fields through <Editable> using this
   * callback instead of rendering static text, enabling click-to-edit
   * directly on the canvas. Absent (undefined) in the read-only storefront.
   */
  onFieldChange?: (key: string, value: string) => void;
  /** Raw block data, present when the section schema declares allowedBlockTypes. */
  blocks?: PageBlock[];
  /** Pre-rendered blocks (resolved against the theme's block registry). Optionally filter by block type. */
  renderBlocks?: (filter?: (block: PageBlock) => boolean) => ReactNode;
  /**
   * Present only inside the builder canvas. For sections that read `blocks`
   * directly instead of calling `renderBlocks` — because they need custom
   * layout renderBlocks' one-div-per-block wrapping can't give them (a grid
   * of columns, a single-slide testimonial carousel) — this lets them still
   * wire individual block fields through <Editable> for click-to-edit,
   * scoped to a specific block by id. Absent in the read-only storefront.
   */
  onBlockFieldChange?: (blockId: string, key: string, value: string) => void;
  /** True for the first rendered section — an LCP hint for image components to load eagerly at high priority instead of the lazy default. */
  priority?: boolean;
}

export interface SectionDefinition {
  schema: SectionSchema;
  Component: ComponentType<SectionComponentProps<any>>;
}

/**
 * A "family" groups several already-registered section types that all do the
 * same job with a different visual design (e.g. two different Hero layouts).
 * Purely a UI-level grouping over existing `theme.sections` entries — it adds
 * no new data on `PageSection` itself, so switching a section's design is
 * just changing which registered `type` it points at.
 */
export interface SectionFamilyVariant {
  /** Must match a key in theme.sections. */
  sectionType: string;
  /** Short label shown under the skeleton thumbnail, e.g. "Centered". */
  label: string;
  /** Small (~120x80) wireframe preview of this variant's layout. */
  Skeleton: ComponentType;
}

export interface SectionFamily {
  id: string;
  /** Label shown for the family itself in the Add section picker, e.g. "Hero". */
  label: string;
  variants: SectionFamilyVariant[];
}

export interface ProductTemplateProps {
  storeSlug: string;
  handle: string;
}

export interface CollectionTemplateProps {
  storeSlug: string;
  handle: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  sections: Record<string, SectionDefinition>;
  /** Block types usable inside sections that declare allowedBlockTypes (e.g. Header's Logo/Menu). */
  blocks: Record<string, SectionDefinition>;
  globalSettingsSchema: SettingField[];
  defaultGlobalSettings: ThemeGlobalSettings;
  /** Optional groupings of section types that are alternate designs for the same job. */
  sectionFamilies?: SectionFamily[];
  templates: {
    Product: ComponentType<ProductTemplateProps>;
    Collection: ComponentType<CollectionTemplateProps>;
  };
}

export type { PageBlock, PageSection, SectionAnimation, SectionVisibility, ThemeGlobalSettings, ThemeId };
