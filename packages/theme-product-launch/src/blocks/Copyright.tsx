import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface CopyrightSettings {
  text: string;
  showYear: boolean;
}

export const copyrightSchema: SectionSchema = {
  type: 'copyright',
  label: 'Copyright',
  fields: [
    { key: 'text', type: 'text', label: 'Text', default: 'My Store. All rights reserved.', tab: 'content' },
    { key: 'showYear', type: 'boolean', label: 'Show current year', default: true, tab: 'content' },
  ],
  defaultSettings: { text: 'My Store. All rights reserved.', showYear: true },
};

export function Copyright({ settings }: SectionComponentProps<CopyrightSettings>) {
  const year = new Date().getFullYear();
  return (
    <p className="text-xs text-neutral-500">
      {settings.showYear ? `© ${year} ` : ''}
      {settings.text}
    </p>
  );
}
