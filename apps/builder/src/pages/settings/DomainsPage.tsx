import { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, ExternalLink, Copy, Check, ChevronDown, CircleCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Card, Badge } from '@/components/ui';

interface DnsRecordDiff {
  type: 'A' | 'CNAME';
  name: string;
  currentValue: string | null;
  targetValue: string;
  action: 'add' | 'update';
}

interface DomainRow {
  id: string;
  domain: string;
  status: 'pending' | 'verified';
  createdAt: string;
  verifiedAt: string | null;
  records: DnsRecordDiff[];
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded p-1 text-ink-tertiary hover:bg-surface-hover hover:text-ink"
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  );
}

function RecordsTable({ title, rows }: { title: string; rows: DnsRecordDiff[] }) {
  if (rows.length === 0) return null;
  const showCurrent = title.startsWith('Update');
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-semibold text-ink">{title}</p>
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-secondary text-ink-tertiary">
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Name</th>
              {showCurrent && <th className="px-3 py-2 font-medium">Current value</th>}
              <th className="px-3 py-2 font-medium">{showCurrent ? 'Update to' : 'Value'}</th>
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-mono text-ink">{r.type}</td>
                <td className="px-3 py-2 font-mono text-ink">{r.name}</td>
                {showCurrent && (
                  <td className="px-3 py-2 font-mono text-ink-tertiary">{r.currentValue ?? '(empty)'}</td>
                )}
                <td className="px-3 py-2 font-mono font-semibold text-ink">{r.targetValue}</td>
                <td className="px-2 py-2">
                  <CopyButton value={r.targetValue} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DomainSetupPanel({ domain, onConnected }: { domain: DomainRow; onConnected: () => void }) {
  const [records, setRecords] = useState(domain.records);
  const [checking, setChecking] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);
  const [notYetMessage, setNotYetMessage] = useState('');

  const addRows = records.filter((r) => r.action === 'add');
  const updateRows = records.filter((r) => r.action === 'update');

  async function verify() {
    setChecking(true);
    setNotYetMessage('');
    try {
      const res = await api.post(`/auth/domains/${domain.id}/verify`);
      if (res.data.verified) {
        onConnected();
      } else {
        setCheckedOnce(true);
        setNotYetMessage(res.data.message ?? "DNS doesn't point here yet.");
        if (res.data.records) setRecords(res.data.records);
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-surface-secondary p-4">
      <p className="mb-3 text-sm font-medium text-ink">Configure DNS records at your registrar</p>
      <RecordsTable title="Add these new records" rows={addRows} />
      <RecordsTable title="Update these existing records" rows={updateRows} />

      {records.length === 0 ? (
        <p className="text-sm text-ink-secondary">
          These records already look correct — click below to finish connecting.
        </p>
      ) : (
        <p className="mb-3 text-xs text-ink-tertiary">
          Log in to wherever <span className="font-mono">{domain.domain}</span> is registered, open its DNS
          settings, and make the change above. DNS changes can take a few minutes to a few hours to propagate.
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={verify} disabled={checking}>
          <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Checking…' : checkedOnce ? 'Check again' : "I've updated my DNS records"}
        </Button>
        {notYetMessage ? <span className="text-xs font-medium text-warning">{notYetMessage}</span> : null}
      </div>
    </div>
  );
}

function ConnectedCelebration({ domain, onDone }: { domain: string; onDone: () => void }) {
  return (
    <div className="mt-4 flex flex-col items-center rounded-md border border-border bg-success-subtle px-6 py-8 text-center">
      <CircleCheck size={32} className="text-success" />
      <p className="mt-3 text-base font-semibold text-ink">Domain connected!</p>
      <p className="mt-1 text-sm text-ink-secondary">
        Your storefront is live at{' '}
        <a href={`https://${domain}`} target="_blank" rel="noreferrer" className="font-medium text-link hover:underline">
          {domain}
        </a>
      </p>
      <div className="mt-4 flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => window.open(`https://${domain}`, '_blank')}>
          Visit site
        </Button>
        <Button variant="secondary" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainRow[] | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [justConnected, setJustConnected] = useState<string | null>(null);

  function load() {
    api.get('/auth/domains').then((res) => setDomains(res.data.domains));
  }

  useEffect(load, []);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await api.post('/auth/domains', { domain: newDomain.trim() });
      setNewDomain('');
      setExpanded(res.data.domain.id);
      load();
    } catch (err: any) {
      setAddError(err?.response?.data?.message ?? 'Could not add domain');
    } finally {
      setAdding(false);
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
            <Input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="shop.yourbrand.com" />
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
        {domains?.map((d) => {
          const isOpen = expanded === d.id;
          const showCelebration = justConnected === d.id;
          return (
            <Card key={d.id} className="p-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : d.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  <p className="font-medium text-ink">{d.domain}</p>
                  <Badge tone={d.status === 'verified' ? 'success' : 'warning'}>
                    {d.status === 'verified' ? 'Live' : 'Needs setup'}
                  </Badge>
                  {d.status === 'pending' && (
                    <ChevronDown size={14} className={`text-ink-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  {d.status === 'verified' ? (
                    <a
                      href={`https://${d.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md p-1.5 text-ink-tertiary hover:bg-surface-hover hover:text-ink"
                      aria-label="Visit"
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                  <Button variant="danger" size="sm" onClick={() => remove(d.id)} aria-label="Remove domain">
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              {showCelebration ? (
                <ConnectedCelebration domain={d.domain} onDone={() => setJustConnected(null)} />
              ) : d.status === 'pending' && isOpen ? (
                <DomainSetupPanel
                  domain={d}
                  onConnected={() => {
                    setJustConnected(d.id);
                    load();
                  }}
                />
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
