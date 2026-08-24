import { Camera, Gem, Heart, Shield, Star, Zap } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import type { FeatureCardColor, FeatureCardIcon, FeatureCardSettings } from '../blocks/FeatureCard.js';

export interface FeatureCardsSettings {
  backgroundColor: string;
}

export const featureCardsSchema: SectionSchema = {
  type: 'featureCards',
  label: 'Feature cards',
  allowedBlockTypes: ['featureCard'],
  defaultBlocks: [
    { type: 'featureCard', settings: { icon: 'shield', title: 'Maximum protection', subtitle: 'Military-grade drop protection', color: 'green' } },
    { type: 'featureCard', settings: { icon: 'gem', title: 'Premium finish', subtitle: 'Soft-touch matte texture', color: 'blue' } },
    { type: 'featureCard', settings: { icon: 'zap', title: 'Fast charging ready', subtitle: 'Wireless charging compatible', color: 'orange' } },
    { type: 'featureCard', settings: { icon: 'camera', title: 'Camera safe', subtitle: 'Raised bezel & lens guard', color: 'purple' } },
  ],
  fields: [{ key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' }],
  defaultSettings: { backgroundColor: '#ffffff' },
};

const ICONS: Record<FeatureCardIcon, typeof Shield> = {
  shield: Shield,
  gem: Gem,
  zap: Zap,
  camera: Camera,
  heart: Heart,
  star: Star,
};

const CARD_CLASS: Record<FeatureCardColor, string> = {
  green: 'bg-emerald-50 border-emerald-100',
  blue: 'bg-indigo-50 border-indigo-100',
  orange: 'bg-amber-50 border-amber-100',
  purple: 'bg-purple-50 border-purple-100',
};

const TITLE_CLASS: Record<FeatureCardColor, string> = {
  green: 'text-emerald-600',
  blue: 'text-indigo-600',
  orange: 'text-amber-600',
  purple: 'text-purple-600',
};

export function FeatureCards({ settings, blocks }: SectionComponentProps<FeatureCardsSettings>) {
  const cards = (blocks?.length ? blocks.map((b) => b.settings as unknown as FeatureCardSettings) : []) as FeatureCardSettings[];

  if (!cards.length) return null;

  return (
    <div className="px-4 py-12 sm:py-16" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        {cards.map((card, i) => {
          const Icon = ICONS[card.icon] ?? Shield;
          return (
            <div
              key={i}
              className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 sm:items-start sm:text-left ${CARD_CLASS[card.color] ?? CARD_CLASS.green}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                <Icon size={22} className={TITLE_CLASS[card.color] ?? TITLE_CLASS.green} />
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-bold leading-tight ${TITLE_CLASS[card.color] ?? TITLE_CLASS.green}`}>{card.title}</p>
                <p className="mt-1 text-xs font-medium leading-snug text-neutral-500">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
