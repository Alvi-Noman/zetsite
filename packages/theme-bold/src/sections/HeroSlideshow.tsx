import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  ALIGN_FIELD,
  WIDTH_FIELD,
  HEIGHT_FIELD,
  HEIGHT_CLASS,
  ALIGN_CLASS,
  widthClass,
  IMAGE_BEHAVIOR_FIELD,
  AMBIENT_ZOOM_KEYFRAMES,
  ambientZoomStyle,
  backgroundImageSet,
  type ContentAlign,
  type ContentWidth,
  type SectionHeight,
} from '@zetsite/theme-kit';

export interface HeroSlideshowSettings {
  intervalSeconds: number;
  align: ContentAlign;
  width: ContentWidth;
  height: SectionHeight;
  transition: 'slide' | 'fade';
  showArrows: boolean;
  pauseOnHover: boolean;
  autoplay: boolean;
  indicatorStyle: 'dots' | 'counter' | 'numbers';
  imageBehavior: 'none' | 'ambient';
}

export const heroSlideshowSchema: SectionSchema = {
  type: 'heroSlideshow',
  label: 'Hero slideshow',
  allowedBlockTypes: ['slide'],
  defaultBlocks: [{ type: 'slide', settings: {} }],
  fields: [
    { key: 'intervalSeconds', type: 'number', label: 'Slide interval (seconds)', default: 5, tab: 'style' },
    {
      key: 'transition',
      type: 'select',
      label: 'Transition style',
      default: 'slide',
      tab: 'style',
      options: [
        { label: 'Slide', value: 'slide' },
        { label: 'Fade', value: 'fade' },
      ],
    },
    {
      key: 'indicatorStyle',
      type: 'select',
      label: 'Slide indicator style',
      default: 'dots',
      tab: 'style',
      options: [
        { label: 'Dots', value: 'dots' },
        { label: 'Counter (1 / 5)', value: 'counter' },
        { label: 'Number only', value: 'numbers' },
      ],
    },
    IMAGE_BEHAVIOR_FIELD,
    ALIGN_FIELD,
    WIDTH_FIELD,
    HEIGHT_FIELD,
    { key: 'showArrows', type: 'boolean', label: 'Show navigation arrows', default: true, tab: 'advanced' },
    { key: 'pauseOnHover', type: 'boolean', label: 'Pause autoplay on hover', default: true, tab: 'advanced' },
    { key: 'autoplay', type: 'boolean', label: 'Autoplay', default: true, tab: 'advanced' },
  ],
  defaultSettings: {
    intervalSeconds: 5,
    align: 'center',
    width: 'page',
    height: 'large',
    transition: 'slide',
    showArrows: true,
    pauseOnHover: true,
    autoplay: true,
    indicatorStyle: 'dots',
    imageBehavior: 'none',
  },
};

interface SlideData {
  imageUrl?: string;
  mobileImageUrl?: string;
  heading?: string;
  subheading?: string;
  buttonText?: string;
  buttonUrl?: string;
}

const FALLBACK: SlideData = { heading: 'New arrivals', buttonText: 'Shop now', buttonUrl: '/' };

function SlideMedia({ slide, imageBehavior }: { slide: SlideData; imageBehavior: string | undefined }) {
  if (!slide.imageUrl) return null;
  const overlay = 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55))';
  const zoomStyle = ambientZoomStyle(imageBehavior);
  return (
    <>
      <div
        className={`absolute inset-0 ${slide.mobileImageUrl ? 'hidden md:block' : ''}`}
        style={{ backgroundImage: `${overlay}, ${backgroundImageSet(slide.imageUrl)}`, backgroundSize: 'cover', backgroundPosition: 'center', ...zoomStyle }}
      />
      {slide.mobileImageUrl ? (
        <div
          className="absolute inset-0 md:hidden"
          style={{ backgroundImage: `${overlay}, ${backgroundImageSet(slide.mobileImageUrl)}`, backgroundSize: 'cover', backgroundPosition: 'center', ...zoomStyle }}
        />
      ) : null}
    </>
  );
}

function SlideContent({ slide, align, widthCls }: { slide: SlideData; align: string; widthCls: string }) {
  return (
    <div className={`relative flex h-full flex-col justify-center px-6 ${align}`}>
      <div className={`mx-auto w-full ${widthCls}`}>
        <h1 className="text-5xl font-black uppercase tracking-tight max-w-3xl leading-none">{slide.heading}</h1>
        {slide.subheading ? <p className="mt-6 text-lg max-w-xl text-neutral-300">{slide.subheading}</p> : null}
        {slide.buttonText ? (
          <a
            href={slide.buttonUrl || '/'}
            className="mt-10 inline-block px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
          >
            {slide.buttonText}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function HeroSlideshow({ settings, blocks }: SectionComponentProps<HeroSlideshowSettings>) {
  const slides = blocks?.length ? blocks.map((b) => b.settings as SlideData) : [FALLBACK];
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const widthCls = widthClass(settings.width, 'max-w-3xl mx-auto');
  const heightCls = HEIGHT_CLASS[settings.height ?? 'large'];
  const autoplay = settings.autoplay ?? true;
  const pauseOnHover = settings.pauseOnHover ?? true;
  const showArrows = (settings.showArrows ?? true) && slides.length > 1;

  useEffect(() => {
    if (!autoplay || slides.length < 2 || (pauseOnHover && hovering)) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), (settings.intervalSeconds || 5) * 1000);
    return () => clearInterval(timer);
  }, [autoplay, pauseOnHover, hovering, slides.length, settings.intervalSeconds]);

  function goTo(i: number) {
    setIndex((i + slides.length) % slides.length);
  }

  return (
    <section
      className={`relative overflow-hidden bg-black text-white ${heightCls}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {settings.imageBehavior === 'ambient' ? <style>{AMBIENT_ZOOM_KEYFRAMES}</style> : null}
      {settings.transition === 'fade' ? (
        slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
            <SlideMedia slide={slide} imageBehavior={settings.imageBehavior} />
            <SlideContent slide={slide} align={align} widthCls={widthCls} />
          </div>
        ))
      ) : (
        <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, i) => (
            <div key={i} className="relative h-full w-full shrink-0 overflow-hidden">
              <SlideMedia slide={slide} imageBehavior={settings.imageBehavior} />
              <SlideContent slide={slide} align={align} widthCls={widthCls} />
            </div>
          ))}
        </div>
      )}

      {showArrows ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 border border-white/40 p-2 text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 border border-white/40 p-2 text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </>
      ) : null}

      {slides.length > 1 && settings.indicatorStyle === 'counter' ? (
        <div className="absolute bottom-6 right-6 z-10 border border-white/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
          {index + 1} / {slides.length}
        </div>
      ) : slides.length > 1 && settings.indicatorStyle === 'numbers' ? (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`flex h-7 w-7 items-center justify-center text-xs font-bold transition-colors ${i === index ? 'bg-white text-black' : 'border border-white/40 text-white'}`}
              aria-label={`Go to slide ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : (
        slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1 w-8 transition-colors ${i === index ? 'bg-white' : 'bg-white/30'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )
      )}
    </section>
  );
}
