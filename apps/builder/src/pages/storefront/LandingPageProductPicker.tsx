import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Search, X, Loader2, Layers, FileStack } from 'lucide-react';
import type { GenerationStyle, LandingPageThemeId } from '@zetsite/shared';
import { LANDING_PAGE_THEMES } from '@zetsite/shared/landingThemes';
import { api } from '@/lib/api';
import { IconButton, Input, Select, ResponsiveImage, type ImageVariants } from '@/components/ui';

interface Product {
  id: string;
  title: string;
  category: string;
  media: { url: string; type: string; variants?: ImageVariants }[];
}

interface CollectionSummary {
  id: string;
  name: string;
}

interface TemplateSummary {
  id: string;
  name: string;
  sectionCount: number;
}

const STATUS_LINES = [
  'Reading product details…',
  'Building sections…',
  'Selecting images…',
  'Polishing copy…',
  'Finalizing layout…',
];

const STYLE_OPTIONS: { id: GenerationStyle; label: string }[] = [
  { id: 'direct-response', label: 'Direct-response (urgency + CTA-forward)' },
  { id: 'storytelling', label: 'Storytelling (narrative-first)' },
  { id: 'minimal', label: 'Minimal (lean, essentials only)' },
];

type Tab = 'product' | 'collection' | 'template';

export default function LandingPageProductPicker({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('product');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [collections, setCollections] = useState<CollectionSummary[] | null>(null);
  const [templates, setTemplates] = useState<TemplateSummary[] | null>(null);
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<GenerationStyle>('direct-response');
  const [themeId, setThemeId] = useState<LandingPageThemeId | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [bulkResult, setBulkResult] = useState<{ succeeded: number; failed: number } | null>(null);

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data.products));
  }, []);

  useEffect(() => {
    if (tab === 'collection' && collections === null) {
      api.get('/collections').then((res) => setCollections(res.data.collections));
    }
    if (tab === 'template' && templates === null) {
      api.get('/landing-pages/templates').then((res) => setTemplates(res.data.templates));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (!generatingId) return;
    const timer = setInterval(() => setStatusIndex((i) => (i + 1) % STATUS_LINES.length), 1200);
    return () => clearInterval(timer);
  }, [generatingId]);

  async function generate(product: Product) {
    const existing = await api.get(`/landing-pages?productId=${product.id}`);
    if (existing.data.landingPages.length > 0) {
      const proceed = window.confirm(
        `${product.title} already has a landing page ("${existing.data.landingPages[0].title}"). Create another one anyway?`,
      );
      if (!proceed) return;
    }

    setGeneratingId(product.id);
    try {
      const res = await api.post('/landing-pages/generate', { productId: product.id, style, themeId: themeId ?? undefined });
      navigate(`/storefront/editor?type=landing&id=${res.data.id}`);
    } catch {
      setGeneratingId(null);
    }
  }

  async function generateForCollection(collection: CollectionSummary) {
    setGeneratingId(collection.id);
    try {
      const res = await api.post('/landing-pages/bulk-generate', { collectionId: collection.id, style, themeId: themeId ?? undefined });
      const succeeded = res.data.results.filter((r: any) => r.id).length;
      const failed = res.data.results.length - succeeded;
      setBulkResult({ succeeded, failed });
    } finally {
      setGeneratingId(null);
    }
  }

  async function useTemplate(template: TemplateSummary) {
    const title = window.prompt('Name this landing page', template.name);
    if (!title) return;
    setGeneratingId(template.id);
    try {
      const res = await api.post('/landing-pages/from-template', { templateId: template.id, title });
      navigate(`/storefront/editor?type=landing&id=${res.data.id}`);
    } catch {
      setGeneratingId(null);
    }
  }

  const filteredProducts = products?.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())) ?? [];

  const TABS: { id: Tab; label: string; icon: typeof Search }[] = [
    { id: 'product', label: 'From product', icon: Search },
    { id: 'collection', label: 'From collection', icon: Layers },
    { id: 'template', label: 'From template', icon: FileStack },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-semibold text-ink">Create landing page</h3>
          <IconButton aria-label="Close" onClick={onClose} disabled={!!generatingId}>
            <X size={16} />
          </IconButton>
        </div>

        {generatingId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <Loader2 size={28} className="animate-spin text-ink-tertiary" />
            <p className="text-sm font-medium text-ink">{STATUS_LINES[statusIndex]}</p>
            <p className="text-xs text-ink-tertiary">This only takes a moment.</p>
          </div>
        ) : bulkResult ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <p className="text-sm font-medium text-ink">
              Created {bulkResult.succeeded} landing page{bulkResult.succeeded === 1 ? '' : 's'}
              {bulkResult.failed > 0 ? ` (${bulkResult.failed} failed)` : ''}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2 text-xs font-medium transition-colors ${tab === t.id ? 'border-link text-ink' : 'border-transparent text-ink-tertiary hover:text-ink'}`}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>

            {tab !== 'template' && (
              <div className="border-b border-border p-4">
                <span className="mb-1 block text-xs font-medium text-ink-secondary">Generation style</span>
                <Select value={style} onChange={(e) => setStyle(e.target.value as GenerationStyle)} className="w-full">
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </Select>

                <span className="mb-1.5 mt-3 block text-xs font-medium text-ink-secondary">Layout</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setThemeId(null)}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      themeId === null ? 'border-link bg-link-subtle text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {themeId === null ? <Check size={12} className="text-link" /> : null}
                    Store default
                  </button>
                  {LANDING_PAGE_THEMES.map((t) => {
                    const active = t.id === themeId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeId(t.id)}
                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          active ? 'border-link bg-link-subtle text-ink' : 'border-border bg-surface text-ink-secondary hover:bg-surface-hover'
                        }`}
                      >
                        <span className="flex -space-x-1">
                          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-surface" style={{ backgroundColor: t.colors[0] }} />
                          <span className="h-2.5 w-2.5 rounded-full ring-1 ring-surface" style={{ backgroundColor: t.colors[1] }} />
                        </span>
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'product' && (
              <>
                <div className="border-b border-border p-4">
                  <div className="relative">
                    <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="pl-8" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {products === null && <p className="p-4 text-sm text-ink-secondary">Loading…</p>}
                  {products?.length === 0 && (
                    <p className="p-4 text-sm text-ink-secondary">Add a product first, then come back here to generate a landing page for it.</p>
                  )}
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => generate(product)}
                      className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-surface-hover"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-secondary">
                        {product.media[0]?.type === 'image' && (
                          <ResponsiveImage variants={product.media[0].variants} fallbackSrc={product.media[0].url} alt={product.title} sizes="40px" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{product.title}</p>
                        <p className="text-xs text-ink-tertiary">{product.category || 'Uncategorized'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === 'collection' && (
              <div className="flex-1 overflow-y-auto p-2">
                {collections === null && <p className="p-4 text-sm text-ink-secondary">Loading…</p>}
                {collections?.length === 0 && <p className="p-4 text-sm text-ink-secondary">No collections yet.</p>}
                {collections?.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => generateForCollection(c)}
                    className="flex w-full items-center justify-between rounded-md p-3 text-left hover:bg-surface-hover"
                  >
                    <span className="text-sm font-medium text-ink">{c.name}</span>
                    <span className="text-xs text-ink-tertiary">Generate one page per product</span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'template' && (
              <div className="flex-1 overflow-y-auto p-2">
                {templates === null && <p className="p-4 text-sm text-ink-secondary">Loading…</p>}
                {templates?.length === 0 && (
                  <p className="p-4 text-sm text-ink-secondary">No saved templates yet — save any landing page as a template from its editor.</p>
                )}
                {templates?.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => useTemplate(t)}
                    className="flex w-full items-center justify-between rounded-md p-3 text-left hover:bg-surface-hover"
                  >
                    <span className="text-sm font-medium text-ink">{t.name}</span>
                    <span className="text-xs text-ink-tertiary">{t.sectionCount} sections</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
