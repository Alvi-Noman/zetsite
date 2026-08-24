import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface TestimonialsGridSettings {}

export const testimonialsGridSchema: SectionSchema = {
  type: 'testimonialsGrid',
  label: 'Testimonials (grid)',
  allowedBlockTypes: ['heading', 'testimonial'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'What customers say', size: 'md' } },
    { type: 'testimonial', settings: {} },
    { type: 'testimonial', settings: {} },
    { type: 'testimonial', settings: {} },
  ],
  fields: [],
  defaultSettings: {},
};

interface TestimonialData {
  quote?: string;
  author?: string;
  avatarUrl?: string;
}

export function TestimonialsGrid({ blocks, renderBlocks }: SectionComponentProps<TestimonialsGridSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'testimonial').map((b) => b.settings as TestimonialData);
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="grid gap-5 sm:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 p-5">
            <p className="text-sm italic leading-relaxed text-neutral-700">&ldquo;{item.quote}&rdquo;</p>
            <div className="mt-4 flex items-center gap-2">
              {item.avatarUrl ? <ResponsiveImage src={item.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" /> : null}
              <span className="text-xs font-semibold text-neutral-900">{item.author}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
