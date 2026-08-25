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

const HEADER_BLOCKS: StarterTemplateBlock[] = [
  { type: 'menu', settings: { items: [{ label: 'Shop', url: '/' }, { label: 'About', url: '/' }] } },
];

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
function button(text: string, url = '/'): StarterTemplateBlock {
  return { type: 'button', settings: { text, url } };
}

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'classic-store',
    name: 'Classic store',
    sections: [
      { type: 'header', settings: { storeName: 'My Store', tagline: 'Quality goods, honest prices' }, blocks: HEADER_BLOCKS },
      {
        type: 'hero',
        settings: {},
        blocks: [heading('New season, new favorites'), text('Shop the latest arrivals'), button('Shop now')],
      },
      { type: 'collectionList', settings: {}, blocks: [heading('Shop by category', 'md')] },
      { type: 'featuredCollection', settings: {}, blocks: [{ type: 'collectionTitle', settings: { fallbackText: 'Best sellers' } }] },
      {
        type: 'testimonials',
        settings: {},
        blocks: [
          heading('What our customers say', 'md'),
          { type: 'testimonial', settings: {} },
          { type: 'testimonial', settings: { quote: 'Fast shipping and great quality.', author: 'Another customer', rating: 5 } },
        ],
      },
      { type: 'newsletter', settings: {}, blocks: [heading('Join our newsletter', 'md'), text('Get updates on new products and sales')] },
      { type: 'footer', settings: { text: 'My Store. All rights reserved.', showYear: true }, blocks: FOOTER_BLOCKS },
    ],
  },
  {
    id: 'minimal-boutique',
    name: 'Minimal boutique',
    sections: [
      { type: 'header', settings: { storeName: 'Boutique' }, blocks: HEADER_BLOCKS },
      { type: 'hero', settings: {}, blocks: [heading('Crafted with care'), button('Explore')] },
      { type: 'richText', settings: {}, blocks: [heading('Our story', 'md'), text('Every piece is made by hand.')] },
      { type: 'featuredCollection', settings: {}, blocks: [{ type: 'collectionTitle', settings: { fallbackText: 'The collection' } }] },
      {
        type: 'faq',
        settings: {},
        blocks: [heading('Frequently asked questions', 'md'), { type: 'faqItem', settings: {} }],
      },
      { type: 'footer', settings: {}, blocks: FOOTER_BLOCKS },
    ],
  },
  {
    id: 'bold-launch',
    name: 'Product launch',
    sections: [
      { type: 'header', settings: {}, blocks: HEADER_BLOCKS },
      { type: 'announcementBar', settings: {}, blocks: [{ type: 'announcement', settings: { text: 'Launch week — 20% off everything' } }] },
      { type: 'heroVideo', settings: {}, blocks: [heading('Introducing the next big thing')] },
      { type: 'countdownBanner', settings: {}, blocks: [heading('Sale ends in', 'sm')] },
      {
        type: 'multiColumn',
        settings: {},
        blocks: [
          heading("Why you'll love it", 'md'),
          { type: 'column', settings: {} },
          { type: 'column', settings: { heading: 'Quality', text: 'Built to last' } },
          { type: 'column', settings: { heading: 'Support', text: "We're here to help" } },
        ],
      },
      {
        type: 'comparisonTable',
        settings: {},
        blocks: [heading('Compare plans', 'md'), { type: 'plan', settings: {} }, { type: 'plan', settings: { name: 'Pro', price: '৳59', highlighted: true } }],
      },
      { type: 'socialProofBar', settings: {}, blocks: [{ type: 'proofMessage', settings: {} }] },
      { type: 'newsletter', settings: {}, blocks: [heading('Stay in the loop', 'md'), text('Be first to hear about new drops')] },
      { type: 'footer', settings: {}, blocks: FOOTER_BLOCKS },
    ],
  },
];
