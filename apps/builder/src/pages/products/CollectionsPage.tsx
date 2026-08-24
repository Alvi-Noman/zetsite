import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Tag, Search, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import { Button, Input, Select, IconButton } from '@/components/ui';

interface Collection {
  id: string;
  name: string;
  productsCount: number;
  createdAt: string;
}

const PAGE_SIZE = 50;

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    api
      .get('/collections')
      .then((res) => setCollections(res.data.collections))
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load collections'));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!collections) return [];
    const q = search.trim().toLowerCase();
    return q ? collections.filter((c) => c.name.toLowerCase().includes(q)) : collections;
  }, [collections, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filtered.length, page * PAGE_SIZE + PAGE_SIZE);

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((c) => selected.has(c.id));

  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageItems.forEach((c) => next.delete(c.id));
      } else {
        pageItems.forEach((c) => next.add(c.id));
      }
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openCreate() {
    setNameInput('');
    setFormError(null);
    setCreateOpen(true);
  }

  function openEdit(collection: Collection) {
    setNameInput(collection.name);
    setFormError(null);
    setEditing(collection);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      await api.post('/collections', { name: nameInput });
      setCreateOpen(false);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to create collection');
    } finally {
      setSaving(false);
    }
  }

  async function handleRename(e: FormEvent) {
    e.preventDefault();
    if (!editing || !nameInput.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      await api.patch(`/collections/${editing.id}`, { name: nameInput });
      setEditing(null);
      load();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Failed to rename collection');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSelected() {
    await Promise.all(Array.from(selected).map((id) => api.delete(`/collections/${id}`)));
    setSelected(new Set());
    load();
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-ink" />
          <h2 className="text-base font-semibold text-ink">Collections</h2>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
              Delete ({selected.size})
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={openCreate}>
            Add collection
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Select defaultValue="All">
          <option>All</option>
        </Select>
        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary"
          />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search and filter"
            className="py-1.5 pl-8"
          />
        </div>
      </div>

      {error && <div className="px-4 py-3 text-sm text-danger">{error}</div>}

      {collections === null && !error && (
        <p className="px-4 py-6 text-sm text-ink-secondary">Loading...</p>
      )}

      {collections !== null && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
          <Tag size={26} className="text-ink-tertiary" />
          <p className="text-sm font-medium text-ink">
            {search ? 'No collections match your search' : 'No collections yet'}
          </p>
          {!search && (
            <p className="text-sm text-ink-secondary">Add one to start grouping your products.</p>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <>
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-secondary text-xs text-ink-tertiary">
              <tr>
                <th className="w-10 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="w-10 px-2 py-2.5" />
                <th className="px-2 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 text-right font-medium">Products</th>
                <th className="px-4 py-2.5 font-medium">Conditions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((collection) => (
                <tr key={collection.id} className="border-t border-border hover:bg-surface-hover">
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(collection.id)}
                      onChange={() => toggleSelect(collection.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-secondary text-ink-tertiary">
                      <ImageIcon size={14} />
                    </div>
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => openEdit(collection)}
                      className="font-medium text-ink underline-offset-2 hover:underline"
                    >
                      {collection.name}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right text-ink-secondary">
                    {collection.productsCount}
                  </td>
                  <td className="px-4 py-2.5 text-ink-tertiary">—</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-3 border-t border-border px-4 py-2.5">
            <IconButton
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="border border-border"
            >
              <ChevronLeft size={15} />
            </IconButton>
            <IconButton
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="border border-border"
            >
              <ChevronRight size={15} />
            </IconButton>
            <span className="text-sm text-ink-secondary">
              {rangeStart}-{rangeEnd}
            </span>
          </div>
        </>
      )}

      {createOpen && (
        <Modal title="Add collection" onClose={() => setCreateOpen(false)}>
          <form onSubmit={handleCreate}>
            <label className="mb-1 block text-sm font-medium text-ink-secondary">Title</label>
            <Input
              autoFocus
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Summer Sale"
              className="mb-2"
            />
            {formError && <p className="mb-2 text-sm text-danger">{formError}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving || !nameInput.trim()}>
                {saving ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title="Rename collection" onClose={() => setEditing(null)}>
          <form onSubmit={handleRename}>
            <label className="mb-1 block text-sm font-medium text-ink-secondary">Title</label>
            <Input
              autoFocus
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="mb-2"
            />
            {formError && <p className="mb-2 text-sm text-danger">{formError}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving || !nameInput.trim()}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
