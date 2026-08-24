import { Star } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, ALIGN_CLASS, type ContentAlign } from '@zetsite/theme-kit';

export interface RatingBadgeSettings {
  rating: number;
  reviewCount: number;
  label: string;
  align: ContentAlign;
}

export const ratingBadgeSchema: SectionSchema = {
  type: 'ratingBadge',
  label: 'Rating badge',
  fields: [
    { key: 'rating', type: 'number', label: 'Rating (out of 5)', default: 4.9, tab: 'content' },
    { key: 'reviewCount', type: 'number', label: 'Review count', default: 2000, tab: 'content' },
    { key: 'label', type: 'text', label: 'Label', default: 'from verified buyers', tab: 'content' },
    ALIGN_FIELD,
  ],
  defaultSettings: { rating: 4.9, reviewCount: 2000, label: 'from verified buyers', align: 'center' },
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+`;
  return `${n}+`;
}

export function RatingBadge({ settings }: SectionComponentProps<RatingBadgeSettings>) {
  const rating = Math.max(0, Math.min(5, settings.rating ?? 4.9));
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  return (
    <div className={`flex flex-col gap-1.5 px-4 pb-4 ${align}`}>
      <div className="inline-flex items-center gap-2 self-center rounded-full bg-teal-50 px-4 py-2 ring-1 ring-teal-100">
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={15}
              className={i < Math.round(rating) ? 'fill-amber-500 text-amber-500' : 'fill-neutral-200 text-neutral-200'}
            />
          ))}
        </span>
        <span className="text-sm font-bold text-teal-900">{rating.toFixed(1)}</span>
        <span className="text-xs font-medium text-teal-700">
          · {formatCount(settings.reviewCount ?? 2000)} {settings.label || 'from verified buyers'}
        </span>
      </div>
    </div>
  );
}
