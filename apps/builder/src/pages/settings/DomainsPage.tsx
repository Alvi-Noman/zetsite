import { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Card, Badge } from '@/components/ui';

interface DomainRow {
  id: string;
  domain: string;
  status: 'pending' | 'verified';
  createdAt: string;
  verifiedAt: string | null;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainRow[] | null>(null);
  const [cnameTarget, setCnameTarget] = useState('');
  const [aRecordIps, setARecordIps] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<Record<string, string>>({});

  function load() {
    api.get('/auth/domains').then((res) => {
      setDomains(res.data.domains);
      setCnameTarget(res.data.cnameTarget ?? '');
      setARecordIps(res.data.aRecordIps ?? []);
    });
  }

  useEffect(load, []);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      await api.post('/auth/domains', { domain: newDomain.trim() });
      setNewDomain('');
      load();
    } catch (err: any) {
      setAddError(err?.response?.data?.message ?? 'Could not add domain');
    } finally {
      setAdding(false);
    }
  }

  async function verify(id: string) {
    setVerifying(id);
    try {
      const res = await api.post(`/auth/domains/${id}/verify`);
      if (res.data.verified) {
        setVerifyMessage((m) => ({ ...m, [id]: '' }));
        load();
      } else {
        setVerifyMessage((m) => ({ ...m, [id]: res.data.message ?? "DNS doesn't point here yet." }));
      }
    } finally {
      setVerifying(null);
    }
  }

  async function remove(id: string) {
    setDomains((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
    await api.delete(`/auth/domains/${id}`);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Domains</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Connect your own domain (e.g. shop.yourbrand.com) so customers see it instead of your zetsite.com address.
        </p>
      </div>

      <Card className="mb-6 p-5">
        <h3 className="mb-3 text-sm font-semibold text-ink">Connect a domain</h3>
        <form onSubmit={addDomain} className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="shop.yourbrand.com"
            />
            {addError ? <p className="mt-1.5 text-xs font-medium text-danger">{addError}</p> : null}
          </div>
          <Button type="submit" variant="primary" disabled={adding}>
            <Plus size={15} />
            {adding ? 'Adding…' : 'Add domain'}
          </Button>
        </form>
      </Card>

      {domains === null && <p className="text-sm text-ink-secondary">Loading…</p>}

      {domains?.length === 0 && (
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface text-center">
          <p className="text-sm font-medium text-ink">No domains connected yet</p>
          <p className="mt-1 max-w-sm text-sm text-ink-secondary">
            Your store is reachable at its zetsite.com address until you connect one.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {domains?.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink">{d.domain}</p>
                <Badge tone={d.status === 'verified' ? 'success' : 'warning'}>
                  {d.status === 'verified' ? 'Connected' : 'Pending verification'}
                </Badge>
                {d.status === 'verified' ? (
                  <a
                    href={`https://${d.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink-tertiary hover:text-ink"
                    aria-label="Visit"
                  >
                    <ExternalLink size={13} />
                  </a>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {d.status === 'pending' && (
                  <Button variant="secondary" size="sm" onClick={() => verify(d.id)} disabled={verifying === d.id}>
                    <RefreshCw size={13} className={verifying === d.id ? 'animate-spin' : ''} />
                    {verifying === d.id ? 'Checking…' : 'Verify connection'}
                  </Button>
                )}
                <Button variant="danger" size="sm" onClick={() => remove(d.id)} aria-label="Remove domain">
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>

            {d.status === 'pending' && (
              <div className="mt-4 rounded-md border border-border bg-surface-secondary p-4 text-sm">
                <p className="font-medium text-ink">Add this DNS record at your domain registrar</p>
                <p className="mt-1 text-ink-secondary">
                  {isApexDomain(d.domain) ? (
                    <>
                      Since <span className="font-mono">{d.domain}</span> is a root domain, add an{' '}
                      <span className="font-mono font-semibold">A</span> record pointing to it:
                    </>
                  ) : (
                    <>
                      Add a <span className="font-mono font-semibold">CNAME</span> record:
                    </>
                  )}
                </p>

                {!isApexDomain(d.domain) && cnameTarget ? (
                  <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-md bg-surface px-3 py-2 font-mono text-xs">
                    <span className="text-ink-tertiary">Type</span>
                    <span className="text-ink">CNAME</span>
                    <span className="text-ink-tertiary">Name</span>
                    <span className="text-ink">{d.domain.split('.')[0]}</span>
                    <span className="text-ink-tertiary">Value</span>
                    <span className="text-ink">{cnameTarget}</span>
                  </div>
                ) : null}

                {isApexDomain(d.domain) && aRecordIps.length > 0 ? (
                  <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-md bg-surface px-3 py-2 font-mono text-xs">
                    <span className="text-ink-tertiary">Type</span>
                    <span className="text-ink">A</span>
                    <span className="text-ink-tertiary">Name</span>
                    <span className="text-ink">@</span>
                    <span className="text-ink-tertiary">Value</span>
                    <span className="text-ink">
                      {aRecordIps.map((ip, i) => (
                        <span key={ip}>
                          {ip}
                          {i < aRecordIps.length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </span>
                  </div>
                ) : null}

                {isApexDomain(d.domain) && aRecordIps.length === 0 ? (
                  <p className="mt-2 rounded-md bg-surface px-3 py-2 text-xs text-warning">
                    Couldn&apos;t look up the platform&apos;s current IP address right now — try reloading this page.
                    {cnameTarget ? (
                      <>
                        {' '}
                        In the meantime you can point the A record at whatever IP{' '}
                        <span className="font-mono">{cnameTarget}</span> resolves to.
                      </>
                    ) : null}
                  </p>
                ) : null}

                <p className="mt-2 text-xs text-ink-tertiary">
                  DNS changes can take a few minutes to a few hours to propagate. Click &quot;Verify connection&quot; once
                  you&apos;ve added the record.
                </p>
                {verifyMessage[d.id] ? (
                  <p className="mt-2 text-xs font-medium text-warning">{verifyMessage[d.id]}</p>
                ) : null}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function isApexDomain(domain: string): boolean {
  // A root/apex domain has exactly one label before the TLD (example.com),
  // vs. a subdomain like shop.example.com — apex domains can't use a CNAME
  // per DNS spec, so they need an A record instead.
  return domain.split('.').length === 2;
}
