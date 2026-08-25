import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Input, Textarea, Card } from '@/components/ui';

interface CheckoutSettings {
  currency: string;
  codLabel: string;
  submitButtonText: string;
  successMessage: string;
}

const DEFAULT_SETTINGS: CheckoutSettings = {
  currency: '৳',
  codLabel: 'Cash on delivery',
  submitButtonText: 'Place order',
  successMessage: "Order received — we'll be in touch to confirm.",
};

export default function CheckoutSettingsPage() {
  const [settings, setSettings] = useState<CheckoutSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    api.get('/checkout-settings').then((res) => {
      setSettings(res.data.settings ?? DEFAULT_SETTINGS);
      setLoaded(true);
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await api.put('/checkout-settings', settings);
      setSettings(res.data.settings ?? settings);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <p className="text-sm text-ink-tertiary">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 text-2xl font-semibold text-ink">Checkout</h2>
      <p className="mb-6 text-sm text-ink-tertiary">
        One central order form, shared by every landing page across every layout. Edit it here once — every "Buy
        now" button on every landing page scrolls down to this same form and uses these settings, instead of an
        add-to-cart flow. Delivery zones and rates are configured separately under{' '}
        <a href="/settings/shipping" className="text-link hover:underline">
          Shipping and delivery
        </a>
        .
      </p>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Pricing</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Currency symbol</label>
          <div className="w-24">
            <Input value={settings.currency} onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))} />
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Form & messaging</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Cash-on-delivery label</label>
            <Input value={settings.codLabel} onChange={(e) => setSettings((s) => ({ ...s, codLabel: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Submit button text</label>
            <Input
              value={settings.submitButtonText}
              onChange={(e) => setSettings((s) => ({ ...s, submitButtonText: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Success message</label>
            <Textarea
              rows={2}
              value={settings.successMessage}
              onChange={(e) => setSettings((s) => ({ ...s, successMessage: e.target.value }))}
            />
          </div>
        </div>
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
