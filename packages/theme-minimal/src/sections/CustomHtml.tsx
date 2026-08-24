import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface CustomHtmlSettings {
  html: string;
}

export const customHtmlSchema: SectionSchema = {
  type: 'customHtml',
  label: 'Custom HTML',
  fields: [{ key: 'html', type: 'richtext', label: 'HTML', default: '', tab: 'advanced' }],
  defaultSettings: { html: '' },
};

export function CustomHtml({ settings }: SectionComponentProps<CustomHtmlSettings>) {
  if (!settings.html) {
    return <div className="px-6 py-8 text-center text-sm text-neutral-400">Add custom HTML in the settings panel</div>;
  }
  return <div dangerouslySetInnerHTML={{ __html: settings.html }} />;
}
