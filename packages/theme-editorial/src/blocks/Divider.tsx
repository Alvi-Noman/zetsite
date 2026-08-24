import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface DividerSettings {
  color: string;
}

export const dividerSchema: SectionSchema = {
  type: 'divider',
  label: 'Divider',
  fields: [{ key: 'color', type: 'color', label: 'Line color', default: '#e5e5e5', tab: 'style' }],
  defaultSettings: { color: '#e5e5e5' },
};

export function Divider({ settings }: SectionComponentProps<DividerSettings>) {
  return <hr className="my-2 border-t" style={{ borderColor: settings.color }} />;
}
