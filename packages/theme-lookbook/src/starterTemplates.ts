export interface StarterTemplateBlock {
  type: string;
  settings: Record<string, unknown>;
}

export interface StarterTemplateSection {
  type: string;
  settings: Record<string, unknown>;
  blocks?: StarterTemplateBlock[];
}

export interface StarterTemplate {
  id: string;
  name: string;
  sections: StarterTemplateSection[];
}

const FOOTER_BLOCKS: StarterTemplateBlock[] = [
  { type: 'copyright', settings: {} },
  { type: 'policyLinks', settings: {} },
  { type: 'socialLinks', settings: {} },
];

function heading(text: string, size: 'sm' | 'md' | 'lg' = 'lg'): StarterTemplateBlock {
  return { type: 'heading', settings: { text, size } };
}
function text(content: string): StarterTemplateBlock {
  return { type: 'text', settings: { content } };
}
function button(text: string, url = '#order'): StarterTemplateBlock {
  return { type: 'button', settings: { text, url } };
}

// Built for visual/commodity goods (watches, sunglasses, apparel) where the
// imagery does the persuading — every slot the user asked for maps 1:1 to a
// section below, reusing ProductSpecs (a generic label/value list) for
// specs, materials, size guide, and box contents rather than four separate
// bespoke components.
export const starterTemplates: StarterTemplate[] = [
  {
    id: 'lookbook-classic',
    name: 'Product showcase (full page)',
    sections: [
      // 1. Hero — dominant product image, name, tagline, price, CTA.
      {
        type: 'shopHero',
        settings: { imageUrl: '', productId: '', price: '৳129', compareAtPrice: '', currency: '৳', backgroundColor: '#FAF7F2' },
        blocks: [heading('Product name', 'lg'), text('A short, evocative tagline that sets the tone.'), button('Buy now')],
      },
      // 2. Product gallery — multiple angles, zoom, in-use shots.
      {
        type: 'gallery',
        settings: { align: 'center', width: 'page', gap: 16, columns: '3', imageAspect: 'square', enableLightbox: true },
        blocks: [
          heading('In detail', 'md'),
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
        ],
      },
      // 3. Key features / specs — lead with these, they drive the decision.
      {
        type: 'productSpecs',
        settings: { width: 'page', backgroundColor: '#ffffff' },
        blocks: [
          heading('Key features', 'md'),
          { type: 'specRow', settings: { label: 'Material', value: 'Premium stainless steel' } },
          { type: 'specRow', settings: { label: 'Dimensions', value: '4.2 x 4.2 x 1.1 cm' } },
          { type: 'specRow', settings: { label: 'Water resistance', value: '5 ATM' } },
          { type: 'specRow', settings: { label: 'Options', value: 'Steel or leather strap' } },
        ],
      },
      // 4. Materials & craftsmanship — justifies price, builds perceived value.
      {
        type: 'richText',
        settings: { imagePosition: 'left', align: 'left', width: 'page', gap: 40, backgroundColor: '#FAF7F2' },
        blocks: [
          heading('Materials & craftsmanship', 'md'),
          text('Every detail is chosen with intention — from the finish to the fasteners — so quality is felt, not just claimed.'),
        ],
      },
      // 5. Variants / options — shown visually with swatches.
      { type: 'variantSwatches', settings: { heading: 'Choose your finish' } },
      // 6. Size / fit guide.
      {
        type: 'productSpecs',
        settings: { width: 'page', backgroundColor: '#ffffff' },
        blocks: [
          heading('Size & fit guide', 'md'),
          { type: 'specRow', settings: { label: 'Small', value: 'Wrist 14–16 cm' } },
          { type: 'specRow', settings: { label: 'Medium', value: 'Wrist 16–18 cm' } },
          { type: 'specRow', settings: { label: 'Large', value: 'Wrist 18–21 cm' } },
        ],
      },
      // 7. Lifestyle / brand story.
      {
        type: 'richText',
        settings: { imagePosition: 'right', align: 'left', width: 'page', gap: 40 },
        blocks: [
          heading('Made for the everyday, built for anywhere', 'md'),
          text('Understated, versatile, and made to be worn — not stored away. Designed for people who want quality that speaks for itself.'),
        ],
      },
      // 8. Social proof — reviews with photos, ratings.
      {
        type: 'testimonials',
        settings: { width: 'page', autoplay: true, autoplaySeconds: 6 },
        blocks: [
          heading('Loved by customers', 'md'),
          { type: 'testimonial', settings: { quote: 'Better in person than the photos even show. Gets compliments constantly.', author: 'Amara K.', rating: 5 } },
          { type: 'testimonial', settings: { quote: 'The quality is obvious the moment you pick it up.', author: 'Daniel R.', rating: 5 } },
        ],
      },
      // 9. Details / what's in the box.
      {
        type: 'productSpecs',
        settings: { width: 'page', backgroundColor: '#FAF7F2' },
        blocks: [
          heading("What's in the box", 'md'),
          { type: 'specRow', settings: { label: 'Includes', value: 'Product, dust cloth, care card' } },
          { type: 'specRow', settings: { label: 'Packaging', value: 'Gift-ready box' } },
          { type: 'specRow', settings: { label: 'Warranty card', value: 'Included' } },
        ],
      },
      // 10. Guarantees & logistics — removes friction at the point of purchase.
      {
        type: 'trustBadges',
        settings: {},
        blocks: [
          { type: 'trustBadge', settings: { icon: 'truck', label: 'Free shipping', value: 'On every order' } },
          { type: 'trustBadge', settings: { icon: 'refresh', label: '30-day returns', value: 'No questions asked' } },
          { type: 'trustBadge', settings: { icon: 'shield', label: 'Authenticity guaranteed', value: '2-year warranty' } },
        ],
      },
      // 11. Related / complete-the-look.
      {
        type: 'featuredCollection',
        settings: { limit: 4, columns: '4', columnsMobile: '2', align: 'center', width: 'page', gap: 24, imageAspect: 'square' },
        blocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Complete the look' } }],
      },
      // 12. Final CTA — closing product shot, price, buy button (reuses shopHero).
      {
        type: 'shopHero',
        settings: { imageUrl: '', productId: '', price: '৳129', compareAtPrice: '', currency: '৳', backgroundColor: '#FAF7F2' },
        blocks: [heading('Yours, today', 'md'), text('Free shipping. 30-day returns. Made to last.'), button('Buy now')],
      },
      // Checkout — the one central order form every "Buy now" button on this
      // page scrolls down to (see id="order"), instead of an add-to-cart
      // flow. Its fields (currency, shipping, COD wording) come from the
      // store's global checkout settings, not from this section's own
      // settings — only the product is chosen here.
      {
        type: 'orderForm',
        settings: { productId: '' },
        blocks: [heading('Complete your order', 'md')],
      },
      // 13. Footer.
      { type: 'footer', settings: { text: 'All rights reserved.', showYear: true }, blocks: FOOTER_BLOCKS },
    ],
  },
];
