import { useEffect, useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, ALIGN_CLASS, type ContentAlign } from '@zetsite/theme-kit';

export interface CountdownBannerSettings {
  targetDate: string;
  expiredText: string;
  backgroundColor: string;
  textColor: string;
  align: ContentAlign;
  hideWhenExpired: boolean;
}

export const countdownBannerSchema: SectionSchema = {
  type: 'countdownBanner',
  label: 'Countdown timer',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Sale ends in', size: 'sm' } }],
  fields: [
    { key: 'targetDate', type: 'text', label: 'Target date/time (ISO)', default: '', tab: 'content' },
    { key: 'expiredText', type: 'text', label: 'Text after expiry', default: 'Offer has ended', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#000000', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#ffffff', tab: 'style' },
    ALIGN_FIELD,
    { key: 'hideWhenExpired', type: 'boolean', label: 'Hide section entirely when expired', default: false, tab: 'advanced' },
  ],
  defaultSettings: {
    targetDate: '',
    expiredText: 'Offer has ended',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    align: 'center',
    hideWhenExpired: false,
  },
};

function useCountdown(targetDate: string) {
  const [remaining, setRemaining] = useState(() => (targetDate ? new Date(targetDate).getTime() - Date.now() : 0));

  useEffect(() => {
    if (!targetDate) return;
    const timer = setInterval(() => setRemaining(new Date(targetDate).getTime() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return remaining;
}

export function CountdownBanner({ settings, renderBlocks }: SectionComponentProps<CountdownBannerSettings>) {
  const remaining = useCountdown(settings.targetDate);
  const expired = settings.targetDate ? remaining <= 0 : false;

  const days = Math.max(0, Math.floor(remaining / 86400000));
  const hours = Math.max(0, Math.floor((remaining % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((remaining % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000));

  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  if (expired && settings.hideWhenExpired) return null;

  return (
    <div className={`px-6 py-10 flex flex-col ${align}`} style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      {expired ? (
        <p className="text-sm font-bold uppercase tracking-widest">{settings.expiredText}</p>
      ) : (
        <>
          <div className="mb-4">{renderBlocks?.()}</div>
          <div className="flex justify-center gap-6 font-mono text-3xl font-black">
            <span>{String(days).padStart(2, '0')}d</span>
            <span>{String(hours).padStart(2, '0')}h</span>
            <span>{String(minutes).padStart(2, '0')}m</span>
            <span>{String(seconds).padStart(2, '0')}s</span>
          </div>
        </>
      )}
    </div>
  );
}
