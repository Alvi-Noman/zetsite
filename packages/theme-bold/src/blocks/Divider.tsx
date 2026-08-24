import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface DividerSettings {
  color: string;
}

export const dividerSchema: SectionSchema = {
  type: 'divider',
  label: 'Divider',
  fields: [{ key: 'color', type: 'color', label: 'Line color', default: '#000000', tab: 'style' }],
  defaultSettings: { color: '#000000' },
};

export function Divider({ settings }: SectionComponentProps<DividerSettings>) {
  return <hr className="my-2 border-t" style={{ borderColor: settings.color }} />;
}
