import { useEffect, useRef, useState } from 'react';
import { Wand2, Clock, Shield, Users, ArrowUpDown, Copy, Palette, FileStack } from 'lucide-react';
import { IconButton } from '@/components/ui';

export default function LandingPageToolsMenu({
  onInsertUrgency,
  onInsertTrustBadges,
  onInsertSocialProof,
  onFixOrder,
  onCreateAbVariant,
  onDuplicateTheme,
  onSaveAsTemplate,
}: {
  onInsertUrgency: () => void;
  onInsertTrustBadges: () => void;
  onInsertSocialProof: () => void;
  onFixOrder: () => void;
  onCreateAbVariant: () => void;
  onDuplicateTheme: () => void;
  onSaveAsTemplate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const ITEMS = [
    { icon: Clock, label: 'Insert urgency', onClick: onInsertUrgency },
    { icon: Shield, label: 'Insert trust badges', onClick: onInsertTrustBadges },
    { icon: Users, label: 'Insert social proof', onClick: onInsertSocialProof },
    { icon: ArrowUpDown, label: 'Fix section order', onClick: onFixOrder },
    { icon: Copy, label: 'Create A/B variant', onClick: onCreateAbVariant },
    { icon: Palette, label: 'Duplicate to other layout', onClick: onDuplicateTheme },
    { icon: FileStack, label: 'Save as template', onClick: onSaveAsTemplate },
  ];

  return (
    <div ref={ref} className="relative">
      <IconButton aria-label="Landing page tools" title="Landing page tools" onClick={() => setOpen((v) => !v)} className={open ? 'bg-surface-selected text-ink' : ''}>
        <Wand2 size={15} />
      </IconButton>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-md border border-border bg-surface py-1 shadow-lg">
          {ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink-secondary hover:bg-surface-hover hover:text-ink"
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
