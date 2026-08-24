export type VideoSource = { type: 'youtube'; id: string } | { type: 'vimeo'; id: string } | { type: 'file' };

export function parseVideoUrl(url: string): VideoSource {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (youtube) return { type: 'youtube', id: youtube[1] };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: 'vimeo', id: vimeo[1] };
  return { type: 'file' };
}

export function videoEmbedUrl(source: VideoSource, opts: { autoplay?: boolean; loop?: boolean; muted?: boolean } = {}): string | null {
  if (source.type === 'youtube') {
    const params = new URLSearchParams({
      autoplay: opts.autoplay ? '1' : '0',
      mute: opts.muted ? '1' : '0',
      loop: opts.loop ? '1' : '0',
      playlist: opts.loop ? source.id : '',
      rel: '0',
    });
    return `https://www.youtube.com/embed/${source.id}?${params.toString()}`;
  }
  if (source.type === 'vimeo') {
    const params = new URLSearchParams({
      autoplay: opts.autoplay ? '1' : '0',
      muted: opts.muted ? '1' : '0',
      loop: opts.loop ? '1' : '0',
    });
    return `https://player.vimeo.com/video/${source.id}?${params.toString()}`;
  }
  return null;
}

export function youtubeThumbnail(source: VideoSource): string | null {
  return source.type === 'youtube' ? `https://img.youtube.com/vi/${source.id}/hqdefault.jpg` : null;
}
