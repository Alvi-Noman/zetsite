import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';

interface ShippingOption {
  label: string;
  cost: number;
}

interface ShippingSettings {
  options: ShippingOption[];
}

const DEFAULT_SETTINGS: ShippingSettings = {
  options: [
    { label: 'Inside Dhaka', cost: 0 },
    { label: 'Outside Dhaka', cost: 0 },
  ],
};

export default function ShippingSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    api.get('/shipping-settings').then((res) => {
      setSettings(res.data.settings ?? DEFAULT_SETTINGS);
      setLoaded(true);
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await api.put('/shipping-settings', settings);
      setSettings(res.data.settings ?? settings);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  function update(i: number, patch: Partial<ShippingOption>) {
    setSettings((s) => ({ options: s.options.map((opt, idx) => (idx === i ? { ...opt, ...patch } : opt)) }));
  }

  function add() {
    setSettings((s) => ({ options: [...s.options, { label: '', cost: 0 }] }));
  }

  function remove(i: number) {
    setSettings((s) => ({ options: s.options.filter((_, idx) => idx !== i) }));
  }

  if (!loaded) {
    return <p className="text-sm text-ink-tertiary">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-2xl font-semibold text-ink">Shipping and delivery</h2>
      <p className="mb-6 text-sm text-ink-tertiary">
        Delivery zones and rates, shared by every checkout surface — the product page, and every landing page&apos;s
        order form, on every theme. Edit it here once and it&apos;s in sync everywhere; no per-page setup needed.
      </p>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Delivery zones</h3>
        <div className="flex flex-col gap-2">
          {settings.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={opt.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Zone (e.g. Inside Dhaka)"
                />
              </div>
              <div className="w-32 shrink-0">
                <Input
                  type="number"
                  value={opt.cost}
                  onChange={(e) => update(i, { cost: Number(e.target.value) || 0 })}
                  placeholder="Delivery charge"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={settings.options.length <= 1}
                aria-label="Remove delivery zone"
                className="shrink-0 rounded-md p-2 text-ink-tertiary hover:bg-surface-hover hover:text-danger disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" onClick={add} className="mt-2">
          <Plus size={14} />
          Add delivery zone
        </Button>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {savedAt ? <span className="text-xs text-ink-tertiary">Saved {savedAt.toLocaleTimeString()}</span> : null}
      </div>
    </div>
  );
}
