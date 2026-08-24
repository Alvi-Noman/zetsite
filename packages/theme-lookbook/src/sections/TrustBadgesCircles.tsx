import { Check, CreditCard, RefreshCw, Shield, Truck } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { TrustBadgeIcon, TrustBadgeSettings } from '../blocks/TrustBadge.js';

export interface TrustBadgesCirclesSettings {}

export const trustBadgesCirclesSchema: SectionSchema = {
  type: 'trustBadgesCircles',
  label: 'Trust badges (icon circles)',
  allowedBlockTypes: ['trustBadge'],
  defaultBlocks: [
    { type: 'trustBadge', settings: { icon: 'shield', label: '1 year warranty', value: '' } },
    { type: 'trustBadge', settings: { icon: 'refresh', label: 'Easy returns', value: '' } },
    { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '' } },
    { type: 'trustBadge', settings: { icon: 'creditCard', label: 'Cash on delivery', value: '' } },
  ],
  fields: [],
  defaultSettings: {},
};

const ICONS: Record<TrustBadgeIcon, typeof Shield> = { shield: Shield, refresh: RefreshCw, truck: Truck, creditCard: CreditCard, check: Check };

export function TrustBadgesCircles({ blocks }: SectionComponentProps<TrustBadgesCirclesSettings>) {
  const badges = (blocks?.length ? blocks.map((b) => b.settings as unknown as TrustBadgeSettings) : []) as TrustBadgeSettings[];
  if (!badges.length) return null;
  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-8">
        {badges.map((badge, i) => {
          const Icon = ICONS[badge.icon] ?? Shield;
          return (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-200 text-yellow-700">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <p className="text-xs font-semibold text-neutral-900">{badge.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
