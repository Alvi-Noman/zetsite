import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface TestimonialsFeaturedSettings {}

export const testimonialsFeaturedSchema: SectionSchema = {
  type: 'testimonialsFeatured',
  label: 'Testimonials (featured quote)',
  allowedBlockTypes: ['testimonial'],
  defaultBlocks: [{ type: 'testimonial', settings: {} }],
  fields: [],
  defaultSettings: {},
};

interface TestimonialData {
  quote?: string;
  author?: string;
  avatarUrl?: string;
}

export function TestimonialsFeatured({ blocks }: SectionComponentProps<TestimonialsFeaturedSettings>) {
  const item = (blocks ?? []).find((b) => b.type === 'testimonial')?.settings as TestimonialData | undefined;
  if (!item) return null;
  return (
    <section className="mx-auto max-w-2xl px-6 py-14 text-center sm:py-20">
      <p className="font-serif text-2xl font-normal leading-snug text-neutral-900 sm:text-3xl">&ldquo;{item.quote}&rdquo;</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        {item.avatarUrl ? <ResponsiveImage src={item.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : null}
        <span className="text-sm font-semibold text-neutral-900">{item.author}</span>
      </div>
    </section>
  );
}
