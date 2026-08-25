import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';

interface PixelSettings {
  enabled: boolean;
  pixelId: string;
  capiAccessToken: string;
  testEventCode: string;
}

const DEFAULT_SETTINGS: PixelSettings = {
  enabled: false,
  pixelId: '',
  capiAccessToken: '',
  testEventCode: '',
};

export default function FacebookPixelSettingsPage() {
  const [settings, setSettings] = useState<PixelSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    api.get('/pixel-settings').then((res) => {
      setSettings(res.data.settings ?? DEFAULT_SETTINGS);
      setLoaded(true);
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await api.put('/pixel-settings', settings);
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
      <h2 className="mb-1 text-2xl font-semibold text-ink">Facebook Pixel & Conversions API</h2>
      <p className="mb-6 text-sm text-ink-tertiary">
        Runs Meta's recommended dual setup — the browser Pixel fires on every storefront page, and the
        Conversions API sends the same Purchase event from our server with a shared event ID so Meta
        deduplicates them into one conversion. This covers Home, Product, Collection, and order-confirmation
        pages. Landing pages keep their own pixel override in each page's Tracking tab for the PageView tag.
      </p>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink">Enable tracking</h3>
            <p className="mt-0.5 text-xs text-ink-tertiary">Turns the Pixel and Conversions API on or off together.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-accent"
              checked={settings.enabled}
              onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
            />
          </label>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Pixel</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Pixel ID</label>
          <Input
            placeholder="e.g. 1234567890123456"
            value={settings.pixelId}
            onChange={(e) => setSettings((s) => ({ ...s, pixelId: e.target.value }))}
          />
          <p className="mt-1 text-xs text-ink-tertiary">
            Found in Meta Events Manager &gt; Data Sources &gt; your pixel.
          </p>
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="mb-4 text-sm font-semibold text-ink">Conversions API</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Access token</label>
            <Input
              type="password"
              placeholder="Generated in Events Manager > Settings > Conversions API"
              value={settings.capiAccessToken}
              onChange={(e) => setSettings((s) => ({ ...s, capiAccessToken: e.target.value }))}
            />
            <p className="mt-1 text-xs text-ink-tertiary">
              Kept server-side only — it's never sent to storefront visitors.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Test event code (optional)</label>
            <Input
              placeholder="e.g. TEST12345"
              value={settings.testEventCode}
              onChange={(e) => setSettings((s) => ({ ...s, testEventCode: e.target.value }))}
            />
            <p className="mt-1 text-xs text-ink-tertiary">
              Paste this from Events Manager &gt; Test events while verifying, then clear it before going live.
            </p>
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
