import { useEffect, useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, ResponsiveImage, type ContentWidth } from '@zetsite/theme-kit';

export interface TestimonialsSettings {
  width: ContentWidth;
  autoplay: boolean;
  autoplaySeconds: number;
}

export const testimonialsSchema: SectionSchema = {
  type: 'testimonials',
  label: 'Testimonials',
  allowedBlockTypes: ['heading', 'testimonial'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'What our customers say', size: 'md' } },
    { type: 'testimonial', settings: {} },
  ],
  fields: [
    WIDTH_FIELD,
    { key: 'autoplay', type: 'boolean', label: 'Autoplay', default: false, tab: 'advanced' },
    { key: 'autoplaySeconds', type: 'number', label: 'Autoplay interval (seconds)', default: 5, tab: 'advanced' },
  ],
  defaultSettings: { width: 'page', autoplay: false, autoplaySeconds: 5 },
};

interface TestimonialData {
  quote?: string;
  author?: string;
  rating?: number;
  avatarUrl?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-amber-500 text-sm mb-2">{'★'.repeat(Math.max(0, Math.min(5, rating))).padEnd(5, '☆')}</div>
  );
}

export function Testimonials({ settings, blocks, renderBlocks }: SectionComponentProps<TestimonialsSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'testimonial').map((b) => b.settings as TestimonialData);
  const [index, setIndex] = useState(0);
  const item = items[index];

  useEffect(() => {
    if (!settings.autoplay || items.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), (settings.autoplaySeconds || 5) * 1000);
    return () => clearInterval(timer);
  }, [settings.autoplay, settings.autoplaySeconds, items.length]);

  return (
    <section className={`px-6 py-10 mx-auto text-center ${widthClass(settings.width, 'max-w-3xl')}`}>
      <div className="mb-10">{renderBlocks?.((b) => b.type === 'heading')}</div>
      {item ? (
        <>
          <Stars rating={item.rating ?? 5} />
          <p className="text-lg text-neutral-700 italic">&ldquo;{item.quote}&rdquo;</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {item.avatarUrl ? <ResponsiveImage src={item.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : null}
            <span className="text-sm font-semibold text-neutral-900">{item.author}</span>
          </div>
          {items.length > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-6 rounded-full transition-colors ${i === index ? 'bg-neutral-900' : 'bg-neutral-300'}`}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-neutral-400">Add a testimonial block</p>
      )}
    </section>
  );
}
