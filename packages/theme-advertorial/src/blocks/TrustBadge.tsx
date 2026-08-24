import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export type TrustBadgeIcon = 'shield' | 'refresh' | 'truck' | 'creditCard' | 'check';

export interface TrustBadgeSettings {
  icon: TrustBadgeIcon;
  label: string;
  value: string;
}

export const trustBadgeSchema: SectionSchema = {
  type: 'trustBadge',
  label: 'Trust badge',
  fields: [
    {
      key: 'icon',
      type: 'select',
      label: 'Icon',
      default: 'shield',
      tab: 'content',
      options: [
        { label: 'Shield (warranty)', value: 'shield' },
        { label: 'Refresh (returns)', value: 'refresh' },
        { label: 'Truck (delivery)', value: 'truck' },
        { label: 'Credit card (payment)', value: 'creditCard' },
        { label: 'Check (guarantee)', value: 'check' },
      ],
    },
    { key: 'label', type: 'text', label: 'Label', default: '1 year warranty', tab: 'content' },
    { key: 'value', type: 'text', label: 'Secondary line (optional)', default: '', tab: 'content' },
  ],
  defaultSettings: { icon: 'shield', label: '1 year warranty', value: '' },
};

// Rendered by the TrustBadges section (needs the full list to lay out the row).
export function TrustBadge(_props: SectionComponentProps<TrustBadgeSettings>) {
  return null;
}
