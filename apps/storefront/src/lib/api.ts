import type { AudienceVariant, LandingPagePixels, LandingPageSeo, LandingPageThemeId, PageMeta, PageSection, ThemeGlobalSettings, ThemeId } from '@zetsite/shared';

export interface PublishedPage {
  page: string;
  sections: PageSection[];
  meta?: PageMeta | null;
  publishedAt: string | null;
  themeId: ThemeId;
  globalSettings: ThemeGlobalSettings | null;
  store: { id: string; name: string; slug: string };
}

export async function fetchPublishedPage(storeSlug: string, page: string): Promise<PublishedPage | null> {
  try {
    const res = await fetch(`/api/v1/storefront/${storeSlug}/page/${page}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? (data as PublishedPage) : null;
  } catch {
    return null;
  }
}

export async function fetchPreviewPage(storeSlug: string, page: string, token: string): Promise<PublishedPage | null> {
  try {
    const res = await fetch(`/api/v1/storefront/${storeSlug}/preview/${page}?token=${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? (data as PublishedPage) : null;
  } catch {
    return null;
  }
}

export interface PublishedLandingPage {
  id: string;
  slug: string;
  title: string;
  sections: PageSection[];
  publishedAt: string | null;
  themeId: LandingPageThemeId;
  globalSettings: ThemeGlobalSettings | null;
  seo: LandingPageSeo;
  pixels: LandingPagePixels;
  headCode: string;
  audienceVariants: AudienceVariant[];
  returningVisitorHeading: string;
  store: { id: string; name: string; slug: string };
}

export type LandingPageFetchResult =
  | { kind: 'ok'; page: PublishedLandingPage }
  | { kind: 'password-required' }
  | { kind: 'not-found'; unavailableRedirect: boolean };

function readVisitorId(): string {
  try {
    const key = 'zetsite_visitor_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return '';
  }
}

export async function fetchLandingPage(storeSlug: string, handle: string, password?: string): Promise<LandingPageFetchResult> {
  try {
    const params = new URLSearchParams({ visitor: readVisitorId() });
    if (password) params.set('pw', password);
    const res = await fetch(`/api/v1/storefront/${storeSlug}/landing/${handle}?${params.toString()}`);
    const data = await res.json();
    if (res.ok && data.success) return { kind: 'ok', page: data as PublishedLandingPage };
    if (res.status === 401 && data.passwordRequired) return { kind: 'password-required' };
    return { kind: 'not-found', unavailableRedirect: !!data.unavailableRedirect };
  } catch {
    return { kind: 'not-found', unavailableRedirect: false };
  }
}

export async function fetchLandingPagePreview(storeSlug: string, handle: string, token: string): Promise<PublishedLandingPage | null> {
  try {
    const res = await fetch(`/api/v1/storefront/${storeSlug}/landing-preview/${handle}?token=${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? (data as PublishedLandingPage) : null;
  } catch {
    return null;
  }
}

export function trackLandingPageEvent(storeSlug: string, landingPageId: string, type: 'view' | 'conversion') {
  const utmSource = new URLSearchParams(window.location.search).get('utm_source') ?? undefined;
  fetch(`/api/v1/storefront/${storeSlug}/landing/${landingPageId}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, utmSource }),
    keepalive: true,
  }).catch(() => {});
}
