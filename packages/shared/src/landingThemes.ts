import type { LandingPageThemeId, ThemeId } from './types/index.js';

export interface LandingPageThemeOption {
  id: LandingPageThemeId;
  name: string;
  blurb: string;
  colors: [string, string];
}

export const LANDING_PAGE_THEMES: LandingPageThemeOption[] = [
  {
    id: 'lookbook',
    name: 'Lookbook',
    blurb: 'Premium visual merchandising for watches, sunglasses, and apparel — gallery, swatches, and size guide',
    colors: ['#1C1917', '#B08D57'],
  },
  {
    id: 'product-launch',
    name: 'Problem Solver',
    blurb: 'For products that solve a problem — problem/solution, features & benefits, how it works, and testimonials',
    colors: ['#1C1917', '#B08D57'],
  },
];

export const LANDING_PAGE_THEME_IDS: LandingPageThemeId[] = LANDING_PAGE_THEMES.map((t) => t.id);

/**
 * The only place the two id-spaces touch: translates a landing-page theme
 * choice to the underlying theme-kit render package used to actually
 * render its sections. Never expose the right-hand side (ThemeId) in
 * landing-page-facing UI or API responses — it's an implementation detail.
 */
export const LANDING_PAGE_THEME_RENDERERS: Record<LandingPageThemeId, ThemeId> = {
  lookbook: 'lookbook',
  'product-launch': 'product-launch',
};

export const DEFAULT_LANDING_PAGE_THEME_ID: LandingPageThemeId = 'lookbook';
