// Builds a link a merchant should be sent to see their live storefront —
// either the public link a customer would actually use (real subdomain in
// production) or the working local-dev equivalent, so this never points
// somewhere nothing is listening.
//
// `path` is the storefront route (e.g. "/", "/pages/my-landing-page").
// `extraParams` are query params beyond store resolution (preview tokens,
// page name, etc) — the `store` param itself is added automatically in local
// dev and omitted in production, where the subdomain already identifies it.
export function buildStorefrontUrl(storeSlug: string, path = '/', extraParams?: Record<string, string>): string {
  if (!storeSlug) return '';
  const { hostname, protocol } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
  const params = new URLSearchParams(extraParams);

  if (isLocal) {
    // No real tenant subdomains are wired up locally, so fall back to the
    // storefront app's `?store=` dev escape hatch (see resolveSlug.ts).
    // Port 3200 is where `docker compose up` (this repo's documented local
    // stack — see CLAUDE.md) serves the storefront; running it via a bare
    // `pnpm dev` Vite server instead uses :5174, which this doesn't cover.
    params.set('store', storeSlug);
    return `${protocol}//${hostname}:3200${path}?${params.toString()}`;
  }

  // Production: the builder itself is served from zetsite.com / www.zetsite.com
  // / app.zetsite.com (see Caddyfile) — strip a leading www./app. label to
  // recover the bare root domain, then this store's real, working public URL
  // is its own subdomain under that root.
  const rootDomain = hostname.replace(/^(www|app)\./, '');
  const qs = params.toString();
  return `${protocol}//${storeSlug}.${rootDomain}${path}${qs ? `?${qs}` : ''}`;
}
