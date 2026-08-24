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
function textBlock(content: string): StarterTemplateBlock {
  return { type: 'text', settings: { content } };
}
function button(text: string, url = '#order'): StarterTemplateBlock {
  return { type: 'button', settings: { text, url } };
}

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'funnel-classic',
    name: 'Order funnel',
    sections: [
      {
        type: 'announcementBar',
        settings: {},
        blocks: [{ type: 'announcement', settings: { text: '🔥 Limited stock — order today for free delivery' } }],
      },
      {
        type: 'productHero',
        settings: { imageUrl: '', backgroundColor: '#ffffff' },
        blocks: [
          heading('The best protection for your device', 'lg'),
          heading('Premium, durable, and built to last', 'md'),
          textBlock('A stylish, tough case collection designed to keep your device looking brand new — trusted by thousands of happy customers.'),
          button('Order now'),
        ],
      },
      {
        type: 'featureCards',
        settings: { backgroundColor: '#ffffff' },
        blocks: [
          { type: 'featureCard', settings: { icon: 'shield', title: 'Maximum protection', subtitle: 'Military-grade drop protection', color: 'green' } },
          { type: 'featureCard', settings: { icon: 'gem', title: 'Premium finish', subtitle: 'Soft-touch matte texture', color: 'blue' } },
          { type: 'featureCard', settings: { icon: 'zap', title: 'Fast charging ready', subtitle: 'Wireless charging compatible', color: 'orange' } },
          { type: 'featureCard', settings: { icon: 'camera', title: 'Camera safe', subtitle: 'Raised bezel & lens guard', color: 'purple' } },
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
        type: 'checklistFeatures',
        settings: { heading: 'Why customers choose us', backgroundColor: '#f8fafc' },
        blocks: [
          { type: 'checklistItem', settings: { title: 'Built to last', description: 'Reinforced construction stands up to daily wear and tear.' } },
          { type: 'checklistItem', settings: { title: "Won't fade or yellow", description: 'Stays looking new long after purchase.' } },
          { type: 'checklistItem', settings: { title: 'Wireless charging ready', description: 'No need to remove anything to charge.' } },
          { type: 'checklistItem', settings: { title: 'Camera lens guard', description: 'A raised bezel keeps lenses off flat surfaces.' } },
          { type: 'checklistItem', settings: { title: 'Slim, premium grip', description: 'Full protection without added bulk.' } },
        ],
      },
      {
        type: 'productSpecs',
        settings: {},
        blocks: [
          heading('Specifications', 'md'),
          { type: 'specRow', settings: { label: 'Material', value: 'Shock-absorbing TPU + PC hybrid' } },
          { type: 'specRow', settings: { label: 'Compatibility', value: 'See size guide for supported models' } },
          { type: 'specRow', settings: { label: 'Charging', value: 'Wireless charging compatible' } },
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
          { type: 'testimonial', settings: { quote: 'Dropped my phone twice and it survived both times. Worth every penny.', author: 'Rafiq H.', rating: 5 } },
          { type: 'testimonial', settings: { quote: 'Looks premium and the wireless charging actually works through it.', author: 'Nadia S.', rating: 5 } },
        ],
      },
      { type: 'footer', settings: { text: 'All rights reserved.', showYear: true }, blocks: FOOTER_BLOCKS },
    ],
  },
];
