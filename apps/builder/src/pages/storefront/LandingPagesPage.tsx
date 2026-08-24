import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, MoreHorizontal, Copy, Trash2, ExternalLink, Search, Pin, Archive, ArchiveRestore, EyeOff } from 'lucide-react';
import type { LandingPageSummary } from '@zetsite/shared';
import { api } from '@/lib/api';
import { buildStorefrontUrl } from '@/lib/storefrontLink';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Badge, Input, Select } from '@/components/ui';
import LandingPageProductPicker from './LandingPageProductPicker';
import GenerateFromDescriptionModal from './GenerateFromDescriptionModal';

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

const GENERATION_LABEL: Record<string, string> = {
  native: 'Native',
  'ai-enhanced': 'AI-enhanced',
  'ai-partial': 'AI-enhanced',
};

type StatusFilter = 'active' | 'draft' | 'published' | 'archived';
type SortOption = 'updatedAt' | 'created' | 'views';

export default function LandingPagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [landingPages, setLandingPages] = useState<LandingPageSummary[] | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [sort, setSort] = useState<SortOption>('updatedAt');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function load() {
    const params = new URLSearchParams({ sort });
    if (statusFilter !== 'active') params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());
    api.get(`/landing-pages?${params.toString()}`).then((res) => setLandingPages(res.data.landingPages));
  }

  useEffect(load, [statusFilter, sort]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function duplicate(id: string) {
    await api.post(`/landing-pages/${id}/duplicate`);
    setOpenMenuId(null);
    load();
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this landing page? This cannot be undone.')) return;
    await api.delete(`/landing-pages/${id}`);
    setOpenMenuId(null);
    load();
  }

  async function togglePin(id: string, current: boolean) {
    await api.put(`/landing-pages/${id}/pin`, { pinned: !current });
    setOpenMenuId(null);
    load();
  }

  async function archive(id: string) {
    await api.post(`/landing-pages/${id}/archive`);
    setOpenMenuId(null);
    load();
  }

  async function restore(id: string) {
    await api.post(`/landing-pages/${id}/restore`);
    setOpenMenuId(null);
    load();
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function bulkAction(action: 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete') {
    if (selected.size === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selected.size} landing page(s)? This cannot be undone.`)) return;
    await api.post('/landing-pages/bulk', { ids: [...selected], action });
    setSelected(new Set());
    load();
  }

  const storeSlug = user?.store?.slug ?? '';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Landing pages</h2>
          <p className="mt-1 text-sm text-ink-secondary">Generate a complete, editable landing page from any product in one click.</p>
        </div>
        {landingPages && landingPages.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowGenerateModal(true)}>
              <Sparkles size={16} />
              Generate with AI
            </Button>
            <Button variant="primary" onClick={() => setShowPicker(true)}>
              <Plus size={16} />
              Create landing page
            </Button>
          </div>
        )}
      </div>

      {landingPages === null && <p className="text-sm text-ink-secondary">Loading…</p>}

      {landingPages?.length === 0 && !search && statusFilter === 'active' && (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface text-center">
          <Sparkles size={28} className="mb-3 text-ink-tertiary" />
          <p className="text-sm font-medium text-ink">No landing pages yet</p>
          <p className="mb-4 max-w-sm text-sm text-ink-secondary">
            Pick a product and we&apos;ll build a complete, editable landing page for it instantly — no AI key required to get started.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowGenerateModal(true)}>
              <Sparkles size={16} />
              Generate with AI
            </Button>
            <Button variant="primary" onClick={() => setShowPicker(true)}>
              <Plus size={16} />
              Create landing page
            </Button>
          </div>
        </div>
      )}

      {landingPages && (landingPages.length > 0 || search || statusFilter !== 'active') && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or slug…" className="pl-8" />
            </div>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="w-36">
              <option value="active">All active</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="w-40">
              <option value="updatedAt">Recently updated</option>
              <option value="created">Recently created</option>
              <option value="views">Most viewed</option>
            </Select>
            {selected.size > 0 && (
              <div className="ml-auto flex items-center gap-2 text-xs text-ink-secondary">
                {selected.size} selected
                {statusFilter === 'archived' ? (
                  <button type="button" className="text-link hover:underline" onClick={() => bulkAction('restore')}>Restore</button>
                ) : (
                  <>
                    <button type="button" className="text-link hover:underline" onClick={() => bulkAction('publish')}>Publish</button>
                    <button type="button" className="text-link hover:underline" onClick={() => bulkAction('unpublish')}>Unpublish</button>
                    <button type="button" className="text-link hover:underline" onClick={() => bulkAction('archive')}>Archive</button>
                  </>
                )}
                <button type="button" className="text-danger hover:underline" onClick={() => bulkAction('delete')}>Delete</button>
              </div>
            )}
          </div>

          {landingPages.length === 0 ? (
            <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-ink-tertiary">No landing pages match these filters.</p>
          ) : (
            <div className="space-y-2">
              {landingPages.map((lp) => (
                <Card key={lp.id} className="flex items-center justify-between p-4">
                  <div className="flex flex-1 items-center gap-3">
                    <input type="checkbox" checked={selected.has(lp.id)} onChange={() => toggleSelected(lp.id)} className="rounded border-border" />
                    <button type="button" onClick={() => navigate(`/storefront/editor?type=landing&id=${lp.id}`)} className="flex flex-1 items-center gap-3 text-left">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {lp.pinned && <Pin size={12} className="text-ink-tertiary" />}
                          <p className="text-sm font-medium text-ink">{lp.title}</p>
                          <Badge tone={lp.status === 'published' ? 'success' : lp.status === 'archived' ? 'neutral' : 'neutral'}>
                            {lp.status === 'published' ? 'Published' : lp.status === 'archived' ? 'Archived' : 'Draft'}
                          </Badge>
                          {lp.generation ? <Badge tone="accent">{GENERATION_LABEL[lp.generation.status] ?? lp.generation.status}</Badge> : null}
                          {lp.passwordProtected && <EyeOff size={12} className="text-ink-tertiary" aria-label="Password protected" />}
                          {lp.abTest?.variantOfId && <Badge tone="warning">A/B</Badge>}
                          {lp.tags.map((t) => (
                            <Badge key={t} tone="neutral">{t}</Badge>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-ink-tertiary">
                          /pages/{lp.slug} · {lp.sectionCount} sections · Updated {relativeTime(lp.updatedAt)}
                          {lp.analytics.views > 0 && ` · ${lp.analytics.views} views · ${lp.analytics.conversions} conversions`}
                        </p>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {lp.status === 'published' && (
                      <a
                        href={buildStorefrontUrl(storeSlug, `/pages/${lp.slug}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md p-1.5 text-ink-secondary hover:bg-surface-hover hover:text-ink"
                        aria-label="View live"
                        title="View live"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === lp.id ? null : lp.id)}
                        className="rounded-md p-1.5 text-ink-secondary hover:bg-surface-hover hover:text-ink"
                        aria-label="More actions"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenuId === lp.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-md border border-border bg-surface py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => togglePin(lp.id, lp.pinned)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink-secondary hover:bg-surface-hover hover:text-ink"
                          >
                            <Pin size={14} />
                            {lp.pinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicate(lp.id)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink-secondary hover:bg-surface-hover hover:text-ink"
                          >
                            <Copy size={14} />
                            Duplicate
                          </button>
                          {lp.status === 'archived' ? (
                            <button
                              type="button"
                              onClick={() => restore(lp.id)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink-secondary hover:bg-surface-hover hover:text-ink"
                            >
                              <ArchiveRestore size={14} />
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => archive(lp.id)}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink-secondary hover:bg-surface-hover hover:text-ink"
                            >
                              <Archive size={14} />
                              Archive
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => remove(lp.id)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-danger hover:bg-danger-subtle"
                          >
                            <Trash2 size={14} />
                            Delete permanently
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {showPicker && <LandingPageProductPicker onClose={() => { setShowPicker(false); load(); }} />}
      <GenerateFromDescriptionModal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} />
    </div>
  );
}
