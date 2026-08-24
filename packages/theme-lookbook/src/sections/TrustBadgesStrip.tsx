import { Check, CreditCard, RefreshCw, Shield, Truck } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { TrustBadgeIcon, TrustBadgeSettings } from '../blocks/TrustBadge.js';

export interface TrustBadgesStripSettings {
  backgroundColor: string;
}

export const trustBadgesStripSchema: SectionSchema = {
  type: 'trustBadgesStrip',
  label: 'Trust badges (divided strip)',
  allowedBlockTypes: ['trustBadge'],
  defaultBlocks: [
    { type: 'trustBadge', settings: { icon: 'shield', label: '1 year warranty', value: '' } },
    { type: 'trustBadge', settings: { icon: 'refresh', label: 'Easy returns', value: '' } },
    { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '' } },
    { type: 'trustBadge', settings: { icon: 'creditCard', label: 'Cash on delivery', value: '' } },
  ],
  fields: [{ key: 'backgroundColor', type: 'color', label: 'Background color', default: '#1C1917', tab: 'style' }],
  defaultSettings: { backgroundColor: '#1C1917' },
};

const ICONS: Record<TrustBadgeIcon, typeof Shield> = { shield: Shield, refresh: RefreshCw, truck: Truck, creditCard: CreditCard, check: Check };

export function TrustBadgesStrip({ settings, blocks }: SectionComponentProps<TrustBadgesStripSettings>) {
  const badges = (blocks?.length ? blocks.map((b) => b.settings as unknown as TrustBadgeSettings) : []) as TrustBadgeSettings[];
  if (!badges.length) return null;
  return (
    <div className="px-4 py-5" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center divide-x divide-white/15">
        {badges.map((badge, i) => {
          const Icon = ICONS[badge.icon] ?? Shield;
          return (
            <div key={i} className="flex items-center gap-2 px-4 py-1 text-white first:pl-0 last:pr-0">
              <Icon size={15} className="shrink-0 text-yellow-500" />
              <span className="text-xs font-medium">{badge.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
