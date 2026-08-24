import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface AnnouncementSettings {
  text: string;
  url: string;
}

export const announcementSchema: SectionSchema = {
  type: 'announcement',
  label: 'Announcement',
  fields: [
    { key: 'text', type: 'text', label: 'Message', default: 'Free shipping on orders over $50', tab: 'content' },
    { key: 'url', type: 'url', label: 'Link (optional)', default: '', tab: 'content' },
  ],
  defaultSettings: { text: 'Free shipping on orders over $50', url: '' },
};

// Rendered by the AnnouncementBar section (rotates through the full list).
export function Announcement(_props: SectionComponentProps<AnnouncementSettings>) {
  return null;
}
