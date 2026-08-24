// Groups block types for the "Add block" picker, mirroring Shopify's real
// block palette (trimmed to what this app can actually back with data).
export const BLOCK_CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'General', types: ['heading', 'text', 'button', 'image', 'video'] },
  { label: 'Layout', types: ['divider', 'spacer'] },
  { label: 'Collection', types: ['collectionTitle'] },
  { label: 'Header', types: ['logo', 'menu'] },
  { label: 'Footer', types: ['copyright', 'policyLinks', 'socialLinks'] },
  { label: 'Content lists', types: ['slide', 'column', 'testimonial', 'faqItem', 'announcement', 'logoImage', 'galleryImage', 'plan', 'proofMessage', 'formField'] },
];

export function categoryForBlockType(type: string): string {
  return BLOCK_CATEGORIES.find((c) => c.types.includes(type))?.label ?? 'Other';
}
