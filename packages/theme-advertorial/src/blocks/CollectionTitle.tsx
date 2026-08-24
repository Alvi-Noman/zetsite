import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface CollectionTitleSettings {
  fallbackText: string;
}

export const collectionTitleSchema: SectionSchema = {
  type: 'collectionTitle',
  label: 'Collection title',
  fields: [
    { key: 'fallbackText', type: 'text', label: 'Text when no collection is chosen', default: 'Featured products', tab: 'content' },
  ],
  defaultSettings: { fallbackText: 'Featured products' },
};

// Dynamic — rendered by FeaturedCollection using the real fetched collection
// name, not free text. This component only exists to hold the schema.
export function CollectionTitle(_props: SectionComponentProps<CollectionTitleSettings>) {
  return null;
}
