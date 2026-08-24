// Resolves the tenant store slug for the current request, in priority order:
// 1. `?store=slug` query param / `VITE_DEV_STORE_SLUG` env var — dev escape hatch,
//    useful when real wildcard subdomains aren't wired up locally.
// 2. `<slug>.<rootDomain>` hostname (prod: zetsite.com, dev: *.localhost).
export function resolveStoreSlug(): string | null {
  const params = new URLSearchParams(window.location.search);
  const queryStore = params.get('store');
  if (queryStore) return queryStore;

  const devStore = import.meta.env.VITE_DEV_STORE_SLUG as string | undefined;
  if (devStore) return devStore;

  const hostname = window.location.hostname;
  const rootDomain = (import.meta.env.VITE_SITE_ROOT_DOMAIN as string | undefined) || 'zetsite.com';

  if (hostname.endsWith(`.${rootDomain}`)) {
    const slug = hostname.slice(0, -(rootDomain.length + 1));
    return slug || null;
  }

  if (hostname.endsWith('.localhost')) {
    return hostname.slice(0, -'.localhost'.length) || null;
  }

  return null;
}
