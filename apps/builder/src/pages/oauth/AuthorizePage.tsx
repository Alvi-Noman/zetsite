import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button, Card } from '@/components/ui';

// The OAuth consent screen zetsales redirects a merchant's browser to —
// "https://app.zetsite.com/oauth/authorize?redirect_uri=...&state=...".
// Approving mints a single-use code (integrationController.ts's `authorize`)
// that zetsales' backend then exchanges server-to-server for a real access
// token, the same shape as Shopify's own OAuth apps.
export default function AuthorizePage() {
  const [searchParams] = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri') ?? '';
  const state = searchParams.get('state') ?? '';

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'approving'>('loading');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!redirectUri) {
      setError('Missing redirect_uri.');
      setStatus('error');
      return;
    }
    api
      .get('/auth/integrations/authorize-info', { params: { redirect_uri: redirectUri } })
      .then((res) => {
        setStoreName(res.data.storeName);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err?.response?.data?.message ?? 'Could not validate this request.');
        setStatus('error');
      });
  }, [redirectUri]);

  async function approve() {
    setStatus('approving');
    try {
      const res = await api.post('/auth/integrations/authorize', { redirectUri, state });
      window.location.href = res.data.redirectUrl;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not complete the connection.');
      setStatus('error');
    }
  }

  function deny() {
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.set('error', 'access_denied');
      if (state) url.searchParams.set('state', state);
      window.location.href = url.toString();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <Card className="w-full max-w-sm p-6 text-center">
        {status === 'loading' && <p className="text-sm text-ink-secondary">Loading…</p>}

        {status === 'error' && (
          <>
            <p className="text-sm font-medium text-danger">{error}</p>
          </>
        )}

        {(status === 'ready' || status === 'approving') && (
          <>
            <h1 className="text-lg font-semibold text-ink">Connect ZetSales</h1>
            <p className="mt-2 text-sm text-ink-secondary">
              ZetSales wants to connect to <span className="font-medium text-ink">{storeName}</span>. This will let
              ZetSales view and manage your products and orders, and keep them in sync automatically.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={deny} disabled={status === 'approving'}>
                Cancel
              </Button>
              <Button variant="primary" onClick={approve} disabled={status === 'approving'}>
                {status === 'approving' ? 'Connecting…' : 'Approve'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
