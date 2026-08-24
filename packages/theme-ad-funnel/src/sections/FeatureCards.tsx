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
    { type: 'featureCard', settings: { icon: 'gem', title: 'Premium finish', subtitle: 'Leather & matte texture', color: 'blue' } },
    { type: 'featureCard', settings: { icon: 'zap', title: 'MagSafe support', subtitle: 'Fast wireless charging', color: 'orange' } },
    { type: 'featureCard', settings: { icon: 'camera', title: 'Camera safety', subtitle: 'Raised bezel & lens guard', color: 'purple' } },
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

// Exact pastel palette from the reference design (cover-cards-container).
const CARD_CLASS: Record<FeatureCardColor, string> = {
  green: 'bg-[#e8f5e9] border-[#c8e6c9]',
  blue: 'bg-[#f0f4ff] border-[#dbeafe]',
  orange: 'bg-[#fff8e1] border-[#ffecb3]',
  purple: 'bg-[#f3e5f5] border-[#e1bee7]',
};

const TITLE_CLASS: Record<FeatureCardColor, string> = {
  green: 'text-[#059669]',
  blue: 'text-[#2563eb]',
  orange: 'text-[#ea580c]',
  purple: 'text-[#7c3aed]',
};

export function FeatureCards({ settings, blocks }: SectionComponentProps<FeatureCardsSettings>) {
  const cards = (blocks?.length ? blocks.map((b) => b.settings as unknown as FeatureCardSettings) : []) as FeatureCardSettings[];

  if (!cards.length) return null;

  return (
    <div className="px-4 py-5" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
        {cards.map((card, i) => {
          const Icon = ICONS[card.icon] ?? Shield;
          return (
            <div
              key={i}
              className={`flex flex-col items-center rounded-2xl border p-3 text-center shadow-[0_4px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08)] sm:flex-1 sm:min-w-[220px] sm:flex-row sm:items-center sm:p-5 sm:text-left ${CARD_CLASS[card.color] ?? CARD_CLASS.green}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:h-[50px] sm:w-[50px]">
                <Icon size={20} className={TITLE_CLASS[card.color] ?? TITLE_CLASS.green} />
              </span>
              <div className="mt-2 min-w-0 sm:ml-4 sm:mt-0">
                <p className={`text-[0.9rem] font-bold leading-tight sm:text-[1.1rem] ${TITLE_CLASS[card.color] ?? TITLE_CLASS.green}`}>{card.title}</p>
                <p className="mt-0.5 text-[0.75rem] font-medium leading-snug text-[#6b7280] sm:text-[0.85rem]">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
