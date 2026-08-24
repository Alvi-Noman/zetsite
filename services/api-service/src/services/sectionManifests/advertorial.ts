// Hand-authored section vocabulary for the `advertorial` theme, fed into the
// AI structural generator's prompt (services/aiSectionGenerator.ts). This is
// NOT a runtime validator — buildSectionsField (utils/sectionValidation.ts)
// and aiSectionGenerator's own type-whitelist check are what actually
// enforce shape/safety. This file only needs to be "close enough" to guide
// a good prompt.
//
// MUST BE KEPT IN SYNC BY HAND with packages/theme-advertorial/src/theme.ts
// and its src/sections/*.tsx SectionSchemas — same discipline as the
// ORDER_WEIGHT comment in nativeLandingPageBuilder.ts. If a section's field
// list changes there, update the matching entry here.
//
// `orderForm` is included even though, as of this writing, it may not yet be
// registered in theme-advertorial/src/theme.ts (it's landing in a parallel
// change) — it's part of the intended final section vocabulary for this
// theme regardless of merge order.

export interface ManifestField {
  key: string;
  type: string;
  description: string;
}

export interface SectionManifestEntry {
  type: string;
  label: string;
  /** One-line guidance for the AI on when/how to use this section in a single-product page. */
  guidance: string;
  settingsFields: ManifestField[];
  allowedBlockTypes?: string[];
  blockFields?: Record<string, ManifestField[]>;
}

export const ADVERTORIAL_SECTION_MANIFEST: SectionManifestEntry[] = [
  {
    type: 'header',
    label: 'Header',
    guidance: 'Structural — always include exactly once, always first.',
    settingsFields: [
      { key: 'storeName', type: 'text', description: 'Store/brand name shown top-left' },
      { key: 'tagline', type: 'text', description: 'Optional short tagline next to the store name' },
    ],
    allowedBlockTypes: ['logo', 'menu'],
    blockFields: {
      menu: [{ key: 'items', type: 'list', description: 'List of {label, url} nav links' }],
    },
  },
  {
    type: 'hero',
    label: 'Hero banner',
    guidance: 'The main headline and hook — always first section after the header.',
    settingsFields: [
      { key: 'imageUrl', type: 'image', description: 'Background image URL (leave blank if none implied)' },
      { key: 'overlayOpacity', type: 'number', description: 'Dark overlay opacity 0-1 over the background image' },
      { key: 'textAlign', type: 'select', description: 'left | center | right' },
      { key: 'height', type: 'select', description: 'small | medium | large' },
    ],
    allowedBlockTypes: ['heading', 'text', 'button'],
    blockFields: {
      heading: [
        { key: 'text', type: 'text', description: 'Punchy headline, ideally under 10 words' },
        { key: 'size', type: 'select', description: 'sm | md | lg' },
      ],
      text: [{ key: 'content', type: 'text', description: 'One-sentence subheading' }],
      button: [
        { key: 'text', type: 'text', description: 'CTA button text, e.g. "Shop now"' },
        { key: 'url', type: 'url', description: 'Link target, e.g. "#order" to jump to the order form' },
      ],
    },
  },
  {
    type: 'heroSlideshow',
    label: 'Hero slideshow',
    guidance: 'Alternative to hero when multiple lead images are implied — use instead of, not in addition to, hero.',
    settingsFields: [
      { key: 'intervalSeconds', type: 'number', description: 'Seconds between auto-advancing slides' },
      { key: 'transition', type: 'select', description: 'slide | fade' },
      { key: 'height', type: 'select', description: 'small | medium | large' },
    ],
    allowedBlockTypes: ['slide'],
    blockFields: {
      slide: [
        { key: 'imageUrl', type: 'image', description: 'Slide background image' },
        { key: 'heading', type: 'text', description: 'Slide headline' },
        { key: 'subheading', type: 'text', description: 'Slide subheading' },
        { key: 'buttonText', type: 'text', description: 'Slide CTA text' },
        { key: 'buttonUrl', type: 'url', description: 'Slide CTA link' },
      ],
    },
  },
  {
    type: 'heroVideo',
    label: 'Video hero',
    guidance: 'Alternative to hero only when the description implies a demo/explainer video should lead the page.',
    settingsFields: [
      { key: 'videoUrl', type: 'url', description: 'Direct mp4 video URL' },
      { key: 'posterUrl', type: 'image', description: 'Poster image shown before playback' },
      { key: 'overlayOpacity', type: 'number', description: 'Dark overlay opacity 0-1' },
    ],
    allowedBlockTypes: ['heading', 'text', 'button'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Headline over the video' }],
      text: [{ key: 'content', type: 'text', description: 'Supporting sentence' }],
      button: [
        { key: 'text', type: 'text', description: 'CTA text' },
        { key: 'url', type: 'url', description: 'CTA link' },
      ],
    },
  },
  {
    type: 'featuredCollection',
    label: 'Featured collection',
    guidance: 'Cross-sell related products — only include if the description implies a broader catalog, not a single isolated product.',
    settingsFields: [
      { key: 'collectionHandle', type: 'text', description: 'Collection handle to pull products from (leave blank to show recent products)' },
      { key: 'limit', type: 'number', description: 'Max products to show' },
      { key: 'columns', type: 'select', description: '2 | 3 | 4' },
    ],
    allowedBlockTypes: ['collectionTitle', 'button'],
    blockFields: {
      collectionTitle: [{ key: 'fallbackText', type: 'text', description: 'Heading shown above the grid' }],
    },
  },
  {
    type: 'collectionList',
    label: 'Collection list',
    guidance: 'Category browse grid — rarely useful on a single-product advertorial page, omit unless explicitly implied.',
    settingsFields: [{ key: 'columns', type: 'select', description: '2 | 3 | 4' }],
    allowedBlockTypes: ['heading'],
    blockFields: { heading: [{ key: 'text', type: 'text', description: 'Section heading' }] },
  },
  {
    type: 'multiColumn',
    label: 'Multi-column (features/benefits)',
    guidance: 'Benefit/feature icon grid ("Why choose us") — place mid-page after the hook to build desire.',
    settingsFields: [
      { key: 'columns', type: 'number', description: 'Number of columns, typically 3' },
      { key: 'buttonText', type: 'text', description: 'Optional CTA button text below the grid' },
      { key: 'buttonUrl', type: 'url', description: 'Optional CTA button link' },
    ],
    allowedBlockTypes: ['heading', 'column'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading, e.g. "Why choose us"' }],
      column: [
        { key: 'iconName', type: 'select', description: 'Icon name for this feature' },
        { key: 'heading', type: 'text', description: 'Short feature title' },
        { key: 'text', type: 'text', description: 'One-sentence feature description' },
      ],
    },
  },
  {
    type: 'richText',
    label: 'Rich text / image',
    guidance: 'Product story / "about this product" narrative section, mid-page. Never invent facts not present in the description.',
    settingsFields: [
      { key: 'eyebrow', type: 'text', description: 'Small label shown above the heading' },
      { key: 'imagePosition', type: 'select', description: 'left | right | none' },
    ],
    allowedBlockTypes: ['heading', 'text', 'image'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading' }],
      text: [{ key: 'content', type: 'text', description: 'Body paragraph(s), plain text or simple HTML' }],
      image: [{ key: 'url', type: 'image', description: 'Supporting image URL' }],
    },
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    guidance: 'Customer quotes/social proof — place after the product is explained, before FAQ.',
    settingsFields: [],
    allowedBlockTypes: ['heading', 'testimonial'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading, e.g. "What our customers say"' }],
      testimonial: [
        { key: 'quote', type: 'text', description: 'Customer quote' },
        { key: 'author', type: 'text', description: 'Customer name' },
        { key: 'rating', type: 'number', description: 'Star rating 1-5' },
      ],
    },
  },
  {
    type: 'faq',
    label: 'FAQ',
    guidance: 'Address common objections (shipping, returns, fit, COD) — place late, just before the order form.',
    settingsFields: [{ key: 'allowMultipleOpen', type: 'boolean', description: 'Whether multiple questions can be open at once' }],
    allowedBlockTypes: ['heading', 'faqItem'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading' }],
      faqItem: [
        { key: 'question', type: 'text', description: 'Question text' },
        { key: 'answer', type: 'text', description: 'Answer text — only state facts implied by the description, otherwise keep it generic/editable' },
      ],
    },
  },
  {
    type: 'announcementBar',
    label: 'Announcement bar',
    guidance: 'Thin top strip for a short promo line (e.g. free shipping) — optional, place first if used, above the header only conceptually (still ordered after header in the list).',
    settingsFields: [
      { key: 'backgroundColor', type: 'color', description: 'Background color' },
      { key: 'textColor', type: 'color', description: 'Text color' },
    ],
    allowedBlockTypes: ['announcement'],
    blockFields: {
      announcement: [
        { key: 'text', type: 'text', description: 'Announcement message' },
        { key: 'url', type: 'url', description: 'Optional link' },
      ],
    },
  },
  {
    type: 'newsletter',
    label: 'Email signup',
    guidance: 'Email capture — rarely needed on a direct-response single-product page, omit unless the description mentions a mailing list/waitlist.',
    settingsFields: [{ key: 'buttonText', type: 'text', description: 'Subscribe button text' }],
    allowedBlockTypes: ['heading', 'text'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading' }],
      text: [{ key: 'content', type: 'text', description: 'Short supporting line' }],
    },
  },
  {
    type: 'countdownBanner',
    label: 'Countdown / urgency + price',
    guidance:
      'Urgency and price-drop callout — place early (right after hero) for a high-converting page. Can include priceText/originalPriceText/discountBadgeText for a price-drop banner alongside or instead of a real countdown timer.',
    settingsFields: [
      { key: 'targetDate', type: 'text', description: 'ISO date/time the countdown ends (leave blank to skip the timer and only show price)' },
      { key: 'priceText', type: 'text', description: 'Current price, e.g. "৳2,490" (only if a price is implied by the description)' },
      { key: 'originalPriceText', type: 'text', description: 'Original/strikethrough price (optional)' },
      { key: 'discountBadgeText', type: 'text', description: 'Short discount badge, e.g. "50% OFF" (optional)' },
    ],
    allowedBlockTypes: ['heading'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Urgency line, e.g. "Limited-time offer"' }],
    },
  },
  {
    type: 'logoBar',
    label: 'Logo bar',
    guidance: '"As seen in" press/partner logo row — only include if the description mentions press mentions or partner brands.',
    settingsFields: [{ key: 'grayscale', type: 'boolean', description: 'Show logos in grayscale' }],
    allowedBlockTypes: ['heading', 'logoImage'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading, e.g. "As seen in"' }],
      logoImage: [{ key: 'imageUrl', type: 'image', description: 'Logo image URL' }],
    },
  },
  {
    type: 'videoBlock',
    label: 'Video',
    guidance: 'Standalone embedded demo/explainer video mid-page — only if a video is implied.',
    settingsFields: [
      { key: 'videoUrl', type: 'url', description: 'Video URL (mp4, YouTube, or Vimeo)' },
      { key: 'displayMode', type: 'select', description: 'inline | lightbox' },
    ],
    allowedBlockTypes: ['heading'],
    blockFields: { heading: [{ key: 'text', type: 'text', description: 'Section heading' }] },
  },
  {
    type: 'gallery',
    label: 'Image gallery',
    guidance: 'Product photo grid — include when multiple product images/angles are implied.',
    settingsFields: [
      { key: 'columns', type: 'select', description: '2 | 3 | 4' },
      { key: 'layout', type: 'select', description: 'grid | masonry' },
    ],
    allowedBlockTypes: ['heading', 'galleryImage'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading' }],
      galleryImage: [
        { key: 'imageUrl', type: 'image', description: 'Image URL' },
        { key: 'caption', type: 'text', description: 'Optional caption' },
      ],
    },
  },
  {
    type: 'beforeAfter',
    label: 'Before / after',
    guidance: 'Draggable before/after image comparison — only use for transformation-style products (skincare, cleaning, fitness, etc.) implied by the description.',
    settingsFields: [
      { key: 'beforeImageUrl', type: 'image', description: 'Before image URL' },
      { key: 'afterImageUrl', type: 'image', description: 'After image URL' },
      { key: 'beforeLabel', type: 'text', description: 'Label for the before image' },
      { key: 'afterLabel', type: 'text', description: 'Label for the after image' },
    ],
    allowedBlockTypes: ['heading'],
    blockFields: { heading: [{ key: 'text', type: 'text', description: 'Section heading' }] },
  },
  {
    type: 'comparisonTable',
    label: 'Comparison table',
    guidance: 'Tiered pricing/plan comparison — only use if the description implies multiple purchase tiers/bundles (e.g. buy 1 / buy 2 / buy 3).',
    settingsFields: [{ key: 'highlightBadgeText', type: 'text', description: 'Badge text on the highlighted/recommended plan' }],
    allowedBlockTypes: ['heading', 'plan'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading' }],
      plan: [
        { key: 'name', type: 'text', description: 'Plan/tier name' },
        { key: 'price', type: 'text', description: 'Plan price text' },
        { key: 'featuresText', type: 'text', description: 'Features, one per line' },
        { key: 'highlighted', type: 'boolean', description: 'Whether this tier is the highlighted/recommended one' },
      ],
    },
  },
  {
    type: 'customHtml',
    label: 'Custom HTML',
    guidance: 'Raw HTML escape hatch — never generate this; only a merchant would hand-author it.',
    settingsFields: [],
  },
  {
    type: 'socialProofBar',
    label: 'Social proof bar',
    guidance: 'Rotating "N people just bought this" strip — optional urgency element, place near the top or as a floating notification.',
    settingsFields: [{ key: 'displayStyle', type: 'select', description: 'bar | floating' }],
    allowedBlockTypes: ['proofMessage'],
    blockFields: { proofMessage: [{ key: 'message', type: 'text', description: 'Proof message text' }] },
  },
  {
    type: 'contactForm',
    label: 'Contact form',
    guidance: 'General inquiry form — only include if the order form is not the appropriate closer (e.g. a "have questions" section), otherwise prefer orderForm as the closer.',
    settingsFields: [{ key: 'submitButtonText', type: 'text', description: 'Submit button text' }],
    allowedBlockTypes: ['heading', 'formField'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading' }],
      formField: [
        { key: 'label', type: 'text', description: 'Field label' },
        { key: 'fieldType', type: 'select', description: 'text | email | textarea' },
      ],
    },
  },
  {
    type: 'trustBadges',
    label: 'Trust badges',
    guidance: 'Row of warranty/returns/COD/delivery pills — place early-to-mid page, right after the hero or countdown banner, to reduce purchase anxiety.',
    settingsFields: [{ key: 'backgroundColor', type: 'color', description: 'Background color' }],
    allowedBlockTypes: ['trustBadge'],
    blockFields: {
      trustBadge: [
        { key: 'icon', type: 'select', description: 'shield | refresh | truck | creditCard | check' },
        { key: 'label', type: 'text', description: 'Badge label, e.g. "1 year warranty"' },
        { key: 'value', type: 'text', description: 'Optional secondary line, e.g. "7-day exchange"' },
      ],
    },
  },
  {
    type: 'productSpecs',
    label: 'Product specs',
    guidance: 'Key/value spec table (material, dimensions, warranty, etc.) — place mid-page, only fill values genuinely implied by the description.',
    settingsFields: [],
    allowedBlockTypes: ['heading', 'specRow'],
    blockFields: {
      heading: [{ key: 'text', type: 'text', description: 'Section heading, e.g. "Specifications"' }],
      specRow: [
        { key: 'label', type: 'text', description: 'Spec label, e.g. "Material"' },
        { key: 'value', type: 'text', description: 'Spec value' },
      ],
    },
  },
  {
    type: 'stickyBuyBar',
    label: 'Sticky buy bar',
    guidance: 'Persistent bottom mobile bar with price + CTA — include once, its exact position in the list does not matter (it renders fixed), but conceptually place near the order form.',
    settingsFields: [
      { key: 'priceText', type: 'text', description: 'Price shown in the bar' },
      { key: 'originalPriceText', type: 'text', description: 'Optional strikethrough original price' },
      { key: 'buttonText', type: 'text', description: 'CTA button text, e.g. "Order now"' },
      { key: 'buttonUrl', type: 'url', description: 'CTA link — usually "#order" to jump to the order form' },
    ],
  },
  {
    type: 'orderForm',
    label: 'Order form (embedded checkout)',
    guidance:
      'Embedded COD checkout — name/phone/address/quantity plus an order summary. Place near the end, after the reader is convinced (after trust/FAQ, before footer). Requires a bound productId to compute price/stock; if no real product is bound, still include the section with reasonable defaults, it will be linked to a product later.',
    settingsFields: [
      { key: 'productId', type: 'text', description: 'Bound product ID (leave blank — set later by the merchant when linking a product)' },
      { key: 'currency', type: 'text', description: 'Currency label, e.g. "৳" or "$"' },
      { key: 'submitButtonText', type: 'text', description: 'Submit button text, e.g. "Place order"' },
      { key: 'codLabel', type: 'text', description: 'Cash-on-delivery label/note' },
    ],
    allowedBlockTypes: ['heading'],
    blockFields: { heading: [{ key: 'text', type: 'text', description: 'Section heading, e.g. "Complete your order"' }] },
  },
  {
    type: 'footer',
    label: 'Footer',
    guidance: 'Structural — always include exactly once, always last.',
    settingsFields: [
      { key: 'text', type: 'text', description: 'Optional footer text' },
      { key: 'showYear', type: 'boolean', description: 'Whether to show the current year in the copyright line' },
    ],
    allowedBlockTypes: ['copyright', 'policyLinks', 'socialLinks'],
  },
];

export const ADVERTORIAL_SECTION_TYPES: ReadonlySet<string> = new Set(
  ADVERTORIAL_SECTION_MANIFEST.map((s) => s.type),
);
