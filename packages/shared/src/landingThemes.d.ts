import type { LandingPageThemeId, ThemeId } from './types/index.js';
export interface LandingPageThemeOption {
    id: LandingPageThemeId;
    name: string;
    blurb: string;
    colors: [string, string];
}
export declare const LANDING_PAGE_THEMES: LandingPageThemeOption[];
export declare const LANDING_PAGE_THEME_IDS: LandingPageThemeId[];
export declare const LANDING_PAGE_THEME_RENDERERS: Record<LandingPageThemeId, ThemeId>;
export declare const DEFAULT_LANDING_PAGE_THEME_ID: LandingPageThemeId;
