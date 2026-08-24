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

// Follows the classic single-page product/SaaS launch structure end to end:
// hero -> early social proof -> problem -> solution -> features & benefits ->
// how it works -> testimonials -> product showcase -> faq -> final CTA ->
// footer. Every section maps 1:1 to a requested slot. Deliberately no
// pricing/plans section — this theme's checkout is a single fixed product,
// not a tiered offering.
export const starterTemplates: StarterTemplate[] = [
  {
    id: 'product-launch-classic',
    name: 'Product launch (full page)',
    sections: [
      // 1. Hero — dominant product image, headline, tagline, price, primary CTA.
      // Same shopHero section Lookbook uses for its opening hero.
      {
        type: 'shopHero',
        settings: { imageUrl: '', productId: '', price: '', compareAtPrice: '', currency: '$', backgroundColor: '#FAF7F2' },
        blocks: [
          heading('The easiest way to get [outcome], without [pain point]', 'lg'),
          text('Built for people who want results without the usual complexity, cost, or wasted time.'),
          button('Buy now', '#order'),
        ],
      },
      // 2. Social proof (early) — rating badge right below the hero.
      { type: 'ratingBadge', settings: { rating: 4.8, reviewCount: 1200, label: 'from happy customers', align: 'center' } },
      // 3 & 4. Problem / pain point + Solution / value proposition.
      {
        type: 'problemSolution',
        settings: {
          problemHeading: 'Sound familiar?',
          problemText: "You've tried the usual fixes. They're slow, expensive, or just don't hold up — and you're stuck doing it the hard way.",
          solutionHeading: 'There’s a better way',
          solutionText: 'We built this to remove the trade-off entirely — so you get the result you want without the usual catch.',
        },
      },
      // 5. Features & benefits — each capability paired with why it matters.
      {
        type: 'multiColumn',
        settings: { columns: 3, align: 'center', width: 'page', gap: 32, imageShape: 'circle' },
        blocks: [
          heading('Features & benefits', 'md'),
          { type: 'column', settings: { mediaType: 'icon', iconName: 'zap', heading: 'Fast to set up', text: 'Get running in minutes, not weeks — no technical setup required.' } },
          { type: 'column', settings: { mediaType: 'icon', iconName: 'shield', heading: 'Built to last', text: 'Reliable, secure, and backed by a real guarantee — not an afterthought.' } },
          { type: 'column', settings: { mediaType: 'icon', iconName: 'truck', heading: 'Support when you need it', text: 'Real people, real answers, whenever you get stuck.' } },
        ],
      },
      // 6. How it works — a simple step walkthrough.
      {
        type: 'howItWorks',
        settings: { heading: 'How it works', backgroundColor: '#FAF7F2' },
        blocks: [
          { type: 'step', settings: { title: 'Sign up', description: 'Create your account in under a minute — no credit card required.' } },
          { type: 'step', settings: { title: 'Set things up', description: 'Connect your data and customize it to fit how you work.' } },
          { type: 'step', settings: { title: 'See results', description: 'Get value from day one, with support if you need it.' } },
        ],
      },
      // 7. Testimonials / reviews — detailed quotes with real names.
      {
        type: 'testimonials',
        settings: {},
        blocks: [
          heading('What customers say', 'md'),
          { type: 'testimonial', settings: { quote: "This solved a problem we'd been putting off for months. Wish we'd started sooner.", author: 'Amara K., Operations Lead', rating: 5 } },
          { type: 'testimonial', settings: { quote: 'Simple to set up and the results showed up almost immediately.', author: 'Daniel R., Founder', rating: 5 } },
        ],
      },
      // 8. Product showcase / demo — screenshots or preview.
      {
        type: 'gallery',
        settings: { align: 'center', width: 'page', gap: 16, columns: '3', imageAspect: 'landscape', enableLightbox: true },
        blocks: [heading('See it in action', 'md'), { type: 'galleryImage', settings: {} }, { type: 'galleryImage', settings: {} }, { type: 'galleryImage', settings: {} }],
      },
      // 9. FAQ — objections and common questions.
      {
        type: 'faq',
        settings: { align: 'center', width: 'page', allowMultipleOpen: true, enableSchema: true },
        blocks: [
          heading('Frequently asked questions', 'md'),
          { type: 'faqItem', settings: { question: 'How long does shipping take?', answer: 'Most orders arrive within 2-3 business days.' } },
          { type: 'faqItem', settings: { question: 'What is your return policy?', answer: '30-day returns, no questions asked.' } },
          { type: 'faqItem', settings: { question: 'Do you offer support?', answer: 'Yes — reach out any time and a real person will help.' } },
        ],
      },
      // 10. Final CTA — restates the value, repeats the call to action.
      {
        type: 'finalCta',
        settings: { backgroundColor: '#1C1917' },
        blocks: [
          heading('Ready to get started?', 'lg'),
          text('Join thousands of customers already getting results. No risk — cancel anytime.'),
          button('Buy now', '#order'),
        ],
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
      // 12. Footer — contact, links, legal/trust badges.
      { type: 'footer', settings: { text: 'All rights reserved.', showYear: true }, blocks: FOOTER_BLOCKS },
    ],
  },
];
