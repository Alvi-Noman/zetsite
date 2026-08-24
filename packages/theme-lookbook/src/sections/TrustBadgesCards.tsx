import { Check, CreditCard, RefreshCw, Shield, Truck } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { TrustBadgeIcon, TrustBadgeSettings } from '../blocks/TrustBadge.js';

export interface TrustBadgesCardsSettings {}

export const trustBadgesCardsSchema: SectionSchema = {
  type: 'trustBadgesCards',
  label: 'Trust badges (guarantee cards)',
  allowedBlockTypes: ['trustBadge'],
  defaultBlocks: [
    { type: 'trustBadge', settings: { icon: 'shield', label: '1 year warranty', value: 'Full replacement if anything goes wrong.' } },
    { type: 'trustBadge', settings: { icon: 'refresh', label: 'Easy returns', value: '7-day exchange, no questions asked.' } },
    { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: 'Arrives in 2-3 business days.' } },
  ],
  fields: [],
  defaultSettings: {},
};

const ICONS: Record<TrustBadgeIcon, typeof Shield> = { shield: Shield, refresh: RefreshCw, truck: Truck, creditCard: CreditCard, check: Check };

export function TrustBadgesCards({ blocks }: SectionComponentProps<TrustBadgesCardsSettings>) {
  const badges = (blocks?.length ? blocks.map((b) => b.settings as unknown as TrustBadgeSettings) : []) as TrustBadgeSettings[];
  if (!badges.length) return null;
  return (
    <div className="px-4 py-9">
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {badges.map((badge, i) => {
          const Icon = ICONS[badge.icon] ?? Shield;
          return (
            <div key={i} className="rounded-lg border border-neutral-200 p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-700 text-white">
                <Icon size={18} strokeWidth={2} />
              </span>
              <p className="text-sm font-bold text-neutral-900">{badge.label}</p>
              {badge.value ? <p className="mt-1 text-xs leading-relaxed text-neutral-500">{badge.value}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
