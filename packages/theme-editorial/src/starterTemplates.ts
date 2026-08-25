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
    id: 'editorial-showcase',
    name: 'Editorial showcase',
    sections: [
      {
        type: 'hero',
        settings: { backgroundColor: '#FBFAF8', overlayOpacity: 0.15, textAlign: 'center', height: 'large' },
        blocks: [
          heading('Considered design, made to last', 'lg'),
          textBlock('A single, quietly exceptional product — crafted with care and built for everyday use.'),
          button('Shop the collection'),
        ],
      },
      {
        type: 'richText',
        settings: {},
        blocks: [
          heading('Our story', 'md'),
          textBlock(
            "We believe the best products don't need to shout. Every detail — from material to finish — is chosen with intention, so it earns a place in your everyday life rather than a drawer.",
          ),
        ],
      },
      {
        type: 'productSpecs',
        settings: {},
        blocks: [
          heading('Details', 'md'),
          { type: 'specRow', settings: { label: 'Materials', value: 'Responsibly sourced, premium-grade' } },
          { type: 'specRow', settings: { label: 'Craftsmanship', value: 'Finished and inspected by hand' } },
          { type: 'specRow', settings: { label: 'Warranty', value: '2 years, no questions asked' } },
        ],
      },
      {
        type: 'gallery',
        settings: {},
        blocks: [
          heading('In detail', 'md'),
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
          { type: 'galleryImage', settings: {} },
        ],
      },
      {
        type: 'testimonials',
        settings: {},
        blocks: [
          heading('What people notice first', 'md'),
          { type: 'testimonial', settings: { quote: 'It feels like it was made to last a lifetime, not a season.', author: 'Amara K.', rating: 5 } },
          { type: 'testimonial', settings: { quote: 'The kind of quality you can feel the moment you pick it up.', author: 'Daniel R.', rating: 5 } },
        ],
      },
      {
        type: 'faq',
        settings: {},
        blocks: [
          heading('Questions', 'md'),
          { type: 'faqItem', settings: { question: 'How is this different from mass-market alternatives?', answer: 'Every unit is made in small batches and inspected individually before it ships.' } },
          { type: 'faqItem', settings: { question: 'What is the return policy?', answer: '30-day returns, no questions asked.' } },
        ],
      },
      {
        type: 'orderForm',
        settings: {
          productId: '',
          currency: '৳',
          shippingOptions: [{ label: 'Standard shipping', cost: 0 }],
          submitButtonText: 'Place order',
          codLabel: 'Cash on delivery available',
          successMessage: "Thank you — we'll be in touch to confirm your order.",
        },
        blocks: [heading('Complete your order', 'md')],
      },
      { type: 'footer', settings: { text: 'All rights reserved.', showYear: true }, blocks: FOOTER_BLOCKS },
    ],
  },
];
