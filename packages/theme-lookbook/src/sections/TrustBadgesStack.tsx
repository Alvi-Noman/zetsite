import { Check, CreditCard, RefreshCw, Shield, Truck } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { TrustBadgeIcon, TrustBadgeSettings } from '../blocks/TrustBadge.js';

export interface TrustBadgesStackSettings {}

export const trustBadgesStackSchema: SectionSchema = {
  type: 'trustBadgesStack',
  label: 'Trust badges (stacked list)',
  allowedBlockTypes: ['trustBadge'],
  defaultBlocks: [
    { type: 'trustBadge', settings: { icon: 'shield', label: '1 year warranty', value: '' } },
    { type: 'trustBadge', settings: { icon: 'refresh', label: 'Easy returns', value: '7-day exchange' } },
    { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '2-3 business days' } },
  ],
  fields: [],
  defaultSettings: {},
};

const ICONS: Record<TrustBadgeIcon, typeof Shield> = { shield: Shield, refresh: RefreshCw, truck: Truck, creditCard: CreditCard, check: Check };

export function TrustBadgesStack({ blocks }: SectionComponentProps<TrustBadgesStackSettings>) {
  const badges = (blocks?.length ? blocks.map((b) => b.settings as unknown as TrustBadgeSettings) : []) as TrustBadgeSettings[];
  if (!badges.length) return null;
  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-md flex-col divide-y divide-neutral-200 border-y border-neutral-200">
        {badges.map((badge, i) => {
          const Icon = ICONS[badge.icon] ?? Shield;
          return (
            <div key={i} className="flex items-center gap-3 py-3">
              <Icon size={17} className="shrink-0 text-yellow-700" />
              <p className="text-sm font-medium text-neutral-900">
                {badge.label}
                {badge.value ? <span className="ml-1.5 text-neutral-500">— {badge.value}</span> : null}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
