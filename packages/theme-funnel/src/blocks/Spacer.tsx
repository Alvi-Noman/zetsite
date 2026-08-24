import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface SpacerSettings {
  height: number;
}

export const spacerSchema: SectionSchema = {
  type: 'spacer',
  label: 'Spacer',
  fields: [{ key: 'height', type: 'number', label: 'Height (px)', default: 24, tab: 'style' }],
  defaultSettings: { height: 24 },
};

export function Spacer({ settings }: SectionComponentProps<SpacerSettings>) {
  return <div style={{ height: settings.height ?? 24 }} />;
}
