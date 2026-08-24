import { Play } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';

export interface TestimonialsVideoSettings {
  videoThumbnailUrl: string;
}

export const testimonialsVideoSchema: SectionSchema = {
  type: 'testimonialsVideo',
  label: 'Testimonials (video)',
  allowedBlockTypes: ['testimonial'],
  defaultBlocks: [{ type: 'testimonial', settings: {} }],
  fields: [{ key: 'videoThumbnailUrl', type: 'image', label: 'Video thumbnail', default: '', tab: 'content' }],
  defaultSettings: { videoThumbnailUrl: '' },
};

interface TestimonialData {
  quote?: string;
  author?: string;
}

export function TestimonialsVideo({ settings, blocks }: SectionComponentProps<TestimonialsVideoSettings>) {
  const item = (blocks ?? []).find((b) => b.type === 'testimonial')?.settings as TestimonialData | undefined;
  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-neutral-200">
          {settings.videoThumbnailUrl ? <ResponsiveImage src={settings.videoThumbnailUrl} alt="" className="h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-900">
              <Play size={16} fill="currentColor" />
            </span>
          </div>
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
