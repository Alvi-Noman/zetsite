import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, X } from 'lucide-react';
import type { LandingPageThemeId } from '@zetsite/shared';
import { LANDING_PAGE_THEMES, DEFAULT_LANDING_PAGE_THEME_ID } from '@zetsite/shared/landingThemes';
import { api } from '@/lib/api';
import { Button, Textarea, IconButton } from '@/components/ui';

const DESCRIPTION_MAX = 4000;

interface GenerateFromDescriptionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GenerateFromDescriptionModal({ open, onClose }: GenerateFromDescriptionModalProps) {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [themeId, setThemeId] = useState<LandingPageThemeId>(DEFAULT_LANDING_PAGE_THEME_ID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleClose() {
    if (submitting) return;
    setError(null);
    onClose();
  }

  async function generate() {
    if (!description.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/landing-pages/generate-from-description', {
        description: description.trim(),
        themeId,
      });
      navigate(`/storefront/editor?type=landing&id=${res.data.id}`);
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong generating this page. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-semibold text-ink">Generate with AI</h3>
          <IconButton aria-label="Close" onClick={handleClose} disabled={submitting}>
            <X size={16} />
          </IconButton>
        </div>

        {submitting ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <Loader2 size={28} className="animate-spin text-ink-tertiary" />
            <p className="text-sm font-medium text-ink">Generating your landing page…</p>
            <p className="text-xs text-ink-tertiary">This can take up to a minute — hang tight.</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div>
              <span className="mb-1 block text-xs font-medium text-ink-secondary">Describe your product and offer</span>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
                placeholder="e.g. 'Wireless earbuds with 30hr battery, targeting commuters, ৳2,500 launch price, free shipping, 1-year warranty...'"
                rows={6}
              />
              <p className="mt-1 text-right text-xs text-ink-tertiary">
                {description.length}/{DESCRIPTION_MAX}
              </p>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Layout</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {LANDING_PAGE_THEMES.map((t) => {
                  const active = t.id === themeId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      className={`relative flex flex-col gap-1.5 rounded-md border px-3 py-2.5 text-left transition-colors ${
                        active ? 'border-link bg-link-subtle' : 'border-border bg-surface hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex -space-x-1.5">
                          <span className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ backgroundColor: t.colors[0] }} />
                          <span className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ backgroundColor: t.colors[1] }} />
                        </span>
                        {active ? <Check size={14} className="text-link" /> : null}
                      </div>
                      <span className="text-xs font-semibold text-ink">{t.name}</span>
                      <span className="text-[11px] leading-tight text-ink-tertiary">{t.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button variant="primary" onClick={generate} disabled={!description.trim() || submitting} className="w-full justify-center">
              Generate landing page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
