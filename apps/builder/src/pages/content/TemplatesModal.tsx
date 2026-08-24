import type { StarterTemplate } from '@zetsite/theme-minimal';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui';

export default function TemplatesModal({
  templates,
  onApply,
  onClose,
}: {
  templates: StarterTemplate[];
  onApply: (template: StarterTemplate) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Homepage templates" onClose={onClose}>
      <p className="mb-4 text-sm text-ink-secondary">
        Replace your current sections with a pre-built layout. You can still customize everything afterward.
      </p>
      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium text-ink">{t.name}</p>
              <p className="text-xs text-ink-tertiary">{t.sections.length} sections</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onApply(t)}>
              Use this
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
