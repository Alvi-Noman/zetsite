import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { renderSections } from '@zetsite/theme-kit';
import { LANDING_PAGE_THEME_RENDERERS } from '@zetsite/shared/landingThemes';
import { fetchLandingPage, fetchLandingPagePreview, trackLandingPageEvent, type PublishedLandingPage } from '../lib/api';
import { useThemeById } from '../hooks/useThemeById';

function applyContentOverrides(page: PublishedLandingPage): PublishedLandingPage {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  let heroHeadingOverride: string | undefined;

  if (utmSource) {
    const match = page.audienceVariants.find((v) => v.utmSource.toLowerCase() === utmSource.toLowerCase());
    if (match?.heroHeading) heroHeadingOverride = match.heroHeading;
  }

  if (!heroHeadingOverride && page.returningVisitorHeading) {
    try {
      const key = `zetsite_visited_${page.slug}`;
      if (localStorage.getItem(key)) heroHeadingOverride = page.returningVisitorHeading;
      localStorage.setItem(key, '1');
    } catch {
      /* localStorage unavailable — skip returning-visitor detection */
    }
  }

  if (!heroHeadingOverride) return page;

  let applied = false;
  const sections = page.sections.map((s) => {
    if (applied || (s.type !== 'hero' && s.type !== 'heroSlideshow')) return s;
    const blocks = (s.blocks ?? []).map((b) => {
      if (applied || b.type !== 'heading') return b;
      applied = true;
      return { ...b, settings: { ...b.settings, text: heroHeadingOverride } };
    });
    return { ...s, blocks };
  });

  return { ...page, sections };
}

function injectHead(page: PublishedLandingPage) {
  document.title = page.seo.metaTitle || page.title;

  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    if (!content) return;
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"][data-zetsite-lp]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      tag.setAttribute('data-zetsite-lp', '1');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  setMeta('name', 'description', page.seo.metaDescription);
  setMeta('property', 'og:title', page.seo.metaTitle || page.title);
  setMeta('property', 'og:description', page.seo.metaDescription);
  if (page.seo.ogImage) setMeta('property', 'og:image', page.seo.ogImage);
  setMeta('name', 'twitter:card', page.seo.ogImage ? 'summary_large_image' : 'summary');
  setMeta('name', 'twitter:title', page.seo.metaTitle || page.title);
  setMeta('name', 'twitter:description', page.seo.metaDescription);
  if (page.seo.noindex) setMeta('name', 'robots', 'noindex, nofollow');

  if (page.seo.canonicalUrl) {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"][data-zetsite-lp]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      link.setAttribute('data-zetsite-lp', '1');
      document.head.appendChild(link);
    }
    link.href = page.seo.canonicalUrl;
  }

  const scripts: HTMLElement[] = [];
  if (page.pixels.googleAnalyticsId) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${page.pixels.googleAnalyticsId}`;
    s.setAttribute('data-zetsite-lp', '1');
    document.head.appendChild(s);
    const inline = document.createElement('script');
    inline.setAttribute('data-zetsite-lp', '1');
    inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${page.pixels.googleAnalyticsId}');`;
    document.head.appendChild(inline);
    scripts.push(s, inline);
  }
  if (page.pixels.facebookPixelId) {
    const inline = document.createElement('script');
    inline.setAttribute('data-zetsite-lp', '1');
    inline.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${page.pixels.facebookPixelId}');fbq('track','PageView');`;
    document.head.appendChild(inline);
    scripts.push(inline);
  }
  if (page.pixels.tiktokPixelId) {
    const inline = document.createElement('script');
    inline.setAttribute('data-zetsite-lp', '1');
    inline.textContent = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]={};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=n+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${page.pixels.tiktokPixelId}');ttq.page();}(window,document,'ttq');`;
    document.head.appendChild(inline);
    scripts.push(inline);
  }

  let headCodeContainer: HTMLElement | null = null;
  if (page.headCode) {
    headCodeContainer = document.createElement('div');
    headCodeContainer.setAttribute('data-zetsite-lp', '1');
    headCodeContainer.style.display = 'none';
    headCodeContainer.innerHTML = page.headCode;
    document.head.appendChild(headCodeContainer);
  }

  return () => {
    document.head.querySelectorAll('[data-zetsite-lp]').forEach((el) => el.remove());
  };
}

export function LandingPage({ storeSlug }: { storeSlug: string }) {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PublishedLandingPage | null | undefined>(undefined);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const tracked = useRef(false);
  const theme = useThemeById(page ? LANDING_PAGE_THEME_RENDERERS[page.themeId] : undefined);

  async function load(password?: string) {
    if (!handle) return;
    const params = new URLSearchParams(window.location.search);
    const previewToken = params.get('preview');

    if (previewToken) {
      const result = await fetchLandingPagePreview(storeSlug, handle, previewToken);
      setPage(result);
      return;
    }

    const result = await fetchLandingPage(storeSlug, handle, password);
    if (result.kind === 'ok') {
      setPasswordRequired(false);
      setPage(applyContentOverrides(result.page));
    } else if (result.kind === 'password-required') {
      setPasswordRequired(true);
      setPasswordError(!!password);
      setPage(null);
    } else {
      if (result.unavailableRedirect) {
        navigate('/', { replace: true });
        return;
      }
      setPage(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug, handle]);

  useEffect(() => {
    if (!page) return;
    const cleanup = injectHead(page);
    if (!tracked.current) {
      tracked.current = true;
      trackLandingPageEvent(storeSlug, page.id, 'view');
    }
    return cleanup;
  }, [page, storeSlug]);

  useEffect(() => {
    if (!page) return;
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('a,button');
      if (target) trackLandingPageEvent(storeSlug, page!.id, 'conversion');
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [page, storeSlug]);

  if (page === undefined) {
    return <div className="px-6 py-24 text-center text-neutral-400">Loading…</div>;
  }

  if (passwordRequired) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-sm text-neutral-600">This page is password-protected.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(passwordInput);
          }}
          className="flex w-full flex-col gap-2"
        >
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          {passwordError ? <p className="text-xs text-red-600">Incorrect password.</p> : null}
          <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            Continue
          </button>
        </form>
      </div>
    );
  }

  if (page === null) {
    return <div className="px-6 py-24 text-center text-neutral-400">This page isn&apos;t available.</div>;
  }

  if (!theme) {
    return <div className="px-6 py-24 text-center text-neutral-400">Loading…</div>;
  }

  return <>{renderSections(page.sections, theme, storeSlug, { ignoreSchedule: !!new URLSearchParams(window.location.search).get('preview') })}</>;
}
