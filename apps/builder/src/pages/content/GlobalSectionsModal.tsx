import { useEffect, useState } from 'react';
import type { GlobalSection } from '@zetsite/shared';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui';

export default function GlobalSectionsModal({
  onInsert,
  onClose,
}: {
  onInsert: (globalSection: GlobalSection) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<GlobalSection[] | null>(null);

  useEffect(() => {
    api.get('/global-sections').then((res) => setItems(res.data.globalSections));
  }, []);

  return (
    <Modal title="Reusable sections" onClose={onClose}>
      {items === null && <p className="text-sm text-ink-tertiary">Loading…</p>}
      {items?.length === 0 && (
        <p className="text-sm text-ink-tertiary">
          No reusable sections yet. Select a section and choose &quot;Save as reusable section&quot; in its Advanced tab.
        </p>
      )}
      <div className="space-y-2">
        {items?.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-md border border-border p-3">
            <p className="text-sm font-medium text-ink">{g.label}</p>
            <Button variant="secondary" size="sm" onClick={() => onInsert(g)}>
              Insert
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
