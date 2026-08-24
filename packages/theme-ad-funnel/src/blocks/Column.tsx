import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ICON_FIELD_OPTIONS } from '@zetsite/theme-kit';

export interface ColumnSettings {
  mediaType: 'image' | 'icon';
  imageUrl: string;
  iconName: string;
  heading: string;
  text: string;
  linkUrl: string;
}

export const columnSchema: SectionSchema = {
  type: 'column',
  label: 'Column',
  fields: [
    {
      key: 'mediaType',
      type: 'select',
      label: 'Media type',
      default: 'icon',
      tab: 'content',
      options: [
        { label: 'Icon', value: 'icon' },
        { label: 'Image', value: 'image' },
      ],
    },
    { key: 'iconName', type: 'select', label: 'Icon', default: 'truck', tab: 'content', options: ICON_FIELD_OPTIONS },
    { key: 'imageUrl', type: 'image', label: 'Image', default: '', tab: 'content' },
    { key: 'heading', type: 'text', label: 'Heading', default: 'Feature', tab: 'content' },
    { key: 'text', type: 'richtext', label: 'Text', default: '', tab: 'content' },
    { key: 'linkUrl', type: 'url', label: 'Link (optional)', default: '', tab: 'content' },
  ],
  defaultSettings: { mediaType: 'icon', imageUrl: '', iconName: 'truck', heading: 'Feature', text: '', linkUrl: '' },
};

// Rendered by MultiColumn (needs the full block list for grid layout).
export function Column(_props: SectionComponentProps<ColumnSettings>) {
  return null;
}
