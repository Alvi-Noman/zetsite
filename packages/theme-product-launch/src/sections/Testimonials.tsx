import { useEffect, useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { WIDTH_FIELD, widthClass, Editable, ALIGN_FIELD, ALIGN_CLASS, ResponsiveImage, type ContentWidth, type ContentAlign } from '@zetsite/theme-kit';

export interface TestimonialsSettings {
  width: ContentWidth;
  autoplay: boolean;
  autoplaySeconds: number;
  align: ContentAlign;
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
    ALIGN_FIELD,
  ],
  defaultSettings: { width: 'page', autoplay: false, autoplaySeconds: 5, align: 'center' },
};

interface TestimonialData {
  quote?: string;
  author?: string;
  rating?: number;
  avatarUrl?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-yellow-600 text-sm mb-2">{'★'.repeat(Math.max(0, Math.min(5, rating))).padEnd(5, '☆')}</div>
  );
}

export function Testimonials({ settings, blocks, renderBlocks, onBlockFieldChange }: SectionComponentProps<TestimonialsSettings>) {
  const items = (blocks ?? []).filter((b) => b.type === 'testimonial');
  const [index, setIndex] = useState(0);
  const block = items[index];
  const item = block?.settings as TestimonialData | undefined;
  const fieldChange = onBlockFieldChange && block ? (key: string, value: string) => onBlockFieldChange(block.id, key, value) : undefined;

  useEffect(() => {
    if (!settings.autoplay || items.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), (settings.autoplaySeconds || 5) * 1000);
    return () => clearInterval(timer);
  }, [settings.autoplay, settings.autoplaySeconds, items.length]);

  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  return (
    <section className={`px-6 py-10 mx-auto flex flex-col ${align} ${widthClass(settings.width, 'max-w-3xl')}`}>
      <div className="mb-10">{renderBlocks?.((b) => b.type === 'heading')}</div>
      {item ? (
        <>
          <Stars rating={item.rating ?? 5} />
          <Editable
            as="p"
            fieldKey="quote"
            value={item.quote ?? ''}
            onFieldChange={fieldChange}
            html
            multiline
            className="prose prose-neutral text-lg text-neutral-700 italic before:content-['\201C'] after:content-['\201D']"
          />
          <div className={`mt-4 flex items-center gap-2 ${settings.align === 'left' ? 'justify-start' : settings.align === 'right' ? 'justify-end' : 'justify-center'}`}>
            {item.avatarUrl ? <ResponsiveImage src={item.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : null}
            <Editable as="span" fieldKey="author" value={item.author ?? ''} onFieldChange={fieldChange} className="text-sm font-semibold text-neutral-900 block" />
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
