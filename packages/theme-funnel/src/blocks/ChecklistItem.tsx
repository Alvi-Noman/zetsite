import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface ChecklistItemSettings {
  title: string;
  description: string;
}

export const checklistItemSchema: SectionSchema = {
  type: 'checklistItem',
  label: 'Checklist item',
  fields: [
    { key: 'title', type: 'text', label: 'Title', default: 'Feature title', tab: 'content' },
    { key: 'description', type: 'text', label: 'Description', default: 'Short supporting detail.', tab: 'content' },
  ],
  defaultSettings: { title: 'Feature title', description: 'Short supporting detail.' },
};

// Rendered by the ChecklistFeatures section (needs the full list to lay out the stack).
export function ChecklistItem(_props: SectionComponentProps<ChecklistItemSettings>) {
  return null;
}
