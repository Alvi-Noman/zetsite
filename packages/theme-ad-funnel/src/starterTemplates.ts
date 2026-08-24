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

function heading(text: string, size: 'sm' | 'md' | 'lg' = 'md'): StarterTemplateBlock {
  return { type: 'heading', settings: { text, size } };
}
function button(text: string, url = '#order'): StarterTemplateBlock {
  return { type: 'button', settings: { text, url } };
}

// Mirrors the exact section order of the reference ad-funnel page: hero with
// stacked headlines + gradient CTA, pastel feature cards, an image gallery,
// a single-column checkmark list, then the on-page COD order form — nothing
// else (no announcement bar, countdown, trust badges, FAQ, or testimonials;
// the reference page doesn't have them either).
export const starterTemplates: StarterTemplate[] = [
  {
    id: 'ad-funnel-classic',
    name: 'Ad funnel (exact)',
    sections: [
      {
        type: 'productHero',
        settings: { imageUrl: '', backgroundColor: '#ffffff' },
        blocks: [
          heading('The best protection for your Samsung Ultra series', 'md'),
          heading('Military-grade drop protection cover', 'md'),
          heading('Premium, stylish, and durable cover collection for S23, S24, S25 and S26 Ultra. Keep your flagship device looking brand new.', 'sm'),
          button('Order now'),
        ],
      },
      {
        type: 'featureCards',
        settings: { backgroundColor: '#ffffff' },
        blocks: [
          { type: 'featureCard', settings: { icon: 'shield', title: 'Maximum protection', subtitle: 'Military-grade drop protection', color: 'green' } },
          { type: 'featureCard', settings: { icon: 'gem', title: 'Premium finish', subtitle: 'Leather & matte texture', color: 'blue' } },
          { type: 'featureCard', settings: { icon: 'zap', title: 'MagSafe support', subtitle: 'Fast wireless charging', color: 'orange' } },
          { type: 'featureCard', settings: { icon: 'camera', title: 'Camera safety', subtitle: 'Raised bezel & lens guard', color: 'purple' } },
        ],
      },
      {
        type: 'gallery',
        settings: { align: 'center', width: 'page', gap: 16, columns: '3', imageAspect: 'square', enableLightbox: true },
        blocks: [{ type: 'galleryImage', settings: {} }, { type: 'galleryImage', settings: {} }, { type: 'galleryImage', settings: {} }, { type: 'galleryImage', settings: {} }, { type: 'galleryImage', settings: {} }],
      },
      {
        type: 'checklistFeatures',
        settings: { heading: 'Why is this the best choice for you?', backgroundColor: '#ffffff' },
        blocks: [
          { type: 'checklistItem', settings: { title: 'Military-grade drop protection', description: "Won't damage your phone even if dropped. Uses shock-absorbing technology." } },
          { type: 'checklistItem', settings: { title: "Won't fade or yellow", description: 'Stays looking brand new even after long-term use.' } },
          { type: 'checklistItem', settings: { title: 'MagSafe (wireless charging) support', description: 'No need to remove the cover to charge. Built-in magnetic ring included.' } },
          { type: 'checklistItem', settings: { title: 'Camera lens guard', description: 'The raised bezel design protects your expensive lenses from scratching on surfaces.' } },
          { type: 'checklistItem', settings: { title: 'Slim fit & premium grip', description: 'Maximum protection without adding bulk. No risk of slipping from your hand.' } },
        ],
      },
      {
        type: 'orderForm',
        settings: {
          productId: '',
          currency: '৳',
          shippingOptions: [
            { label: 'Inside Dhaka', cost: 80 },
            { label: 'Outside Dhaka', cost: 150 },
          ],
          submitButtonText: 'Confirm your order',
          codLabel: 'Cash on delivery',
          successMessage: "Order received — we'll call to confirm.",
        },
        blocks: [heading('Fill out the form below to confirm your order', 'md')],
      },
    ],
  },
];
