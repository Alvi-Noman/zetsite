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
  /** Advertorial-only additions: lets this banner double as a price-drop strip. */
  priceText: string;
  originalPriceText: string;
  discountBadgeText: string;
}

export const countdownBannerSchema: SectionSchema = {
  type: 'countdownBanner',
  label: 'Countdown timer',
  allowedBlockTypes: ['heading'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Sale ends in', size: 'sm' } }],
  fields: [
    { key: 'targetDate', type: 'text', label: 'Target date/time (ISO)', default: '', tab: 'content' },
    { key: 'expiredText', type: 'text', label: 'Text after expiry', default: 'Offer has ended', tab: 'content' },
    { key: 'priceText', type: 'text', label: 'Price (optional)', default: '', tab: 'content' },
    { key: 'originalPriceText', type: 'text', label: 'Original price (optional, strikethrough)', default: '', tab: 'content' },
    { key: 'discountBadgeText', type: 'text', label: 'Discount badge (optional)', default: '', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#dc2626', tab: 'style' },
    { key: 'textColor', type: 'color', label: 'Text color', default: '#ffffff', tab: 'style' },
    ALIGN_FIELD,
    { key: 'hideWhenExpired', type: 'boolean', label: 'Hide section entirely when expired', default: false, tab: 'advanced' },
  ],
  defaultSettings: {
    targetDate: '',
    expiredText: 'Offer has ended',
    priceText: '',
    originalPriceText: '',
    discountBadgeText: '',
    backgroundColor: '#dc2626',
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
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  if (expired && settings.hideWhenExpired) return null;

  const days = Math.max(0, Math.floor(remaining / 86400000));
  const hours = Math.max(0, Math.floor((remaining % 86400000) / 3600000));
  const minutes = Math.max(0, Math.floor((remaining % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000));

  return (
    <div className={`px-6 py-8 flex flex-col ${align}`} style={{ backgroundColor: settings.backgroundColor, color: settings.textColor }}>
      {expired ? (
        <p className="text-sm font-semibold">{settings.expiredText}</p>
      ) : (
        <>
          <div className="mb-2">{renderBlocks?.()}</div>
          {settings.priceText ? (
            <div className={`mb-3 flex flex-wrap items-center gap-2.5 ${align}`}>
              <span className="text-3xl font-black tracking-tight">{settings.priceText}</span>
              {settings.originalPriceText ? (
                <span className="text-base font-medium opacity-70 line-through">{settings.originalPriceText}</span>
              ) : null}
              {settings.discountBadgeText ? (
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide">
                  {settings.discountBadgeText}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="flex gap-4 font-mono text-2xl font-bold">
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
