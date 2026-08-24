export type ThemeId = 'minimal' | 'bold' | 'advertorial' | 'funnel' | 'editorial' | 'ad-funnel' | 'conversion-pro' | 'product-launch' | 'lookbook';

/**
 * Landing pages pick their own theme independently of the storefront's
 * ThemeId — a separate id-space that happens to render through the same
 * theme-kit component packages under the hood (see
 * `@zetsite/shared/landingThemes` for the translation table). Never use
 * ThemeId for landing-page data; keeping the two distinct is deliberate.
 */
export type LandingPageThemeId = 'product-launch' | 'lookbook';

export interface SectionVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export type SectionAnimation =
  | 'none'
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'slide-up';

export interface PageBlock {
  id: string;
  type: string;
  settings: Record<string, unknown>;
}

export interface PageSection {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  visibility?: SectionVisibility;
  customClass?: string;
  sticky?: boolean;
  animation?: SectionAnimation;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  /** When set, this section's settings mirror a shared `global_sections` doc. */
  globalId?: string;
  /** Child blocks — one level deep (e.g. Header's Logo/Menu, Footer's Copyright/Links). */
  blocks?: PageBlock[];
  /** Extra vertical spacing (px) added on top of the section's own built-in padding. */
  paddingTop?: number;
  paddingBottom?: number;
  /** Bottom border, e.g. to separate sections visually without a full divider block. */
  dividerThickness?: number;
  dividerColor?: string;
  /** Raw CSS scoped to this section instance only. */
  customCss?: string;
}

export interface PageRevision {
  sections: PageSection[];
  publishedAt: string;
  publishedBy: string | null;
  label?: string;
}

export interface PageMeta {
  triggerType?: 'delay' | 'scroll' | 'exit_intent';
  triggerValue?: number;
}

export interface PageDocument {
  page: string;
  sections: PageSection[];
  meta?: PageMeta;
  updatedAt?: string;
}

export interface ThemeGlobalSettings {
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface PublishedPageResponse {
  page: string;
  sections: PageSection[];
  meta?: PageMeta;
  themeId: ThemeId;
  globalSettings: ThemeGlobalSettings;
  publishedAt: string | null;
}

export interface StoreSummary {
  id: string;
  name: string;
  slug: string;
}

export interface GlobalSection {
  id: string;
  type: string;
  label: string;
  settings: Record<string, unknown>;
}

export type LandingPageStatus = 'draft' | 'published' | 'archived';

export type LandingPageGenerationStatus = 'idle' | 'generating' | 'native' | 'ai-enhanced' | 'ai-partial' | 'ai-structural';

export type GenerationStyle = 'direct-response' | 'storytelling' | 'minimal';

export interface LandingPageGenerationMeta {
  status: LandingPageGenerationStatus;
  model?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  style?: GenerationStyle;
  /** Section types skipped for lack of enough product images (e.g. "gallery"). */
  omittedSections: string[];
  /** How this page's sections were originally generated. */
  source?: 'product' | 'description';
}

export interface LandingPageSeo {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noindex: boolean;
}

export interface LandingPageAnalyticsSummary {
  views: number;
  conversions: number;
  conversionRate: number;
  daily: { date: string; views: number; conversions: number }[];
}

export interface LandingPagePixels {
  googleAnalyticsId: string;
  facebookPixelId: string;
  tiktokPixelId: string;
}

export interface AudienceVariant {
  utmSource: string;
  heroHeading: string;
}

export interface LandingPageAbTest {
  variantOfId: string | null;
  isVariant: boolean;
  trafficWeight: number;
}

export interface LandingPageSchedule {
  publishAt: string | null;
  unpublishAt: string | null;
}

export interface LandingPageSummary {
  id: string;
  slug: string;
  title: string;
  status: LandingPageStatus;
  themeId: LandingPageThemeId;
  sourceProductId: string | null;
  generation: LandingPageGenerationMeta | null;
  updatedAt: string;
  pinned: boolean;
  tags: string[];
  passwordProtected: boolean;
  schedule: LandingPageSchedule;
  abTest: LandingPageAbTest;
  analytics: { views: number; conversions: number };
  sectionCount: number;
  imageCount: number;
}

export interface LandingPageDocument {
  id: string;
  slug: string;
  title: string;
  status: LandingPageStatus;
  themeId: LandingPageThemeId;
  sourceProductId: string | null;
  sections: PageSection[];
  generation: LandingPageGenerationMeta | null;
  updatedAt?: string;
  seo: LandingPageSeo;
  pixels: LandingPagePixels;
  headCode: string;
  pinned: boolean;
  tags: string[];
  passwordProtected: boolean;
  schedule: LandingPageSchedule;
  abTest: LandingPageAbTest;
  audienceVariants: AudienceVariant[];
  returningVisitorHeading: string;
  unavailableRedirect: boolean;
  productOutOfStock: boolean;
}
