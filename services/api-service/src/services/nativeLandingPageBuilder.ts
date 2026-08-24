// Layer 1 of the landing-page generation pipeline: a deterministic mapper
// from a product record to a complete PageSection[] list, plus SEO defaults
// and a completeness checklist. No LLM — this always succeeds and is the
// guaranteed-good baseline the optional AI enhancement layer polishes text
// on top of, never structure. See the "Landing Pages" plan.
//
// Dispatches to a per-LandingPageThemeId "recipe" so a generated page uses
// that theme's actual distinctive sections (productHero/featureCards/
// checklistFeatures for order-funnel, trustBadges/productSpecs/orderForm for
// direct-response, etc.) instead of one generic layout for every theme.
// clean-minimal/bold-statement (theme-minimal/theme-bold) never registered
// those conversion-funnel sections, so they keep the original generic
// recipe. Recipes deliberately never hardcode colors on the sections they
// emit — omitting backgroundColor/textColor lets each section render with
// its theme package's own defaultSettings palette.

import type { GenerationStyle, LandingPageThemeId } from '@zetsite/shared';
import { DEFAULT_LANDING_PAGE_THEME_ID } from '@zetsite/shared/landingThemes';
import { extractDominantColor, isDarkColor, lighten } from './colorExtractor.js';

interface Media {
  url: string;
  type: string;
}

interface ProductVariant {
  label: string;
  values: string[];
  price?: number;
  available: number;
}

interface ProductLike {
  title: string;
  handle: string;
  description: string;
  media: Media[];
  price?: number;
  compareAtPrice?: number;
  variants: ProductVariant[];
  collections: string[];
}

export interface NativeSectionBlock {
  type: string;
  settings: Record<string, unknown>;
}

export interface NativeSection {
  type: string;
  settings: Record<string, unknown>;
  blocks?: NativeSectionBlock[];
}

export interface NativeSeo {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export interface NativeChecklistItem {
  key: string;
  label: string;
  passed: boolean;
}

export interface NativeBuildResult {
  sections: NativeSection[];
  omittedSections: string[];
  seo: NativeSeo;
  checklist: NativeChecklistItem[];
}

const ORDER_WEIGHT: Record<string, number> = {
  announcementBar: -1,
  hero: 0,
  heroSlideshow: 0,
  productHero: 0,
  ratingBadge: 0,
  shopHero: 0,
  countdownBanner: 1,
  trustBadges: 1,
  featureCards: 1,
  problemSolution: 1,
  gallery: 2,
  richText: 3,
  checklistFeatures: 3,
  howItWorks: 3,
  comparisonTable: 4,
  productSpecs: 4,
  variantSwatches: 4,
  featuredCollection: 5,
  multiColumn: 5,
  logoBar: 6,
  socialProofBar: 6,
  orderForm: 6,
  testimonials: 7,
  faq: 8,
  finalCta: 9,
  newsletter: 9,
  contactForm: 9,
  stickyBuyBar: 10,
  footer: 11,
};

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentence(plainText: string, maxLen = 140): string {
  const match = plainText.match(/^[^.!?]{1,}[.!?]/);
  const sentence = (match ? match[0] : plainText).trim();
  if (sentence.length <= maxLen) return sentence;
  return `${sentence.slice(0, maxLen - 1).trimEnd()}…`;
}

function images(product: ProductLike): string[] {
  return product.media.filter((m) => m.type === 'image').map((m) => m.url);
}

function looksLikeTieredVariants(variants: ProductVariant[]): boolean {
  if (variants.length < 2 || variants.length > 4) return false;
  const prices = variants.map((v) => v.price).filter((p): p is number => typeof p === 'number');
  if (prices.length !== variants.length) return false;
  return new Set(prices).size === prices.length;
}

/** Lowest positive stock count across variants, or null if not trackable/out of stock. */
function lowStockCount(product: ProductLike): number | null {
  const positive = product.variants.map((v) => v.available).filter((n) => typeof n === 'number' && n > 0);
  if (positive.length === 0) return null;
  const min = Math.min(...positive);
  return min <= 10 ? min : null;
}

/**
 * Orders an already-built section list by conversion best-practice (hero
 * first, urgency/proof mid-page, FAQ/contact last) — exported so a "fix
 * order" one-click editor action can re-run it on a manually-reordered page.
 */
export function lintSectionOrder(sections: NativeSection[]): { warnings: string[]; sorted: NativeSection[] } {
  const warnings: string[] = [];
  if (sections[0] && ORDER_WEIGHT[sections[0].type] !== 0) {
    warnings.push('Your page doesn’t start with a Hero section — visitors expect the main headline first.');
  }
  const last = sections[sections.length - 1];
  if (last && (ORDER_WEIGHT[last.type] ?? 5) < 8) {
    warnings.push('Consider ending with an FAQ or contact/signup section to close the page.');
  }
  const sorted = [...sections].sort((a, b) => (ORDER_WEIGHT[a.type] ?? 5) - (ORDER_WEIGHT[b.type] ?? 5));
  return { warnings, sorted };
}

export function buildChecklist(sections: NativeSection[], plainDescription = ''): NativeChecklistItem[] {
  const hasHero = sections.some((s) => s.type === 'hero' || s.type === 'heroSlideshow' || s.type === 'productHero' || s.type === 'shopHero');
  const hasCta = sections.some((s) => s.blocks?.some((b) => b.type === 'button'));
  const hasImage = sections.some(
    (s) => s.type === 'gallery' || ((s.type === 'hero' || s.type === 'productHero' || s.type === 'shopHero') && !!s.settings.imageUrl),
  );
  const count = sections.length;
  return [
    { key: 'hero', label: 'Has a hero section', passed: hasHero },
    { key: 'cta', label: 'Has a call-to-action button', passed: hasCta },
    { key: 'image', label: 'Has at least one product image', passed: hasImage },
    { key: 'description', label: 'Has real product description text', passed: plainDescription.length > 20 },
    { key: 'length', label: 'Reasonable length (3–9 sections)', passed: count >= 3 && count <= 9 },
  ];
}

// --- Shared section builders, reused across recipes -------------------------

function productSpecsSection(product: ProductLike): NativeSection | null {
  if (!product.variants.length) return null;
  return {
    type: 'productSpecs',
    settings: {},
    blocks: [
      { type: 'heading', settings: { text: 'Specifications', size: 'md' } },
      ...product.variants.map((v) => ({ type: 'specRow', settings: { label: v.label, value: v.values.join(', ') || '—' } })),
    ],
  };
}

// The one central checkout every "Buy now" button scrolls to (id="order").
// Only the product is set here — currency, shipping, and COD wording come
// from the store's global checkout settings (OrderForm.tsx fetches those
// itself), never from this section's own settings.
function orderFormSection(product: ProductLike): NativeSection {
  return {
    type: 'orderForm',
    settings: { productId: product.handle },
    blocks: [{ type: 'heading', settings: { text: 'Complete your order', size: 'md' } }],
  };
}

function genericTrustBadgesSection(): NativeSection {
  return {
    type: 'trustBadges',
    settings: {},
    blocks: [
      { type: 'trustBadge', settings: { icon: 'shield', label: 'Quality guaranteed', value: '' } },
      { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '' } },
      { type: 'trustBadge', settings: { icon: 'creditCard', label: 'Cash on delivery', value: 'Pay when it arrives' } },
    ],
  };
}

function genericTestimonialsSection(): NativeSection {
  return {
    type: 'testimonials',
    settings: {},
    blocks: [
      { type: 'heading', settings: { text: 'What our customers say', size: 'md' } },
      { type: 'testimonial', settings: { quote: 'Exactly what I was looking for — arrived quickly and works great.', author: 'Verified buyer', rating: 5 } },
      { type: 'testimonial', settings: { quote: 'Great quality for the price. Would order again.', author: 'Verified buyer', rating: 5 } },
    ],
  };
}

function genericFaqSection(product: ProductLike, plainDescription: string): NativeSection {
  return {
    type: 'faq',
    settings: { align: 'center', width: 'page', allowMultipleOpen: true, enableSchema: true },
    blocks: [
      { type: 'heading', settings: { text: 'Frequently asked questions', size: 'md' } },
      { type: 'faqItem', settings: { question: 'How long does shipping take?', answer: 'Edit this answer with your store’s real shipping timeframe.' } },
      { type: 'faqItem', settings: { question: 'What is your return policy?', answer: 'Edit this answer with your store’s real return policy.' } },
      {
        type: 'faqItem',
        settings: {
          question: `Is ${product.title} right for me?`,
          answer: plainDescription ? firstSentence(plainDescription, 200) : 'Edit this answer with more detail about who this product is for.',
        },
      },
    ],
  };
}

// --- Recipe context shared by the 3 theme-specific recipes -----------------

interface RecipeContext {
  product: ProductLike;
  style: GenerationStyle;
  productUrl: string;
  plainDescription: string;
  productImages: string[];
  stock: number | null;
}

// Mirrors theme-product-launch's full single-page structure: problem/solution,
// generic benefit columns, a 3-step walkthrough, and a closing CTA that links
// to the real product page rather than an embedded order form — this theme
// is landing-page-only and skips the COD order-form flow other themes use.
//
// Unlike every other recipe in this file, this one never omits a section for
// thin data — the whole point of theme-product-launch is a fixed 12-slot
// structure the user wants present every time, so gallery/pricing fall back
// to generic/single-item content instead of disappearing when a product has
// few images or no tiered variants.
function buildProductLaunchSections(ctx: RecipeContext): { sections: NativeSection[]; omittedSections: string[] } {
  const { product, plainDescription, productImages } = ctx;
  const sections: NativeSection[] = [];
  const omittedSections: string[] = [];

  // Same shopHero section Lookbook's opening hero uses — dominant product
  // image, name/tagline/price/CTA below it, instead of text overlaid on the image.
  const priceText = product.price != null ? `$${product.price.toFixed(2)}` : '';
  const compareAtPriceText =
    product.compareAtPrice != null && product.price != null && product.compareAtPrice > product.price
      ? `$${product.compareAtPrice.toFixed(2)}`
      : '';
  sections.push({
    type: 'shopHero',
    settings: {
      imageUrl: productImages[0] ?? '',
      productId: product.handle,
      price: priceText,
      compareAtPrice: compareAtPriceText,
      currency: '$',
      backgroundColor: '#FAF7F2',
    },
    blocks: [
      { type: 'heading', settings: { text: product.title, size: 'lg' } },
      ...(plainDescription ? [{ type: 'text', settings: { content: firstSentence(plainDescription, 110) } }] : []),
      { type: 'button', settings: { text: 'Buy now', url: '#order' } },
    ],
  });

  sections.push({ type: 'ratingBadge', settings: { rating: 4.8, reviewCount: 1200, label: 'from happy customers', align: 'center' } });

  sections.push({
    type: 'problemSolution',
    settings: {
      problemHeading: 'Sound familiar?',
      problemText: "You've tried the usual fixes. They're slow, expensive, or just don't hold up.",
      solutionHeading: 'There’s a better way',
      solutionText: plainDescription ? firstSentence(plainDescription, 160) : 'This solves it — without the usual trade-offs.',
    },
  });

  sections.push({
    type: 'multiColumn',
    settings: { columns: 3, align: 'center', width: 'page', gap: 32, imageShape: 'circle' },
    blocks: [
      { type: 'heading', settings: { text: 'Features & benefits', size: 'md' } },
      { type: 'column', settings: { mediaType: 'icon', iconName: 'zap', heading: 'Fast to get started', text: 'No steep learning curve — you get value from day one instead of losing time to setup.' } },
      { type: 'column', settings: { mediaType: 'icon', iconName: 'shield', heading: 'Built to last', text: 'Backed by a real guarantee, so quality isn’t a risk you’re taking on alone.' } },
      { type: 'column', settings: { mediaType: 'icon', iconName: 'truck', heading: 'Support when you need it', text: 'Real help when something comes up, not a bot loop that wastes your time.' } },
    ],
  });

  sections.push({
    type: 'howItWorks',
    settings: { heading: 'How it works', backgroundColor: '#FAF7F2' },
    blocks: [
      { type: 'step', settings: { title: 'Choose your option', description: 'Pick what fits — takes less than a minute.' } },
      { type: 'step', settings: { title: 'We take care of the rest', description: 'Fast, reliable delivery straight to you.' } },
      { type: 'step', settings: { title: 'Enjoy the results', description: 'Backed by real support if anything comes up.' } },
    ],
  });

  sections.push(genericTestimonialsSection());

  // Product showcase — always present, even with just the hero image or none
  // at all (empty, ready for the merchant to fill in) rather than omitted.
  const showcaseImages = productImages.length > 1 ? productImages.slice(1) : productImages;
  sections.push({
    type: 'gallery',
    settings: { align: 'center', width: 'page', gap: 16, columns: '3', imageAspect: 'landscape', enableLightbox: true },
    blocks: [
      { type: 'heading', settings: { text: 'See it in action', size: 'md' } },
      ...showcaseImages.slice(0, 6).map((url) => ({ type: 'galleryImage', settings: { imageUrl: url, caption: '' } })),
    ],
  });

  sections.push(genericFaqSection(product, plainDescription));

  sections.push({
    type: 'finalCta',
    settings: { backgroundColor: '#1C1917' },
    blocks: [
      { type: 'heading', settings: { text: 'Ready to get started?', size: 'lg' } },
      { type: 'text', settings: { content: "Join the customers already getting results. No risk — see for yourself." } },
      { type: 'button', settings: { text: 'Buy now', url: '#order' } },
    ],
  });

  sections.push(orderFormSection(product));

  sections.push({
    type: 'footer',
    settings: { text: `${product.title}. All rights reserved.`, showYear: true },
    blocks: [{ type: 'copyright', settings: {} }, { type: 'policyLinks', settings: {} }, { type: 'socialLinks', settings: {} }],
  });

  return { sections, omittedSections };
}

const SWATCH_COLOR_CYCLE = ['#111111', '#5C4433', '#C7C7C7', '#B08D57', '#7A8B7F', '#8C1F28'];

// Mirrors theme-lookbook's full visual-merchandising structure for watches/
// sunglasses/apparel-style products. Like theme-product-launch, this recipe
// never omits a slot for thin data — swatches/gallery/specs fall back to
// generic content instead of disappearing.
function buildLookbookSections(ctx: RecipeContext): { sections: NativeSection[]; omittedSections: string[] } {
  const { product, plainDescription, productImages } = ctx;
  const sections: NativeSection[] = [];
  const omittedSections: string[] = [];
  const priceText = product.price != null ? `$${product.price.toFixed(2)}` : '';
  const compareAtPriceText =
    product.compareAtPrice != null && product.price != null && product.compareAtPrice > product.price
      ? `$${product.compareAtPrice.toFixed(2)}`
      : '';

  // 1. Hero — dominant product image, name, tagline, price, CTA.
  sections.push({
    type: 'shopHero',
    settings: {
      imageUrl: productImages[0] ?? '',
      productId: product.handle,
      price: priceText,
      compareAtPrice: compareAtPriceText,
      currency: '$',
      backgroundColor: '#FAF7F2',
    },
    blocks: [
      { type: 'heading', settings: { text: product.title, size: 'lg' } },
      { type: 'text', settings: { content: plainDescription ? firstSentence(plainDescription) : 'Considered design, made to last.' } },
      { type: 'button', settings: { text: 'Buy now', url: '#order' } },
    ],
  });

  // 2. Product gallery — angles, zoom, in-use shots. Always present.
  const galleryImages = productImages.length > 1 ? productImages.slice(1) : productImages;
  sections.push({
    type: 'gallery',
    settings: { align: 'center', width: 'page', gap: 16, columns: '3', imageAspect: 'square', enableLightbox: true },
    blocks: [
      { type: 'heading', settings: { text: 'In detail', size: 'md' } },
      ...galleryImages.slice(0, 6).map((url) => ({ type: 'galleryImage', settings: { imageUrl: url, caption: '' } })),
    ],
  });

  // 3. Key features / specs — lead with these, they drive the decision.
  const specs = productSpecsSection(product);
  sections.push(
    specs ?? {
      type: 'productSpecs',
      settings: { width: 'page', backgroundColor: '#ffffff' },
      blocks: [
        { type: 'heading', settings: { text: 'Key features', size: 'md' } },
        { type: 'specRow', settings: { label: 'Material', value: 'Premium, considered materials' } },
        { type: 'specRow', settings: { label: 'Made for', value: 'Everyday wear' } },
      ],
    },
  );

  // 4. Materials & craftsmanship — justifies price, builds perceived value.
  sections.push({
    type: 'richText',
    settings: { imagePosition: productImages[1] ? 'left' : 'none', align: 'left', width: 'page', gap: 40, backgroundColor: '#FAF7F2' },
    blocks: [
      { type: 'heading', settings: { text: 'Materials & craftsmanship', size: 'md' } },
      { type: 'text', settings: { content: 'Every detail is chosen with intention — from the finish to the fasteners — so quality is felt, not just claimed.' } },
      ...(productImages[1] ? [{ type: 'image', settings: { url: productImages[1] } }] : []),
    ],
  });

  // 5. Variants / options — shown visually with swatches, derived from real
  // variant data when available.
  const variantValues = product.variants[0]?.values?.length ? product.variants[0].values : ['Black', 'Walnut', 'Silver', 'Gold'];
  sections.push({
    type: 'variantSwatches',
    settings: { heading: product.variants[0]?.label ? `Choose your ${product.variants[0].label.toLowerCase()}` : 'Choose your finish' },
    blocks: variantValues.slice(0, 6).map((label, i) => ({
      type: 'swatch',
      settings: { label, colorHex: SWATCH_COLOR_CYCLE[i % SWATCH_COLOR_CYCLE.length], imageUrl: '' },
    })),
  });

  // 6. Size / fit guide — always present.
  sections.push({
    type: 'productSpecs',
    settings: { width: 'page', backgroundColor: '#ffffff' },
    blocks: [
      { type: 'heading', settings: { text: 'Size & fit guide', size: 'md' } },
      { type: 'specRow', settings: { label: 'Small', value: 'See size chart for measurements' } },
      { type: 'specRow', settings: { label: 'Medium', value: 'See size chart for measurements' } },
      { type: 'specRow', settings: { label: 'Large', value: 'See size chart for measurements' } },
    ],
  });

  // 7. Lifestyle / brand story.
  sections.push({
    type: 'richText',
    settings: { imagePosition: 'right', align: 'left', width: 'page', gap: 40 },
    blocks: [
      { type: 'heading', settings: { text: 'Made for the everyday, built for anywhere', size: 'md' } },
      { type: 'text', settings: { content: 'Understated, versatile, and made to be worn — not stored away.' } },
    ],
  });

  // 8. Social proof — reviews with photos, ratings.
  sections.push(genericTestimonialsSection());

  // 9. Details / what's in the box.
  sections.push({
    type: 'productSpecs',
    settings: { width: 'page', backgroundColor: '#FAF7F2' },
    blocks: [
      { type: 'heading', settings: { text: "What's in the box", size: 'md' } },
      { type: 'specRow', settings: { label: 'Includes', value: `${product.title}, dust cloth, care card` } },
      { type: 'specRow', settings: { label: 'Packaging', value: 'Gift-ready box' } },
    ],
  });

  // 10. Guarantees & logistics — removes friction at the point of purchase.
  sections.push(genericTrustBadgesSection());

  // 11. Related / complete-the-look.
  sections.push({
    type: 'featuredCollection',
    settings: { limit: 4, columns: '4', columnsMobile: '2', align: 'center', width: 'page', gap: 24, imageAspect: 'square' },
    blocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Complete the look' } }],
  });

  // 12. Final CTA — closing product shot, price, buy button.
  sections.push({
    type: 'shopHero',
    settings: {
      imageUrl: productImages[0] ?? '',
      productId: product.handle,
      price: priceText,
      compareAtPrice: compareAtPriceText,
      currency: '$',
      backgroundColor: '#FAF7F2',
    },
    blocks: [
      { type: 'heading', settings: { text: 'Yours, today', size: 'md' } },
      { type: 'text', settings: { content: 'Free shipping. 30-day returns. Made to last.' } },
      { type: 'button', settings: { text: 'Buy now', url: '#order' } },
    ],
  });

  sections.push(orderFormSection(product));

  // 13. Footer.
  sections.push({
    type: 'footer',
    settings: { text: `${product.title}. All rights reserved.`, showYear: true },
    blocks: [{ type: 'copyright', settings: {} }, { type: 'policyLinks', settings: {} }, { type: 'socialLinks', settings: {} }],
  });

  return { sections, omittedSections };
}

function buildGenericStoreSections(ctx: RecipeContext, accentColor: string | null): { sections: NativeSection[]; omittedSections: string[] } {
  const { product, style, plainDescription, productImages, stock } = ctx;
  const omittedSections: string[] = [];
  const sections: NativeSection[] = [];

  // --- Hero -----------------------------------------------------------
  const heroBlocks: NativeSectionBlock[] = [
    { type: 'heading', settings: { text: product.title, size: 'lg' } },
    ...(plainDescription ? [{ type: 'text', settings: { content: firstSentence(plainDescription) } }] : []),
    { type: 'button', settings: { text: 'Shop now', url: ctx.productUrl } },
  ];
  sections.push({
    type: 'hero',
    settings: { imageUrl: productImages[0] ?? '', overlayOpacity: productImages[0] ? 0.35 : 0, textAlign: 'center', width: 'page', height: 'medium' },
    blocks: heroBlocks,
  });

  // --- Countdown / urgency (direct-response style, or real low stock) --
  if (style === 'direct-response' || stock != null) {
    sections.push({
      type: 'countdownBanner',
      settings: { backgroundColor: '#111111', textColor: '#ffffff', align: 'center' },
      blocks: [
        {
          type: 'heading',
          settings: { text: stock != null ? `Only ${stock} left in stock — order soon` : 'Limited-time offer', size: 'sm' },
        },
      ],
    });
  } else {
    omittedSections.push('countdownBanner');
  }

  // --- Gallery (needs >=3 remaining images, skipped entirely in minimal style)
  const galleryImages = productImages.slice(1);
  if (style !== 'minimal' && galleryImages.length >= 3) {
    sections.push({
      type: 'gallery',
      settings: { align: 'center', width: 'page', gap: 16, columns: '3', imageAspect: 'square', enableLightbox: true },
      blocks: [
        { type: 'heading', settings: { text: 'Gallery', size: 'md' } },
        ...galleryImages.slice(0, 8).map((url) => ({ type: 'galleryImage', settings: { imageUrl: url, caption: '' } })),
      ],
    });
  } else {
    omittedSections.push('gallery');
  }

  // --- Rich text / about ------------------------------------------------
  if (plainDescription) {
    sections.push({
      type: 'richText',
      settings: {
        imagePosition: productImages[1] ? 'right' : 'none',
        align: 'left',
        width: 'page',
        gap: 40,
        // A light tint of the hero image's dominant color, for a page that
        // feels cohesively branded rather than generic white-on-white.
        backgroundColor: accentColor && !isDarkColor(accentColor) ? lighten(accentColor, 0.88) : '#ffffff',
      },
      blocks: [
        { type: 'heading', settings: { text: style === 'storytelling' ? 'Our story' : 'About this product', size: 'md' } },
        { type: 'text', settings: { content: product.description } },
        ...(productImages[1] ? [{ type: 'image', settings: { url: productImages[1] } }] : []),
      ],
    });
  }

  // --- Comparison table (only for genuinely tiered/priced variants, not in minimal style)
  if (style !== 'minimal' && looksLikeTieredVariants(product.variants)) {
    sections.push({
      type: 'comparisonTable',
      settings: { align: 'center', width: 'page', gap: 24, highlightBadgeText: 'Most popular', noteText: '' },
      blocks: [
        { type: 'heading', settings: { text: 'Choose your option', size: 'md' } },
        ...product.variants.map((v, i) => ({
          type: 'plan',
          settings: {
            name: v.values.join(' / ') || v.label,
            price: v.price != null ? `$${v.price.toFixed(2)}` : '',
            featuresText: '',
            highlighted: i === Math.floor(product.variants.length / 2),
          },
        })),
      ],
    });
  } else {
    omittedSections.push('comparisonTable');
  }

  // --- Featured collection (related products, not in minimal style) -----
  if (style !== 'minimal' && product.collections.length > 0) {
    sections.push({
      type: 'featuredCollection',
      settings: { limit: 4, columns: '4', columnsMobile: '2', align: 'center', width: 'page', gap: 24, imageAspect: 'square' },
      blocks: [{ type: 'collectionTitle', settings: { fallbackText: 'You may also like' } }],
    });
  } else {
    omittedSections.push('featuredCollection');
  }

  // --- FAQ (generic starter Q&A — explicitly editable defaults) --------
  sections.push(genericFaqSection(product, plainDescription));

  // --- Contact form closer ----------------------------------------------
  sections.push({
    type: 'contactForm',
    settings: { submitButtonText: 'Send', align: 'center', width: 'page' },
    blocks: [{ type: 'heading', settings: { text: 'Have questions?', size: 'md' } }],
  });

  return { sections, omittedSections };
}

/**
 * Overwrites theme-product-launch's generic hero/problemSolution/features/
 * howItWorks/testimonials/faq copy with a generated ProductAiBrief, in
 * place. Only ever rewrites block `settings` values on the existing
 * sections/blocks produced by buildProductLaunchSections — never adds,
 * removes, or reorders sections, so a partially-shaped brief can only
 * leave some sections generic, never break the page.
 */
export function applyAiBriefToProductLaunchSections(sections: NativeSection[], brief: import('./productAiBriefGenerator.js').ProductAiBrief): NativeSection[] {
  return sections.map((section) => {
    if (section.type === 'shopHero') {
      const existing = section.blocks ?? [];
      const headingBlock = existing.find((b) => b.type === 'heading');
      const otherBlocks = existing.filter((b) => b.type !== 'heading' && b.type !== 'text');
      return {
        ...section,
        blocks: [
          { type: 'heading', settings: { ...(headingBlock?.settings ?? {}), text: brief.hero.heading } },
          { type: 'text', settings: { content: brief.hero.subheading } },
          ...otherBlocks,
        ],
      };
    }

    if (section.type === 'problemSolution') {
      return {
        ...section,
        settings: {
          ...section.settings,
          problemHeading: brief.problemSolution.problemHeading,
          problemText: brief.problemSolution.problemText,
          solutionHeading: brief.problemSolution.solutionHeading,
          solutionText: brief.problemSolution.solutionText,
        },
      };
    }

    if (section.type === 'multiColumn') {
      const headingBlock = (section.blocks ?? []).find((b) => b.type === 'heading');
      // brief.featuresAndBenefits.items[].icon is picked by the AI per-feature
      // (from theme-kit's fixed icon set) rather than cycled, so the icon
      // actually matches what each feature is about.
      const columnBlocks = brief.featuresAndBenefits.items.map((item) => ({
        type: 'column',
        settings: { mediaType: 'icon', iconName: item.icon, heading: item.heading, text: item.text },
      }));
      return { ...section, blocks: [...(headingBlock ? [headingBlock] : []), ...columnBlocks] };
    }

    if (section.type === 'howItWorks') {
      return {
        ...section,
        settings: { ...section.settings, heading: brief.howItWorks.heading },
        blocks: brief.howItWorks.steps.map((step) => ({ type: 'step', settings: { title: step.title, description: step.description } })),
      };
    }

    if (section.type === 'testimonials') {
      const headingBlock = (section.blocks ?? []).find((b) => b.type === 'heading');
      const testimonialBlocks = brief.testimonials.items.map((t) => ({
        type: 'testimonial',
        settings: { quote: t.quote, author: t.author, rating: t.rating },
      }));
      return { ...section, blocks: [...(headingBlock ? [headingBlock] : []), ...testimonialBlocks] };
    }

    if (section.type === 'faq') {
      const headingBlock = (section.blocks ?? []).find((b) => b.type === 'heading');
      const faqBlocks = brief.faq.items.map((item) => ({ type: 'faqItem', settings: { question: item.question, answer: item.answer } }));
      return { ...section, blocks: [...(headingBlock ? [headingBlock] : []), ...faqBlocks] };
    }

    return section;
  });
}

/**
 * Overwrites theme-lookbook's generic hero/key-features/materials/
 * lifestyle/whats-in-the-box/testimonials/final-CTA copy with a generated
 * LookbookAiBrief, in place. buildLookbookSections always emits its 13
 * slots in the same fixed order (it never omits a section for thin data),
 * so repeated section types (shopHero, richText, productSpecs) are matched
 * by their occurrence order rather than by type alone. Size & fit guide
 * and variant swatches are deliberately left untouched — real measurements
 * can't be fabricated from a text description.
 */
export function applyAiBriefToLookbookSections(sections: NativeSection[], brief: import('./lookbookAiBriefGenerator.js').LookbookAiBrief): NativeSection[] {
  let shopHeroSeen = 0;
  let richTextSeen = 0;
  let productSpecsSeen = 0;

  return sections.map((section) => {
    if (section.type === 'shopHero') {
      shopHeroSeen += 1;
      const isFinalCta = shopHeroSeen === 2;
      const existing = section.blocks ?? [];
      const headingBlock = existing.find((b) => b.type === 'heading');
      const otherBlocks = existing.filter((b) => b.type !== 'heading' && b.type !== 'text');
      const heading = isFinalCta ? brief.finalCta.heading : brief.hero.heading;
      const text = isFinalCta ? brief.finalCta.text : brief.hero.subheading;
      return {
        ...section,
        blocks: [{ type: 'heading', settings: { ...(headingBlock?.settings ?? {}), text: heading } }, { type: 'text', settings: { content: text } }, ...otherBlocks],
      };
    }

    if (section.type === 'productSpecs') {
      productSpecsSeen += 1;
      const headingBlock = (section.blocks ?? []).find((b) => b.type === 'heading');

      if (productSpecsSeen === 1) {
        // "Key features" slot.
        const specRows = brief.keyFeatures.items.map((item) => ({ type: 'specRow', settings: { label: item.label, value: item.value } }));
        return { ...section, blocks: [...(headingBlock ? [headingBlock] : []), ...specRows] };
      }
      if (productSpecsSeen === 3) {
        // "What's in the box" slot.
        return {
          ...section,
          blocks: [
            ...(headingBlock ? [headingBlock] : []),
            { type: 'specRow', settings: { label: 'Includes', value: brief.whatsInBox.includes } },
            { type: 'specRow', settings: { label: 'Packaging', value: brief.whatsInBox.packaging } },
          ],
        };
      }
      // productSpecsSeen === 2 is "Size & fit guide" — left untouched.
      return section;
    }

    if (section.type === 'richText') {
      richTextSeen += 1;
      if (richTextSeen !== 1 && richTextSeen !== 2) return section;
      const content = richTextSeen === 1 ? brief.materials : brief.lifestyle;
      return {
        ...section,
        blocks: (section.blocks ?? []).map((block) => {
          if (block.type === 'heading') return { ...block, settings: { ...block.settings, text: content.heading } };
          if (block.type === 'text') return { ...block, settings: { ...block.settings, content: content.text } };
          return block;
        }),
      };
    }

    if (section.type === 'testimonials') {
      const headingBlock = (section.blocks ?? []).find((b) => b.type === 'heading');
      const testimonialBlocks = brief.testimonials.items.map((t) => ({
        type: 'testimonial',
        settings: { quote: t.quote, author: t.author, rating: t.rating },
      }));
      return { ...section, blocks: [...(headingBlock ? [headingBlock] : []), ...testimonialBlocks] };
    }

    return section;
  });
}

// --- Main entry point --------------------------------------------------------

export async function buildNativeLandingPage(
  product: ProductLike,
  options: { style?: GenerationStyle; themeId?: LandingPageThemeId } = {},
): Promise<NativeBuildResult> {
  const style: GenerationStyle = options.style ?? 'direct-response';
  const themeId: LandingPageThemeId = options.themeId ?? DEFAULT_LANDING_PAGE_THEME_ID;
  const productUrl = `/products/${product.handle}`;
  const plainDescription = stripHtml(product.description || '');
  const productImages = images(product);
  const stock = lowStockCount(product);

  const ctx: RecipeContext = { product, style, productUrl, plainDescription, productImages, stock };

  let result: { sections: NativeSection[]; omittedSections: string[] };
  switch (themeId) {
    case 'product-launch':
      result = buildProductLaunchSections(ctx);
      break;
    case 'lookbook':
      result = buildLookbookSections(ctx);
      break;
    default: {
      // Defensive fallback for a stale/unrecognized themeId (e.g. an old
      // stored value from a since-removed theme) — never throws.
      const accentColor = productImages[0] ? await extractDominantColor(productImages[0]) : null;
      result = buildGenericStoreSections(ctx, accentColor);
      break;
    }
  }

  const seo: NativeSeo = {
    metaTitle: product.title.length > 60 ? `${product.title.slice(0, 57)}...` : product.title,
    metaDescription: plainDescription ? firstSentence(plainDescription, 155) : `Shop ${product.title} now.`,
    ogImage: productImages[0] ?? '',
  };

  return { sections: result.sections, omittedSections: result.omittedSections, seo, checklist: buildChecklist(result.sections, plainDescription) };
}
