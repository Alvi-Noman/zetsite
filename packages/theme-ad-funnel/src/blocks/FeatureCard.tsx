import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export type FeatureCardIcon = 'shield' | 'gem' | 'zap' | 'camera' | 'heart' | 'star';
export type FeatureCardColor = 'green' | 'blue' | 'orange' | 'purple';

export interface FeatureCardSettings {
  icon: FeatureCardIcon;
  title: string;
  subtitle: string;
  color: FeatureCardColor;
}

export const featureCardSchema: SectionSchema = {
  type: 'featureCard',
  label: 'Feature card',
  fields: [
    {
      key: 'icon',
      type: 'select',
      label: 'Icon',
      default: 'shield',
      tab: 'content',
      options: [
        { label: 'Shield (protection)', value: 'shield' },
        { label: 'Gem (premium)', value: 'gem' },
        { label: 'Zap (charging/power)', value: 'zap' },
        { label: 'Camera', value: 'camera' },
        { label: 'Heart', value: 'heart' },
        { label: 'Star', value: 'star' },
      ],
    },
    { key: 'title', type: 'text', label: 'Title', default: 'Maximum protection', tab: 'content' },
    { key: 'subtitle', type: 'text', label: 'Subtitle', default: 'Built to last', tab: 'content' },
    {
      key: 'color',
      type: 'select',
      label: 'Card color',
      default: 'green',
      tab: 'style',
      options: [
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' },
        { label: 'Orange', value: 'orange' },
        { label: 'Purple', value: 'purple' },
      ],
    },
  ],
  defaultSettings: { icon: 'shield', title: 'Maximum protection', subtitle: 'Built to last', color: 'green' },
};

// Rendered by the FeatureCards section (needs the full list to lay out the grid).
export function FeatureCard(_props: SectionComponentProps<FeatureCardSettings>) {
  return null;
}
