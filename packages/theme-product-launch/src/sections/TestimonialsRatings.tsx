import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface TestimonialsRatingsSettings {}

export const testimonialsRatingsSchema: SectionSchema = {
  type: 'testimonialsRatings',
  label: 'Testimonials (rating breakdown)',
  allowedBlockTypes: ['heading', 'testimonial'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'What customers say', size: 'md' } },
    { type: 'testimonial', settings: {} },
    { type: 'testimonial', settings: {} },
  ],
  fields: [],
  defaultSettings: {},
};

interface TestimonialData {
  quote?: string;
  author?: string;
}

const BREAKDOWN = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 15 },
  { stars: 3, pct: 5 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

export function TestimonialsRatings({ blocks, renderBlocks }: SectionComponentProps<TestimonialsRatingsSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'testimonial').map((b) => b.settings as TestimonialData);
  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="mb-8 flex flex-col gap-1.5">
        {BREAKDOWN.map((row) => (
          <div key={row.stars} className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="w-8 shrink-0">{row.stars}★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-yellow-600" style={{ width: `${row.pct}%` }} />
            </div>
            <span className="w-8 shrink-0 text-right">{row.pct}%</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="border-t border-neutral-200 pt-4">
            <p className="text-sm italic leading-relaxed text-neutral-700">&ldquo;{item.quote}&rdquo;</p>
            <p className="mt-1.5 text-xs font-semibold text-neutral-900">{item.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
