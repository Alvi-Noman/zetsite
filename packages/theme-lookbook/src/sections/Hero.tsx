import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  WIDTH_FIELD,
  widthClass,
  MOBILE_IMAGE_FIELD,
  MOBILE_ALIGN_FIELD,
  HEIGHT_FIELD,
  HEIGHT_CLASS,
  VERTICAL_ALIGN_FIELD,
  VERTICAL_ALIGN_CLASS,
  IMAGE_BEHAVIOR_FIELD,
  AMBIENT_ZOOM_KEYFRAMES,
  ambientZoomStyle,
  SHOW_TEXT_BACKDROP_FIELD,
  TEXT_BACKDROP_CLASS,
  ALIGN_CLASS,
  backgroundImageSet,
  type ContentAlign,
  type ContentWidth,
  type SectionHeight,
  type VerticalAlign,
} from '@zetsite/theme-kit';

export interface HeroSettings {
  imageUrl: string;
  mobileImageUrl: string;
  badgeText: string;
  backgroundColor: string;
  overlayOpacity: number;
  textAlign: ContentAlign;
  mobileAlign: ContentAlign;
  verticalAlign: VerticalAlign;
  width: ContentWidth;
  height: SectionHeight;
  imageBehavior: 'none' | 'ambient';
  showTextBackdrop: boolean;
}

export const heroSchema: SectionSchema = {
  type: 'hero',
  label: 'Hero banner',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Welcome to our store', size: 'lg' } },
    { type: 'text', settings: { content: 'Shop the latest arrivals' } },
    { type: 'button', settings: { text: 'Buy now', url: '#order' } },
  ],
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Background image', default: '', tab: 'content' },
    MOBILE_IMAGE_FIELD,
    { key: 'badgeText', type: 'text', label: 'Eyebrow badge (optional)', default: 'New arrival', tab: 'content' },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#f5f5f5', tab: 'style' },
    { key: 'overlayOpacity', type: 'number', label: 'Image overlay opacity (0-1)', default: 0.35, tab: 'style' },
    {
      key: 'textAlign',
      type: 'select',
      label: 'Content position (horizontal)',
      default: 'center',
      tab: 'style',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    VERTICAL_ALIGN_FIELD,
    MOBILE_ALIGN_FIELD,
    IMAGE_BEHAVIOR_FIELD,
    SHOW_TEXT_BACKDROP_FIELD,
    WIDTH_FIELD,
    HEIGHT_FIELD,
  ],
  defaultSettings: {
    imageUrl: '',
    mobileImageUrl: '',
    badgeText: 'New arrival',
    backgroundColor: '#f5f5f5',
    overlayOpacity: 0.35,
    textAlign: 'center',
    mobileAlign: 'center',
    verticalAlign: 'middle',
    width: 'page',
    height: 'medium',
    imageBehavior: 'none',
    showTextBackdrop: false,
  },
};

export function Hero({ settings, renderBlocks }: SectionComponentProps<HeroSettings>) {
  const desktopAlign = (ALIGN_CLASS[settings.textAlign] ?? ALIGN_CLASS.center)
    .split(' ')
    .map((c) => `md:${c}`)
    .join(' ');
  const mobileAlign = ALIGN_CLASS[settings.mobileAlign ?? 'center'] ?? ALIGN_CLASS.center;
  const verticalClass = VERTICAL_ALIGN_CLASS[settings.verticalAlign ?? 'middle'] ?? VERTICAL_ALIGN_CLASS.middle;
  const overlay = `linear-gradient(rgba(0,0,0,${settings.overlayOpacity}), rgba(0,0,0,${settings.overlayOpacity}))`;
  const zoomStyle = ambientZoomStyle(settings.imageBehavior);

  return (
    <section
      className={`relative flex flex-col ${verticalClass} gap-4 overflow-hidden px-6 py-10 ${mobileAlign} ${desktopAlign} ${HEIGHT_CLASS[settings.height ?? 'medium']}`}
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {zoomStyle ? <style>{AMBIENT_ZOOM_KEYFRAMES}</style> : null}
      {settings.imageUrl ? (
        <div
          className={`absolute inset-0 ${settings.mobileImageUrl ? 'hidden md:block' : ''}`}
          style={{ backgroundImage: `${overlay}, ${backgroundImageSet(settings.imageUrl)}`, backgroundSize: 'cover', backgroundPosition: 'center', ...zoomStyle }}
        />
      ) : null}
      {settings.mobileImageUrl ? (
        <div
          className="absolute inset-0 md:hidden"
          style={{ backgroundImage: `${overlay}, ${backgroundImageSet(settings.mobileImageUrl)}`, backgroundSize: 'cover', backgroundPosition: 'center', ...zoomStyle }}
        />
      ) : null}
      <div
        className={`relative w-full ${widthClass(settings.width, 'max-w-2xl mx-auto')} ${settings.showTextBackdrop ? TEXT_BACKDROP_CLASS : ''}`}
        style={settings.imageUrl ? { color: '#fff' } : undefined}
      >
        {settings.badgeText ? (
          <span className="mb-1 inline-block rounded-full bg-stone-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {settings.badgeText}
          </span>
        ) : null}
        {renderBlocks?.()}
      </div>
    </section>
  );
}
