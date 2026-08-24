import { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import type { AudienceVariant, LandingPagePixels, LandingPageSchedule, LandingPageSeo } from '@zetsite/shared';
import { api } from '@/lib/api';
import { Input, Textarea, Button, Badge } from '@/components/ui';

interface ChecklistItem {
  key: string;
  label: string;
  passed: boolean;
}

type Tab = 'seo' | 'tracking' | 'lifecycle' | 'personalize';

export default function LandingPageSettingsPanel({
  landingPageId,
  seo,
  onSeoChange,
  pixels,
  onPixelsChange,
  headCode,
  onHeadCodeChange,
  tags,
  onTagsChange,
  pinned,
  onPinnedChange,
  schedule,
  onScheduleChange,
  passwordProtected,
  onPasswordProtectedChange,
  audienceVariants,
  onAudienceVariantsChange,
  returningVisitorHeading,
  onReturningVisitorHeadingChange,
  unavailableRedirect,
  onUnavailableRedirectChange,
  checklist,
  orderWarnings,
  productOutOfStock,
}: {
  landingPageId: string;
  seo: LandingPageSeo;
  onSeoChange: (seo: LandingPageSeo) => void;
  pixels: LandingPagePixels;
  onPixelsChange: (pixels: LandingPagePixels) => void;
  headCode: string;
  onHeadCodeChange: (code: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  pinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
  schedule: LandingPageSchedule;
  onScheduleChange: (schedule: LandingPageSchedule) => void;
  passwordProtected: boolean;
  onPasswordProtectedChange: (protectedFlag: boolean) => void;
  audienceVariants: AudienceVariant[];
  onAudienceVariantsChange: (variants: AudienceVariant[]) => void;
  returningVisitorHeading: string;
  onReturningVisitorHeadingChange: (text: string) => void;
  unavailableRedirect: boolean;
  onUnavailableRedirectChange: (value: boolean) => void;
  checklist: ChecklistItem[];
  orderWarnings: string[];
  productOutOfStock: boolean;
}) {
  const [tab, setTab] = useState<Tab>('seo');
  const [tagInput, setTagInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  async function savePassword() {
    setSavingPassword(true);
    try {
      const res = await api.put(`/landing-pages/${landingPageId}/password`, { password: newPassword });
      onPasswordProtectedChange(res.data.passwordProtected);
      setNewPassword('');
    } finally {
      setSavingPassword(false);
    }
  }

  function addTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) onTagsChange([...tags, value]);
    setTagInput('');
  }

  function addAudienceVariant() {
    onAudienceVariantsChange([...audienceVariants, { utmSource: '', heroHeading: '' }]);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'seo', label: 'SEO' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'lifecycle', label: 'Lifecycle' },
    { id: 'personalize', label: 'Personalize' },
  ];

  return (
    <div className="flex h-full flex-col">
      {(checklist.some((c) => !c.passed) || orderWarnings.length > 0 || productOutOfStock) && (
        <div className="space-y-1.5 border-b border-border bg-warning-subtle px-4 py-3">
          {productOutOfStock && <p className="text-xs text-warning">⚠ The linked product is currently out of stock.</p>}
          {checklist.filter((c) => !c.passed).map((c) => (
            <p key={c.key} className="text-xs text-warning">⚠ {c.label}</p>
          ))}
          {orderWarnings.map((w, i) => (
            <p key={i} className="text-xs text-warning">⚠ {w}</p>
          ))}
        </div>
      )}

      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 border-b-2 px-2 py-2 text-xs font-medium transition-colors ${tab === t.id ? 'border-link text-ink' : 'border-transparent text-ink-tertiary hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {tab === 'seo' && (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Meta title</span>
              <Input value={seo.metaTitle} onChange={(e) => onSeoChange({ ...seo, metaTitle: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Meta description</span>
              <Textarea rows={3} value={seo.metaDescription} onChange={(e) => onSeoChange({ ...seo, metaDescription: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Social share image URL</span>
              <Input value={seo.ogImage} onChange={(e) => onSeoChange({ ...seo, ogImage: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Canonical URL</span>
              <Input value={seo.canonicalUrl} onChange={(e) => onSeoChange({ ...seo, canonicalUrl: e.target.value })} placeholder="https://..." />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={seo.noindex} onChange={(e) => onSeoChange({ ...seo, noindex: e.target.checked })} className="rounded border-border" />
              Hide from search engines (noindex)
            </label>
          </>
        )}

        {tab === 'tracking' && (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Google Analytics ID</span>
              <Input value={pixels.googleAnalyticsId} onChange={(e) => onPixelsChange({ ...pixels, googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXX" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Facebook Pixel ID</span>
              <Input value={pixels.facebookPixelId} onChange={(e) => onPixelsChange({ ...pixels, facebookPixelId: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">TikTok Pixel ID</span>
              <Input value={pixels.tiktokPixelId} onChange={(e) => onPixelsChange({ ...pixels, tiktokPixelId: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Custom head code</span>
              <Textarea rows={5} value={headCode} onChange={(e) => onHeadCodeChange(e.target.value)} className="font-mono text-xs" placeholder="<script>...</script>" />
              <p className="mt-1 text-xs text-ink-tertiary">Injected into this page&apos;s &lt;head&gt; when published.</p>
            </label>
          </>
        )}

        {tab === 'lifecycle' && (
          <>
            <div>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Schedule (optional)</span>
              <label className="mb-2 block">
                <span className="mb-1 block text-xs text-ink-tertiary">Publish at</span>
                <Input
                  type="datetime-local"
                  value={schedule.publishAt ? schedule.publishAt.slice(0, 16) : ''}
                  onChange={(e) => onScheduleChange({ ...schedule, publishAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-tertiary">Unpublish at</span>
                <Input
                  type="datetime-local"
                  value={schedule.unpublishAt ? schedule.unpublishAt.slice(0, 16) : ''}
                  onChange={(e) => onScheduleChange({ ...schedule, unpublishAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={pinned} onChange={(e) => onPinnedChange(e.target.checked)} className="rounded border-border" />
              Pin to top of Landing Pages list
            </label>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={unavailableRedirect} onChange={(e) => onUnavailableRedirectChange(e.target.checked)} className="rounded border-border" />
              Redirect to homepage instead of showing "not found"
            </label>

            <div>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Tags</span>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t} tone="neutral" className="flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => onTagsChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                      <X size={11} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add a tag…" />
                <Button variant="secondary" size="sm" onClick={addTag}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Password protection</span>
              {passwordProtected ? (
                <div className="mb-2 flex items-center justify-between rounded-md border border-border px-3 py-2 text-xs text-ink-secondary">
                  <span>Password set</span>
                  <button type="button" className="text-danger" onClick={() => { setNewPassword(''); api.put(`/landing-pages/${landingPageId}/password`, { password: '' }).then(() => onPasswordProtectedChange(false)); }}>
                    Remove
                  </button>
                </div>
              ) : null}
              <div className="flex gap-1.5">
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Set a password" />
                <Button variant="secondary" size="sm" onClick={savePassword} disabled={!newPassword || savingPassword}>
                  <Check size={14} />
                </Button>
              </div>
            </div>
          </>
        )}

        {tab === 'personalize' && (
          <>
            <div>
              <span className="mb-2 block text-xs font-medium text-ink-secondary">Audience variants (by UTM source)</span>
              <p className="mb-2 text-xs text-ink-tertiary">Show a different hero headline to visitors arriving with a matching <code>?utm_source=</code>.</p>
              {audienceVariants.map((v, i) => (
                <div key={i} className="mb-2 flex items-center gap-1.5">
                  <div className="w-24 shrink-0">
                    <Input
                      value={v.utmSource}
                      onChange={(e) => {
                        const next = [...audienceVariants];
                        next[i] = { ...v, utmSource: e.target.value };
                        onAudienceVariantsChange(next);
                      }}
                      placeholder="facebook"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={v.heroHeading}
                      onChange={(e) => {
                        const next = [...audienceVariants];
                        next[i] = { ...v, heroHeading: e.target.value };
                        onAudienceVariantsChange(next);
                      }}
                      placeholder="Alternate headline"
                    />
                  </div>
                  <button type="button" onClick={() => onAudienceVariantsChange(audienceVariants.filter((_, idx) => idx !== i))} className="text-ink-tertiary hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={addAudienceVariant}>
                <Plus size={14} />
                Add variant
              </Button>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Returning-visitor headline</span>
              <Input value={returningVisitorHeading} onChange={(e) => onReturningVisitorHeadingChange(e.target.value)} placeholder="Welcome back!" />
              <p className="mt-1 text-xs text-ink-tertiary">Shown instead of the default headline on a visitor&apos;s second visit.</p>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
