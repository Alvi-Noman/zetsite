import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, DISMISSIBLE_FIELD, type ContentAlign } from '@zetsite/theme-kit';

export interface SocialProofBarSettings {
  intervalSeconds: number;
  align: ContentAlign;
  dismissible: boolean;
  displayStyle: 'bar' | 'floating';
  position: 'bottom-left' | 'bottom-right';
}

export const socialProofBarSchema: SectionSchema = {
  type: 'socialProofBar',
  label: 'Social proof bar',
  allowedBlockTypes: ['proofMessage'],
  defaultBlocks: [{ type: 'proofMessage', settings: {} }],
  fields: [
    { key: 'intervalSeconds', type: 'number', label: 'Rotate every (seconds)', default: 4, tab: 'style' },
    {
      key: 'displayStyle',
      type: 'select',
      label: 'Display style',
      default: 'bar',
      tab: 'style',
      options: [
        { label: 'Full-width bar', value: 'bar' },
        { label: 'Floating notification', value: 'floating' },
      ],
    },
    {
      key: 'position',
      type: 'select',
      label: 'Floating position',
      default: 'bottom-left',
      tab: 'style',
      options: [
        { label: 'Bottom left', value: 'bottom-left' },
        { label: 'Bottom right', value: 'bottom-right' },
      ],
    },
    ALIGN_FIELD,
    DISMISSIBLE_FIELD,
  ],
  defaultSettings: { intervalSeconds: 4, align: 'center', dismissible: false, displayStyle: 'bar', position: 'bottom-left' },
};

interface ProofMessageData {
  message?: string;
}

const FALLBACK: ProofMessageData = { message: '🔥 12 people bought this in the last 24 hours' };
const TEXT_ALIGN_CLASS: Record<ContentAlign, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };
const POSITION_CLASS: Record<SocialProofBarSettings['position'], string> = {
  'bottom-left': 'left-4',
  'bottom-right': 'right-4',
};

export function SocialProofBar({ settings, blocks }: SectionComponentProps<SocialProofBarSettings>) {
  const messages = blocks?.length ? blocks.map((b) => b.settings as ProofMessageData) : [FALLBACK];
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), (settings.intervalSeconds || 4) * 1000);
    return () => clearInterval(timer);
  }, [messages.length, settings.intervalSeconds]);

  if (dismissed) return null;

  if (settings.displayStyle === 'floating') {
    return (
      <div className={`pointer-events-none fixed bottom-4 z-40 ${POSITION_CLASS[settings.position] ?? POSITION_CLASS['bottom-left']}`}>
        <style>{`
          @keyframes zetsite-proof-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <div
          key={index}
          className="pointer-events-auto flex max-w-xs items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-lg"
          style={{ animation: 'zetsite-proof-in 0.4s ease-out' }}
        >
          <p className="text-xs font-medium text-neutral-700">{messages[index]?.message}</p>
          {settings.dismissible ? (
            <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss" className="shrink-0 text-neutral-400 hover:text-neutral-700">
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-neutral-50 border-y border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 ${TEXT_ALIGN_CLASS[settings.align] ?? 'text-center'}`}
    >
      {messages[index]?.message}
      {settings.dismissible ? (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  );
}
