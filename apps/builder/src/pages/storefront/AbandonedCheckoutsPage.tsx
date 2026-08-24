import { useEffect, useState } from 'react';
import { Phone, Trash2, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, IconButton, Badge } from '@/components/ui';

interface AbandonedCheckoutRow {
  id: string;
  productId: string | null;
  productTitle: string | null;
  productImage: string | null;
  variantLabel: string | null;
  quantity: number;
  name: string;
  phone: string;
  address: string;
  shippingLabel: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <IconButton
      aria-label="Copy phone"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </IconButton>
  );
}

export default function AbandonedCheckoutsPage() {
  const [checkouts, setCheckouts] = useState<AbandonedCheckoutRow[] | null>(null);

  function load() {
    api.get('/abandoned-checkouts').then((res) => setCheckouts(res.data.checkouts));
  }

  useEffect(load, []);

  async function dismiss(id: string) {
    setCheckouts((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
    await api.delete(`/abandoned-checkouts/${id}`);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Abandoned checkouts</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Shoppers who entered a phone number on checkout but left before placing the order — follow up to recover the sale.
        </p>
      </div>

      {checkouts === null && <p className="text-sm text-ink-secondary">Loading…</p>}

      {checkouts?.length === 0 && (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface text-center">
          <p className="text-sm font-medium text-ink">No abandoned checkouts</p>
          <p className="mt-1 max-w-sm text-sm text-ink-secondary">
            When a shopper starts checkout (enters a phone number) but leaves without ordering, they&apos;ll show up here.
          </p>
        </div>
      )}

      {checkouts && checkouts.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-ink-tertiary">
                <th className="px-4 py-3">Shopper</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Last activity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {checkouts.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{c.name || <span className="text-ink-tertiary">No name yet</span>}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <p className="text-xs text-ink-tertiary">{c.phone}</p>
                      <CopyButton value={c.phone} />
                    </div>
                    {c.address ? <p className="mt-0.5 max-w-[220px] truncate text-xs text-ink-tertiary">{c.address}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {c.productImage ? (
                        <img src={c.productImage} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
                      ) : null}
                      <span className="text-ink-secondary">
                        {c.productTitle ?? '—'}
                        {c.variantLabel ? <span className="text-ink-muted"> · {c.variantLabel}</span> : null}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{c.quantity}</td>
                  <td className="px-4 py-3 font-medium text-ink">{c.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge tone="warning">{relativeTime(c.updatedAt)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton aria-label="Call" onClick={() => window.open(`tel:${c.phone}`)}>
                        <Phone size={14} />
                      </IconButton>
                      <IconButton aria-label="Dismiss" onClick={() => dismiss(c.id)}>
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
