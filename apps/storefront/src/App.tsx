import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { fetchStoreSlugByHost } from '@zetsite/theme-kit';
import { resolveStoreSlug } from './lib/resolveSlug';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CollectionPage } from './pages/CollectionPage';
import { LandingPage } from './pages/LandingPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { PopupRenderer } from './components/PopupRenderer';

type Resolution = { status: 'ready'; slug: string } | { status: 'resolving' } | { status: 'notfound' };

// The store slug is readable straight off the hostname for a *.rootDomain
// tenant subdomain (resolveStoreSlug, synchronous). A merchant's own
// connected custom domain (e.g. shop.example.com) doesn't contain the slug
// anywhere, so that case falls back to asking the API which store owns this
// hostname — see storefrontRoutes.ts's /resolve-domain.
function useResolvedStoreSlug(): Resolution {
  const [state, setState] = useState<Resolution>(() => {
    const sync = resolveStoreSlug();
    return sync ? { status: 'ready', slug: sync } : { status: 'resolving' };
  });

  useEffect(() => {
    if (state.status !== 'resolving') return;
    let cancelled = false;
    fetchStoreSlugByHost(window.location.hostname).then((slug) => {
      if (cancelled) return;
      setState(slug ? { status: 'ready', slug } : { status: 'notfound' });
    });
    return () => {
      cancelled = true;
    };
  }, [state.status]);

  return state;
}

export default function App() {
  const resolution = useResolvedStoreSlug();

  if (resolution.status === 'resolving') {
    return <div className="min-h-screen flex items-center justify-center text-neutral-400">Loading…</div>;
  }

  if (resolution.status === 'notfound') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6 text-neutral-500">
        <p>
          No store found for this address.
          <br />
          Visit a tenant subdomain (e.g. <code>acme.zetsite.com</code>) to view a storefront.
        </p>
      </div>
    );
  }

  const storeSlug = resolution.slug;

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage storeSlug={storeSlug} />} />
        <Route path="/products/:handle" element={<ProductPage storeSlug={storeSlug} />} />
        <Route path="/collections/:handle" element={<CollectionPage storeSlug={storeSlug} />} />
        <Route path="/pages/:handle" element={<LandingPage storeSlug={storeSlug} />} />
        <Route path="/order-confirmed/:orderId" element={<OrderConfirmationPage storeSlug={storeSlug} />} />
      </Routes>
      <PopupRenderer storeSlug={storeSlug} />
    </>
  );
}
