import { useEffect, useState } from 'react';
import type { Theme, ThemeId } from '@zetsite/theme-kit';

// Dynamic imports so Vite emits one chunk per theme package — a tenant's
// browser only ever downloads the single theme it actually uses instead of
// all 9 (previously statically imported into one THEMES map here).
const THEME_LOADERS: Record<ThemeId, () => Promise<Theme>> = {
  minimal: () => import('@zetsite/theme-minimal').then((m) => m.minimalTheme),
  bold: () => import('@zetsite/theme-bold').then((m) => m.boldTheme),
  advertorial: () => import('@zetsite/theme-advertorial').then((m) => m.advertorialTheme),
  funnel: () => import('@zetsite/theme-funnel').then((m) => m.funnelTheme),
  editorial: () => import('@zetsite/theme-editorial').then((m) => m.editorialTheme),
  'ad-funnel': () => import('@zetsite/theme-ad-funnel').then((m) => m.adFunnelTheme),
  'conversion-pro': () => import('@zetsite/theme-conversion-pro').then((m) => m.conversionProTheme),
  'product-launch': () => import('@zetsite/theme-product-launch').then((m) => m.productLaunchTheme),
  lookbook: () => import('@zetsite/theme-lookbook').then((m) => m.lookbookTheme),
};

/** Resolves and lazy-loads the theme package for `themeId`. Undefined while loading/unresolved. */
export function useThemeById(themeId: ThemeId | undefined): Theme | undefined {
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setTheme(undefined);
    THEME_LOADERS[themeId ?? 'minimal']().then((loaded) => {
      if (!cancelled) setTheme(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [themeId]);

  return theme;
}
