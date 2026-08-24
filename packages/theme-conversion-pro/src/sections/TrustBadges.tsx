import { Check, CreditCard, RefreshCw, Shield, Truck } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { TrustBadgeIcon, TrustBadgeSettings } from '../blocks/TrustBadge.js';

export interface TrustBadgesSettings {
  backgroundColor: string;
}

export const trustBadgesSchema: SectionSchema = {
  type: 'trustBadges',
  label: 'Trust badges',
  allowedBlockTypes: ['trustBadge'],
  defaultBlocks: [
    { type: 'trustBadge', settings: { icon: 'shield', label: '1 year warranty', value: '' } },
    { type: 'trustBadge', settings: { icon: 'refresh', label: 'Easy returns', value: '7-day exchange' } },
    { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '2-3 business days' } },
    { type: 'trustBadge', settings: { icon: 'creditCard', label: 'Cash on delivery', value: 'Pay when it arrives' } },
  ],
  fields: [{ key: 'backgroundColor', type: 'color', label: 'Background color', default: '#FFFBEB', tab: 'style' }],
  defaultSettings: { backgroundColor: '#FFFBEB' },
};

const ICONS: Record<TrustBadgeIcon, typeof Shield> = {
  shield: Shield,
  refresh: RefreshCw,
  truck: Truck,
  creditCard: CreditCard,
  check: Check,
};

export function TrustBadges({ settings, blocks }: SectionComponentProps<TrustBadgesSettings>) {
  const badges = (blocks?.length ? blocks.map((b) => b.settings as unknown as TrustBadgeSettings) : []) as TrustBadgeSettings[];

  if (!badges.length) return null;

  return (
    <div className="px-4 py-6 border-y border-amber-100" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
        {badges.map((badge, i) => {
          const Icon = ICONS[badge.icon] ?? Shield;
          return (
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-3 shadow-sm ring-1 ring-amber-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white">
                <Icon size={16} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-neutral-900">{badge.label}</p>
                {badge.value ? <p className="truncate text-[11px] text-neutral-500">{badge.value}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
