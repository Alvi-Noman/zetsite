import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Sparkles } from 'lucide-react';
import type { ThemeId } from '@zetsite/shared';
import { api } from '@/lib/api';
import { buildStorefrontUrl } from '@/lib/storefrontLink';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Badge } from '@/components/ui';

const THEME_LIBRARY: { id: ThemeId; name: string; blurb: string }[] = [
  { id: 'minimal', name: 'Minimal', blurb: 'Clean, neutral, product-first — built for fashion and lifestyle brands.' },
  { id: 'bold', name: 'Bold', blurb: 'High-contrast, editorial, statement typography — built to stand out.' },
  {
    id: 'advertorial',
    name: 'Advertorial',
    blurb: 'High-urgency, single-product pages built to convert — countdown pricing, trust badges, on-page checkout.',
  },
  {
    id: 'funnel',
    name: 'Funnel',
    blurb: 'Bold gradient CTAs, pastel feature cards, and an on-page COD order form — built for single-product ad funnels.',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    blurb: 'Calm, premium, serif-led storytelling for a single hero product — quieter than a funnel, still built to sell.',
  },
  {
    id: 'ad-funnel',
    name: 'Ad Funnel',
    blurb: 'An exact single-product ad funnel clone — pastel feature cards, checklist, and an on-page COD order form.',
  },
  {
    id: 'conversion-pro',
    name: 'Conversion Pro',
    blurb: 'Built from CRO best practices — rating badge next to the CTA, trust badges, guarantee, and a sticky buy bar.',
  },
];

function formatSavedAt(iso: string | null): string {
  if (!iso) return 'Not saved yet';
  const date = new Date(iso);
  return `Last saved ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

export default function ThemesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storeSlug = user?.store?.slug ?? '';

  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('minimal');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [switching, setSwitching] = useState<ThemeId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/themes/active'), api.get('/pages/home/draft')]).then(([themeRes, pageRes]) => {
      setActiveThemeId(themeRes.data.activeThemeId);
      setSavedAt(pageRes.data.updatedAt ?? null);
      setLoaded(true);
    });
  }, []);

  async function activateTheme(id: ThemeId) {
    if (id === activeThemeId) return;
    setSwitching(id);
    try {
      await api.put('/themes/active', { themeId: id });
      setActiveThemeId(id);
    } finally {
      setSwitching(null);
    }
  }

  const previewUrl = storeSlug ? buildStorefrontUrl(storeSlug) : '';
  const activeTheme = THEME_LIBRARY.find((t) => t.id === activeThemeId);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-ink">Themes</h2>

      <Card className="overflow-hidden p-0">
        <div className="flex gap-0 overflow-hidden bg-surface-secondary p-6">
          <div className="mx-auto flex w-full max-w-2xl items-end justify-center gap-4">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-md border border-border bg-white shadow-sm">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="Desktop preview"
                  className="h-[250%] w-[250%] origin-top-left border-0"
                  style={{ transform: 'scale(0.4)' }}
                />
              ) : null}
            </div>
            <div className="aspect-[9/16] w-28 shrink-0 overflow-hidden rounded-md border border-border bg-white shadow-sm">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="Mobile preview"
                  className="h-[400%] w-[400%] origin-top-left border-0"
                  style={{ transform: 'scale(0.25)' }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">{activeTheme?.name ?? 'Theme'}</span>
              <Badge tone="success">Active</Badge>
            </div>
            <p className="mt-1 text-xs text-ink-tertiary">{loaded ? formatSavedAt(savedAt) : 'Loading…'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="secondary" size="sm" onClick={() => setMenuOpen((v) => !v)} aria-label="More theme actions">
                <MoreHorizontal size={16} />
              </Button>
              {menuOpen ? (
                <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-md border border-border bg-surface py-1 shadow-lg">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-3 py-1.5 text-sm text-ink-secondary hover:bg-surface-hover hover:text-ink"
                  >
                    View store
                  </a>
                </div>
              ) : null}
            </div>
            <Button variant="primary" onClick={() => navigate('/storefront/editor')}>
              Edit theme
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">Discover themes</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            Visit Theme Store
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Import
          </Button>
        </div>
      </div>

      <Card className="mt-4 flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-link-subtle text-link">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">Design your store in seconds</p>
          <p className="text-xs text-ink-tertiary">Describe your business to create unique themes with personalized content</p>
        </div>
        <input
          type="text"
          disabled
          placeholder="e.g. modern handmade jewelry"
          className="w-64 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-ink-tertiary"
        />
        <Button variant="secondary" size="sm" disabled>
          Generate themes
        </Button>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {THEME_LIBRARY.map((t) => (
          <Card key={t.id} className="overflow-hidden">
            <div className="flex aspect-[4/3] items-center justify-center bg-surface-secondary p-4 text-center text-sm text-ink-tertiary">
              {t.blurb}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{t.name}</p>
                <p className="text-xs text-ink-tertiary">by ZetSite</p>
              </div>
              <Button
                variant={t.id === activeThemeId ? 'secondary' : 'primary'}
                size="sm"
                disabled={t.id === activeThemeId || switching === t.id}
                onClick={() => activateTheme(t.id)}
              >
                {t.id === activeThemeId ? 'Active' : switching === t.id ? 'Switching…' : 'Activate'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
