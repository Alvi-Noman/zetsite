import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  ALIGN_FIELD,
  WIDTH_FIELD,
  ALIGN_CLASS,
  widthClass,
  AUTOPLAY_FIELD,
  LOOP_FIELD,
  MUTED_FIELD,
  type ContentAlign,
  type ContentWidth,
} from '@zetsite/theme-kit';

export interface HeroVideoSettings {
  videoUrl: string;
  posterUrl: string;
  overlayOpacity: number;
  align: ContentAlign;
  width: ContentWidth;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

export const heroVideoSchema: SectionSchema = {
  type: 'heroVideo',
  label: 'Video hero',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'Watch our story', size: 'lg' } }],
  fields: [
    { key: 'videoUrl', type: 'url', label: 'Video URL (mp4)', default: '', tab: 'content' },
    { key: 'posterUrl', type: 'image', label: 'Poster image (shown before playback)', default: '', tab: 'content' },
    { key: 'overlayOpacity', type: 'number', label: 'Overlay opacity (0-1)', default: 0.4, tab: 'style' },
    ALIGN_FIELD,
    WIDTH_FIELD,
    AUTOPLAY_FIELD,
    LOOP_FIELD,
    MUTED_FIELD,
  ],
  defaultSettings: {
    videoUrl: '',
    posterUrl: '',
    overlayOpacity: 0.4,
    align: 'center',
    width: 'page',
    autoplay: true,
    loop: true,
    muted: true,
  },
};

export function HeroVideo({ settings, renderBlocks }: SectionComponentProps<HeroVideoSettings>) {
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const autoplay = settings.autoplay ?? true;
  const muted = autoplay ? true : (settings.muted ?? true);
  return (
    <section className="relative flex flex-col justify-center gap-4 px-6 py-28 overflow-hidden bg-amber-600 text-white">
      {settings.videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={settings.videoUrl}
          poster={settings.posterUrl || undefined}
          autoPlay={autoplay}
          muted={muted}
          loop={settings.loop ?? true}
          controls={!autoplay}
          playsInline
        />
      ) : null}
      <div className="absolute inset-0 bg-black" style={{ opacity: settings.overlayOpacity }} />
      <div className={`relative flex flex-col gap-4 w-full ${align} ${widthClass(settings.width, 'max-w-2xl mx-auto')}`}>
        {renderBlocks?.()}
      </div>
    </section>
  );
}
