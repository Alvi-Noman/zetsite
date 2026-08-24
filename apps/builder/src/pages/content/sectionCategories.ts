// Groups section types for the "Add section" library, mirroring how
// Shopify/Elementor/PageFly organize their section pickers (Banners,
// Products, Content, Social proof, Marketing) rather than one flat list.
export const SECTION_CATEGORIES: { label: string; types: string[] }[] = [
  { label: 'Banners', types: ['hero', 'heroSlideshow', 'heroVideo', 'announcementBar'] },
  { label: 'Products', types: ['featuredCollection', 'collectionList', 'productSpecs', 'variantSwatches'] },
  { label: 'Content', types: ['richText', 'multiColumn', 'gallery', 'videoBlock', 'beforeAfter', 'customHtml'] },
  { label: 'Social proof', types: ['testimonials', 'faq', 'logoBar', 'socialProofBar', 'comparisonTable', 'ratingBadge', 'trustBadges'] },
  { label: 'Conversion', types: ['problemSolution', 'howItWorks', 'finalCta', 'orderForm'] },
  { label: 'Marketing', types: ['newsletter', 'countdownBanner', 'contactForm'] },
];

export function categoryForType(type: string): string {
  return SECTION_CATEGORIES.find((c) => c.types.includes(type))?.label ?? 'Other';
}
