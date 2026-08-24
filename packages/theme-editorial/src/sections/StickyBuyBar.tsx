import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface StickyBuyBarSettings {
  priceText: string;
  originalPriceText: string;
  buttonText: string;
  buttonUrl: string;
  showOnDesktop: boolean;
}

export const stickyBuyBarSchema: SectionSchema = {
  type: 'stickyBuyBar',
  label: 'Sticky buy bar',
  fields: [
    { key: 'priceText', type: 'text', label: 'Price', default: '৳2,490', tab: 'content' },
    { key: 'originalPriceText', type: 'text', label: 'Original price (optional, strikethrough)', default: '৳4,990', tab: 'content' },
    { key: 'buttonText', type: 'text', label: 'Button text', default: 'Order now', tab: 'content' },
    { key: 'buttonUrl', type: 'url', label: 'Button link', default: '#order', tab: 'content' },
    { key: 'showOnDesktop', type: 'boolean', label: 'Also show on desktop', default: false, tab: 'advanced' },
  ],
  defaultSettings: {
    priceText: '৳2,490',
    originalPriceText: '৳4,990',
    buttonText: 'Order now',
    buttonUrl: '#order',
    showOnDesktop: false,
  },
};

export function StickyBuyBar({ settings }: SectionComponentProps<StickyBuyBarSettings>) {
  if (!settings.priceText && !settings.buttonText) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-emerald-100 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur ${
        settings.showOnDesktop ? 'flex' : 'flex lg:hidden'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-emerald-700">{settings.priceText}</span>
            {settings.originalPriceText ? (
              <span className="text-xs font-medium text-neutral-400 line-through">{settings.originalPriceText}</span>
            ) : null}
          </div>
        </div>
        <a
          href={settings.buttonUrl || '#order'}
          className="shrink-0 rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800"
        >
          {settings.buttonText}
        </a>
      </div>
    </div>
  );
}
