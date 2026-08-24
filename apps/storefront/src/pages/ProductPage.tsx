import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStorefrontThemeId, type ThemeId } from '@zetsite/theme-kit';
import { useThemeById } from '../hooks/useThemeById';

export function ProductPage({ storeSlug }: { storeSlug: string }) {
  const { handle } = useParams<{ handle: string }>();
  const [themeId, setThemeId] = useState<ThemeId>();
  const theme = useThemeById(themeId);

  useEffect(() => {
    fetchStorefrontThemeId(storeSlug).then((id) => setThemeId(id as ThemeId));
  }, [storeSlug]);

  if (!handle) return null;
  if (!theme) {
    return <div className="px-6 py-24 text-center text-neutral-400">Loading…</div>;
  }
  const Template = theme.templates.Product;
  return <Template storeSlug={storeSlug} handle={handle} />;
}
