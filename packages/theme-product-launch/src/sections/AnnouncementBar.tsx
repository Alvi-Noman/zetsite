import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, DISMISSIBLE_FIELD, type ContentAlign } from '@zetsite/theme-kit';

export interface AnnouncementBarSettings {
  backgroundColor: string;
  textColor: string;
  intervalSeconds: number;
  align: ContentAlign;
  dismissible: boolean;
  showDivider: boolean;
}

export const announcementBarSchema: SectionSchema = {
  type: 'announcementBar',
  label: 'Announcement bar',
  allowedBlockTypes: ['announcement'],
  defaultBlocks: [{ type: 'announcement', settings: {} }],
  fields: [
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#E11D48', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#ffffff', tab: 'style' },
    { key: 'intervalSeconds', type: 'number', label: 'Rotate every (seconds)', default: 4, tab: 'style' },
    { key: 'showDivider', type: 'boolean', label: 'Show bottom border', default: false, tab: 'style' },
    ALIGN_FIELD,
    DISMISSIBLE_FIELD,
  ],
  defaultSettings: {
    backgroundColor: '#E11D48',
    textColor: '#ffffff',
    intervalSeconds: 4,
    align: 'center',
    dismissible: false,
    showDivider: false,
  },
};

interface AnnouncementData {
  text?: string;
  url?: string;
}

const FALLBACK: AnnouncementData = { text: 'Free shipping on orders over $50', url: '' };
const TEXT_ALIGN_CLASS: Record<ContentAlign, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };

export function AnnouncementBar({ settings, blocks }: SectionComponentProps<AnnouncementBarSettings>) {
  const items = blocks?.length ? blocks.map((b) => b.settings as AnnouncementData) : [FALLBACK];
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), (settings.intervalSeconds || 4) * 1000);
    return () => clearInterval(timer);
  }, [items.length, settings.intervalSeconds]);

  if (dismissed) return null;

  const item = items[index] ?? items[0];
  const content = <span className="text-xs font-semibold tracking-wide">{item.text}</span>;

  return (
    <div
      className={`relative px-4 py-2 ${settings.showDivider ? 'border-b border-black/10' : ''} ${TEXT_ALIGN_CLASS[settings.align] ?? 'text-center'}`}
      style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}
    >
      {item.url ? <a href={item.url}>{content}</a> : content}
      {settings.dismissible ? (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}
