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

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'advertorial-classic',
    name: 'Direct-response classic',
    sections: [
      {
        type: 'announcementBar',
        settings: {},
        blocks: [{ type: 'announcement', settings: { text: '🔥 Limited stock — free delivery on orders placed today' } }],
      },
      {
        type: 'hero',
        settings: {},
        blocks: [
          heading('AeroBuds Pro — Wireless Earbuds That Actually Stay In'),
          text('Crystal-clear calls, 30-hour battery, and a fit that survives your workout. Trusted by 8,000+ customers nationwide.'),
          button('Order now — Cash on delivery'),
        ],
      },
      {
        type: 'countdownBanner',
        settings: {
          targetDate: '',
          expiredText: 'This offer has ended',
          priceText: '৳2,490',
          originalPriceText: '৳4,990',
          discountBadgeText: '50% OFF',
        },
        blocks: [heading('Today only', 'sm')],
      },
      {
        type: 'trustBadges',
        settings: {},
        blocks: [
          { type: 'trustBadge', settings: { icon: 'shield', label: '1 year warranty', value: '' } },
          { type: 'trustBadge', settings: { icon: 'refresh', label: 'Easy returns', value: '7-day exchange' } },
          { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '2-3 business days' } },
          { type: 'trustBadge', settings: { icon: 'creditCard', label: 'Cash on delivery', value: 'Pay when it arrives' } },
        ],
      },
      {
        type: 'gallery',
        settings: {},
        blocks: [
          heading('See it up close', 'md'),
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
        ],
      },
      {
        type: 'socialProofBar',
        settings: { displayStyle: 'bar' },
        blocks: [{ type: 'proofMessage', settings: { message: '🔥 37 people ordered AeroBuds Pro in the last 24 hours' } }],
      },
      {
        type: 'richText',
        settings: {},
        blocks: [
          heading('Why we made AeroBuds Pro', 'md'),
          text(
            "We got tired of earbuds that fall out mid-run and die before lunch. So we built AeroBuds Pro: a secure ergonomic fit, 30-hour battery with the charging case, and studio-tuned sound — at a fraction of the price of the big brands. Order today and we'll throw in a free charging cable and travel pouch.",
          ),
        ],
      },
      {
        type: 'productSpecs',
        settings: {},
        blocks: [
          heading('Specifications', 'md'),
          { type: 'specRow', settings: { label: 'Battery life', value: 'Up to 30 hours with case' } },
          { type: 'specRow', settings: { label: 'Connectivity', value: 'Bluetooth 5.3' } },
          { type: 'specRow', settings: { label: 'Water resistance', value: 'IPX5 (sweat & splash proof)' } },
          { type: 'specRow', settings: { label: 'Warranty', value: '1 year, free replacement' } },
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
          submitButtonText: 'Order now — Cash on delivery',
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
          { type: 'faqItem', settings: { question: 'How long does delivery take?', answer: 'Most orders arrive within 2-3 business days nationwide.' } },
          { type: 'faqItem', settings: { question: 'Do I pay before delivery?', answer: 'No — this is cash on delivery. You pay the courier when your order arrives.' } },
          { type: 'faqItem', settings: { question: 'What if I want to return it?', answer: 'You have 7 days to exchange for any reason, no questions asked.' } },
        ],
      },
      {
        type: 'testimonials',
        settings: {},
        blocks: [
          heading('What our customers say', 'md'),
          { type: 'testimonial', settings: { quote: 'Battery genuinely lasts all week for me. Best purchase this year.', author: 'Rafiq H.', rating: 5 } },
          { type: 'testimonial', settings: { quote: 'Stayed in during my entire 10k run. Sound quality surprised me.', author: 'Nadia S.', rating: 5 } },
        ],
      },
      { type: 'footer', settings: { text: 'AeroBuds. All rights reserved.', showYear: true }, blocks: FOOTER_BLOCKS },
    ],
  },
];
