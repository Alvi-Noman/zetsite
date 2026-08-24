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

// Section order follows proven CRO structure rather than the generic
// advertorial layout: a single dominant above-the-fold CTA, social proof
// (star rating) placed immediately next to that CTA, trust signals before
// the ask, benefits before specs, and a risk-reversal guarantee right
// before the order form to neutralize last-minute hesitation.
export const starterTemplates: StarterTemplate[] = [
  {
    id: 'conversion-pro-classic',
    name: 'High-converting funnel',
    sections: [
      {
        type: 'announcementBar',
        settings: {},
        blocks: [{ type: 'announcement', settings: { text: '🚚 Free delivery on orders placed today' } }],
      },
      {
        type: 'hero',
        settings: { backgroundColor: '#ffffff', overlayOpacity: 0.35, textAlign: 'center', height: 'medium' },
        blocks: [
          heading('Get the results you want — without the guesswork', 'lg'),
          text('Trusted by thousands of customers who wanted something that actually works, backed by a full money-back guarantee.'),
          button('Order now — risk-free'),
        ],
      },
      {
        type: 'ratingBadge',
        settings: { rating: 4.9, reviewCount: 2000, label: 'from verified buyers', align: 'center' },
      },
      {
        type: 'socialProofBar',
        settings: { displayStyle: 'bar', align: 'center' },
        blocks: [{ type: 'proofMessage', settings: { message: '🔥 42 people ordered in the last 24 hours' } }],
      },
      {
        type: 'trustBadges',
        settings: {},
        blocks: [
          { type: 'trustBadge', settings: { icon: 'shield', label: '30-day guarantee', value: 'Full refund, no questions' } },
          { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '2-3 business days' } },
          { type: 'trustBadge', settings: { icon: 'creditCard', label: 'Cash on delivery', value: 'Pay when it arrives' } },
        ],
      },
      {
        type: 'gallery',
        settings: {},
        blocks: [
          heading('See it for yourself', 'md'),
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
        ],
      },
      {
        type: 'richText',
        settings: {},
        blocks: [
          heading('Why customers switch to us', 'md'),
          text(
            'Most alternatives ask you to compromise — on quality, on price, or on how long it takes to arrive. We built this to remove that trade-off entirely, so you get a better result without the usual catch.',
          ),
        ],
      },
      {
        type: 'productSpecs',
        settings: {},
        blocks: [
          heading('Specifications', 'md'),
          { type: 'specRow', settings: { label: 'Materials', value: 'Premium-grade, built to last' } },
          { type: 'specRow', settings: { label: 'Warranty', value: '1 year, free replacement' } },
          { type: 'specRow', settings: { label: 'Guarantee', value: '30-day money-back' } },
        ],
      },
      {
        type: 'testimonials',
        settings: {},
        blocks: [
          heading('What customers say', 'md'),
          { type: 'testimonial', settings: { quote: "I was skeptical but it genuinely delivered. Wish I'd ordered sooner.", author: 'Verified buyer', rating: 5 } },
          { type: 'testimonial', settings: { quote: 'Fast shipping and exactly as described. Would order again.', author: 'Verified buyer', rating: 5 } },
        ],
      },
      {
        type: 'countdownBanner',
        settings: {
          targetDate: '',
          expiredText: 'This offer has ended',
          priceText: '৳2,490',
          originalPriceText: '৳4,990',
          discountBadgeText: '50% OFF today',
        },
        blocks: [heading('Limited-time price — ends soon', 'sm')],
      },
      {
        type: 'orderForm',
        settings: {
          productId: '',
          currency: '৳',
          shippingOptions: [
            { label: 'Standard delivery', cost: 0 },
            { label: 'Express delivery', cost: 5 },
          ],
          submitButtonText: 'Order now — risk-free',
          codLabel: 'Cash on delivery',
          successMessage: "Order received — we'll call to confirm within a few hours.",
        },
        blocks: [heading('Complete your order', 'md')],
      },
      {
        type: 'faq',
        settings: {},
        blocks: [
          heading('Frequently asked questions', 'md'),
          { type: 'faqItem', settings: { question: 'What if it doesn’t work for me?', answer: "You're covered by our 30-day money-back guarantee — full refund, no questions asked." } },
          { type: 'faqItem', settings: { question: 'How long does delivery take?', answer: 'Most orders arrive within 2-3 business days nationwide.' } },
          { type: 'faqItem', settings: { question: 'Do I pay before delivery?', answer: 'No — cash on delivery is available. You pay the courier when your order arrives.' } },
        ],
      },
      { type: 'footer', settings: { text: 'All rights reserved.', showYear: true }, blocks: FOOTER_BLOCKS },
      {
        type: 'stickyBuyBar',
        settings: { priceText: '৳2,490', originalPriceText: '৳4,990', buttonText: 'Order now', buttonUrl: '#order', showOnDesktop: false },
      },
    ],
  },
];
