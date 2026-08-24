import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface TestimonialSettings {
  quote: string;
  author: string;
  rating: number;
  avatarUrl: string;
}

export const testimonialSchema: SectionSchema = {
  type: 'testimonial',
  label: 'Testimonial',
  fields: [
    { key: 'quote', type: 'richtext', label: 'Quote', default: 'Great products, fast shipping!', tab: 'content' },
    { key: 'author', type: 'text', label: 'Author', default: 'Happy customer', tab: 'content' },
    { key: 'rating', type: 'number', label: 'Rating (1-5)', default: 5, tab: 'content' },
    { key: 'avatarUrl', type: 'image', label: 'Avatar', default: '', tab: 'content' },
  ],
  defaultSettings: { quote: 'Great products, fast shipping!', author: 'Happy customer', rating: 5, avatarUrl: '' },
};

// Rendered by the Testimonials section (carousel needs the full list).
export function Testimonial(_props: SectionComponentProps<TestimonialSettings>) {
  return null;
}
