import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface TestimonialsResultsSettings {
  stat: string;
  statLabel: string;
}

export const testimonialsResultsSchema: SectionSchema = {
  type: 'testimonialsResults',
  label: 'Testimonials (results-focused)',
  allowedBlockTypes: ['testimonial'],
  defaultBlocks: [{ type: 'testimonial', settings: {} }],
  fields: [
    { key: 'stat', type: 'text', label: 'Result stat', default: 'Loved by 92%', tab: 'content' },
    { key: 'statLabel', type: 'text', label: 'Stat label', default: 'of repeat customers', tab: 'content' },
  ],
  defaultSettings: { stat: 'Loved by 92%', statLabel: 'of repeat customers' },
};

interface TestimonialData {
  quote?: string;
  author?: string;
}

export function TestimonialsResults({ settings, blocks }: SectionComponentProps<TestimonialsResultsSettings>) {
  const item = (blocks ?? []).find((b) => b.type === 'testimonial')?.settings as TestimonialData | undefined;
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="grid items-center gap-8 sm:grid-cols-2">
        <div className="text-center">
          <p className="font-serif text-3xl font-normal text-yellow-700">{settings.stat}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{settings.statLabel}</p>
        </div>
        {item ? (
          <div>
            <p className="text-sm italic leading-relaxed text-neutral-700">&ldquo;{item.quote}&rdquo;</p>
            <p className="mt-2 text-xs font-semibold text-neutral-900">{item.author}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
