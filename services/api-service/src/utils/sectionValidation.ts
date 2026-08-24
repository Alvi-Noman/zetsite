import crypto from 'crypto';
import type { PageBlock, PageMeta, PageSection, SectionAnimation, SectionVisibility } from '@zetsite/shared';

export const ANIMATIONS = new Set<SectionAnimation>([
  'none',
  'fade-in',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom-in',
  'slide-up',
]);
export const MAX_REVISIONS = 20;

export function serializeSections(sections: PageSection[] | null | undefined) {
  return Array.isArray(sections) ? sections : [];
}

export function buildVisibility(input: any): SectionVisibility | undefined {
  if (!input || typeof input !== 'object') return undefined;
  return {
    desktop: input.desktop !== false,
    tablet: input.tablet !== false,
    mobile: input.mobile !== false,
  };
}

export function buildBlocksField(input: any): PageBlock[] | undefined {
  if (!Array.isArray(input)) return undefined;
  return input
    .filter((b) => b && typeof b === 'object' && typeof b.type === 'string' && b.type.trim())
    .map((b) => ({
      id: typeof b.id === 'string' && b.id ? b.id : crypto.randomUUID(),
      type: b.type,
      settings: b.settings && typeof b.settings === 'object' ? b.settings : {},
    }));
}

export function buildSectionsField(body: any): PageSection[] {
  const { sections } = body;
  if (!Array.isArray(sections)) {
    throw new Error('sections must be an array');
  }

  return sections.map((s, index) => {
    if (!s || typeof s !== 'object' || typeof s.type !== 'string' || !s.type.trim()) {
      throw new Error(`Section at index ${index} is missing a valid "type"`);
    }
    const section: PageSection = {
      id: typeof s.id === 'string' && s.id ? s.id : crypto.randomUUID(),
      type: s.type,
      settings: s.settings && typeof s.settings === 'object' ? s.settings : {},
    };
    const visibility = buildVisibility(s.visibility);
    if (visibility) section.visibility = visibility;
    if (typeof s.customClass === 'string' && s.customClass.trim()) {
      section.customClass = s.customClass.trim();
    }
    if (typeof s.sticky === 'boolean') section.sticky = s.sticky;
    if (typeof s.animation === 'string' && ANIMATIONS.has(s.animation as SectionAnimation)) {
      section.animation = s.animation;
    }
    if (typeof s.scheduleStart === 'string' || s.scheduleStart === null) section.scheduleStart = s.scheduleStart;
    if (typeof s.scheduleEnd === 'string' || s.scheduleEnd === null) section.scheduleEnd = s.scheduleEnd;
    if (typeof s.globalId === 'string' && s.globalId) section.globalId = s.globalId;
    if (typeof s.paddingTop === 'number') section.paddingTop = s.paddingTop;
    if (typeof s.paddingBottom === 'number') section.paddingBottom = s.paddingBottom;
    if (typeof s.dividerThickness === 'number') section.dividerThickness = s.dividerThickness;
    if (typeof s.dividerColor === 'string' && s.dividerColor.trim()) section.dividerColor = s.dividerColor;
    if (typeof s.customCss === 'string') section.customCss = s.customCss.slice(0, 5000);
    const blocks = buildBlocksField(s.blocks);
    if (blocks) section.blocks = blocks;
    return section;
  });
}

export function buildMeta(input: any): PageMeta | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const meta: PageMeta = {};
  if (['delay', 'scroll', 'exit_intent'].includes(input.triggerType)) meta.triggerType = input.triggerType;
  if (typeof input.triggerValue === 'number') meta.triggerValue = input.triggerValue;
  return meta;
}
