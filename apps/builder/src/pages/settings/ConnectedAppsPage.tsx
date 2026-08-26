import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Card, Badge } from '@/components/ui';

interface ConnectionRow {
  id: string;
  appId: string;
  webhookUrl: string | null;
  status: 'connected' | 'revoked';
  createdAt: string;
  revokedAt: string | null;
}

const APP_LABEL: Record<string, string> = {
  zetsales: 'ZetSales',
};

export default function ConnectedAppsPage() {
  const [connections, setConnections] = useState<ConnectionRow[] | null>(null);

  function load() {
    api.get('/auth/integrations/connections').then((res) => setConnections(res.data.connections));
  }

  useEffect(load, []);

  async function disconnect(id: string) {
    setConnections((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
    await api.delete(`/auth/integrations/connections/${id}`);
  }

  const active = connections?.filter((c) => c.status === 'connected') ?? null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Connected apps</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Other apps connected to this store — data stays in sync automatically while connected.
        </p>
      </div>

      {active === null && <p className="text-sm text-ink-secondary">Loading…</p>}

      {active?.length === 0 && (
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface text-center">
          <p className="text-sm font-medium text-ink">No apps connected yet</p>
          <p className="mt-1 max-w-sm text-sm text-ink-secondary">
            Connect from ZetSales' Integrations page to sync your products and orders here.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {active?.map((c) => (
          <Card key={c.id} className="flex items-center justify-between p-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink">{APP_LABEL[c.appId] ?? c.appId}</p>
                <Badge tone="success">Connected</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-tertiary">
                Connected {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                {c.webhookUrl ? ' · Live sync active' : ' · Waiting for initial sync'}
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => disconnect(c.id)}>
              <Trash2 size={13} />
              Disconnect
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
