import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface VideoSettings {
  url: string;
}

export const videoSchema: SectionSchema = {
  type: 'video',
  label: 'Video',
  fields: [{ key: 'url', type: 'url', label: 'Video URL (mp4)', default: '', tab: 'content' }],
  defaultSettings: { url: '' },
};

export function Video({ settings }: SectionComponentProps<VideoSettings>) {
  if (!settings.url) return null;
  return <video className="w-full rounded-md" src={settings.url} controls />;
}
