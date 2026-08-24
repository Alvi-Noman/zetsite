import { useState } from 'react';
import { Play, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  ALIGN_FIELD,
  WIDTH_FIELD,
  ALIGN_CLASS,
  widthClass,
  AUTOPLAY_FIELD,
  LOOP_FIELD,
  MUTED_FIELD,
  parseVideoUrl,
  videoEmbedUrl,
  youtubeThumbnail,
  ResponsiveImage,
  type ContentAlign,
  type ContentWidth,
} from '@zetsite/theme-kit';

export interface VideoBlockSettings {
  videoUrl: string;
  posterUrl: string;
  align: ContentAlign;
  width: ContentWidth;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  displayMode: 'inline' | 'lightbox';
}

export const videoBlockSchema: SectionSchema = {
  type: 'videoBlock',
  label: 'Video',
  allowedBlockTypes: ['heading'],
  fields: [
    { key: 'videoUrl', type: 'url', label: 'Video URL (mp4, YouTube, or Vimeo)', default: '', tab: 'content' },
    { key: 'posterUrl', type: 'image', label: 'Poster image (shown before playback)', default: '', tab: 'content' },
    {
      key: 'displayMode',
      type: 'select',
      label: 'Display mode',
      default: 'inline',
      tab: 'style',
      options: [
        { label: 'Inline', value: 'inline' },
        { label: 'Lightbox popup', value: 'lightbox' },
      ],
    },
    ALIGN_FIELD,
    WIDTH_FIELD,
    { ...AUTOPLAY_FIELD, default: false },
    LOOP_FIELD,
    MUTED_FIELD,
  ],
  defaultSettings: {
    videoUrl: '',
    posterUrl: '',
    align: 'center',
    width: 'page',
    autoplay: false,
    loop: true,
    muted: true,
    displayMode: 'inline',
  },
};

function VideoPlayer({ settings, autoplay }: { settings: VideoBlockSettings; autoplay: boolean }) {
  const source = parseVideoUrl(settings.videoUrl);
  const muted = autoplay ? true : (settings.muted ?? true);
  if (source.type !== 'file') {
    const embedUrl = videoEmbedUrl(source, { autoplay, loop: settings.loop ?? true, muted });
    return (
      <iframe
        className="h-full w-full"
        src={embedUrl ?? undefined}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <video
      className="h-full w-full"
      src={settings.videoUrl}
      poster={settings.posterUrl || undefined}
      autoPlay={autoplay}
      muted={muted}
      loop={settings.loop ?? true}
      controls
    />
  );
}

export function VideoBlock({ settings, renderBlocks }: SectionComponentProps<VideoBlockSettings>) {
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const autoplay = settings.autoplay ?? false;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const source = parseVideoUrl(settings.videoUrl);
  const thumbnail = settings.posterUrl || youtubeThumbnail(source) || undefined;
  const isLightbox = settings.displayMode === 'lightbox';

  return (
    <section className={`px-6 py-10 mx-auto ${widthClass(settings.width, 'max-w-4xl')}`}>
      <div className={`flex flex-col mb-8 ${align}`}>{renderBlocks?.()}</div>
      {!settings.videoUrl ? (
        <div className="aspect-video rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">
          Add a video URL
        </div>
      ) : isLightbox ? (
        <>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative block aspect-video w-full overflow-hidden rounded-md bg-neutral-900"
            aria-label="Play video"
          >
            {thumbnail ? (
              <ResponsiveImage src={thumbnail} alt="" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
            ) : null}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-neutral-900 transition-transform group-hover:scale-110">
                <Play size={24} fill="currentColor" />
              </span>
            </span>
          </button>
          {lightboxOpen ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                className="absolute right-6 top-6 text-white"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
              <div className="aspect-video w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <VideoPlayer settings={settings} autoplay />
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <VideoPlayer settings={settings} autoplay={autoplay} />
        </div>
      )}
    </section>
  );
}
