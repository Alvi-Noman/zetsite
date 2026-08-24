import { useEffect, useMemo, useState } from 'react';
import { Search, X, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, Badge, Select, Input, IconButton, Button } from '@/components/ui';

interface OrderRow {
  id: string;
  productId: string | null;
  productTitle: string | null;
  productImage: string | null;
  variantLabel: string | null;
  quantity: number;
  customer: { name: string; phone: string; address: string };
  shippingLabel: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  status: 'new' | 'confirmed' | 'shipped' | 'cancelled';
  createdAt: string;
}

const STATUS_OPTIONS: OrderRow['status'][] = ['new', 'confirmed', 'shipped', 'cancelled'];

const STATUS_TONE: Record<OrderRow['status'], 'accent' | 'success' | 'neutral' | 'danger'> = {
  new: 'accent',
  confirmed: 'success',
  shipped: 'neutral',
  cancelled: 'danger',
};

const STATUS_LABEL: Record<OrderRow['status'], string> = {
  new: 'New',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

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

function orderNumber(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <IconButton
      aria-label="Copy"
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

function OrderDetail({
  order,
  onClose,
  onStatusChange,
}: {
  order: OrderRow;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderRow['status']) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-ink">{orderNumber(order.id)}</h3>
            <p className="text-xs text-ink-tertiary">
              {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <IconButton aria-label="Close" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="flex-1 space-y-6 px-5 py-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Status</p>
            </div>
            <Select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderRow['status'])}
              className="w-full"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Item</p>
            <div className="flex items-center gap-3 rounded-md border border-border bg-surface-secondary p-3">
              {order.productImage ? (
                <img src={order.productImage} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded bg-surface" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{order.productTitle ?? 'Item'}</p>
                {order.variantLabel ? <p className="text-xs text-ink-tertiary">{order.variantLabel}</p> : null}
              </div>
              <p className="text-xs text-ink-secondary">Qty {order.quantity}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Delivery address</p>
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">{order.customer.name}</p>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm text-ink-secondary">{order.customer.phone}</p>
                <CopyButton value={order.customer.phone} />
              </div>
              <div className="mt-1 flex items-start justify-between gap-2">
                <p className="text-sm text-ink-secondary">{order.customer.address}</p>
                <CopyButton value={order.customer.address} />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Payment</p>
            <p className="text-sm text-ink-secondary">Cash on delivery</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Summary</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Subtotal</dt>
                <dd className="text-ink">{order.subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Shipping ({order.shippingLabel || '—'})</dt>
                <dd className="text-ink">{order.shippingCost.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
                <dt className="text-ink">Total</dt>
                <dd className="text-ink">{order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderRow['status'] | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function load() {
    api.get('/orders').then((res) => setOrders(res.data.orders));
  }

  useEffect(load, []);

  async function updateStatus(id: string, status: OrderRow['status']) {
    setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
    await api.put(`/orders/${id}/status`, { status });
  }

  const counts = useMemo(() => {
    const c: Record<OrderRow['status'] | 'all', number> = { all: orders?.length ?? 0, new: 0, confirmed: 0, shipped: 0, cancelled: 0 };
    orders?.forEach((o) => {
      c[o.status] += 1;
    });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q) ||
        orderNumber(o.id).toLowerCase().includes(q) ||
        (o.productTitle ?? '').toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  const selected = orders?.find((o) => o.id === selectedId) ?? null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink">Orders</h2>
        <p className="mt-1 text-sm text-ink-secondary">Orders placed through on-page checkout (cash on delivery).</p>
      </div>

      {orders === null && <p className="text-sm text-ink-secondary">Loading…</p>}

      {orders?.length === 0 && (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface text-center">
          <p className="text-sm font-medium text-ink">No orders yet</p>
          <p className="mt-1 max-w-sm text-sm text-ink-secondary">
            Orders submitted through a landing page&apos;s order form will show up here.
          </p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone, order #…"
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', ...STATUS_OPTIONS] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === s ? 'bg-ink text-surface' : 'bg-surface-secondary text-ink-secondary hover:bg-surface-hover'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_LABEL[s]} <span className="opacity-70">{counts[s]}</span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="flex min-h-[160px] items-center justify-center text-sm text-ink-secondary">
              No orders match your search.
            </Card>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-ink-tertiary">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover"
                      onClick={() => setSelectedId(order.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-ink-tertiary">{orderNumber(order.id)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{order.customer?.name}</p>
                        <p className="text-xs text-ink-tertiary">{order.customer?.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {order.productTitle ?? '—'}
                        {order.variantLabel ? <span className="text-ink-muted"> · {order.variantLabel}</span> : null}
                        <span className="text-ink-tertiary"> ×{order.quantity}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-ink-tertiary">{relativeTime(order.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedId(order.id); }}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {selected && <OrderDetail order={selected} onClose={() => setSelectedId(null)} onStatusChange={updateStatus} />}
    </div>
  );
}
