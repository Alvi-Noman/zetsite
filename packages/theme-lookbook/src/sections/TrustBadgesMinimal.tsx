import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { TrustBadgeSettings } from '../blocks/TrustBadge.js';

export interface TrustBadgesMinimalSettings {}

export const trustBadgesMinimalSchema: SectionSchema = {
  type: 'trustBadgesMinimal',
  label: 'Trust badges (minimal text row)',
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

export function TrustBadgesMinimal({ blocks }: SectionComponentProps<TrustBadgesMinimalSettings>) {
  const badges = (blocks?.length ? blocks.map((b) => b.settings as unknown as TrustBadgeSettings) : []) as TrustBadgeSettings[];
  if (!badges.length) return null;
  return (
    <div className="px-4 py-6 text-center">
      <p className="mx-auto max-w-2xl text-xs font-medium uppercase tracking-wide text-neutral-500">
        {badges.map((badge, i) => (
          <span key={i}>
            {badge.label}
            {i < badges.length - 1 ? <span className="mx-2.5 text-neutral-300">·</span> : null}
          </span>
        ))}
      </p>
    </div>
  );
}
