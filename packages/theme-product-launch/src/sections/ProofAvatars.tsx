import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ResponsiveImage } from '@zetsite/theme-kit';
import type { GalleryImageSettings } from '../blocks/GalleryImage.js';

export interface ProofAvatarsSettings {
  label: string;
}

export const proofAvatarsSchema: SectionSchema = {
  type: 'proofAvatars',
  label: 'Rating badge (avatar cluster)',
  allowedBlockTypes: ['galleryImage'],
  defaultBlocks: [
    { type: 'galleryImage', settings: {} },
    { type: 'galleryImage', settings: {} },
    { type: 'galleryImage', settings: {} },
    { type: 'galleryImage', settings: {} },
  ],
  fields: [{ key: 'label', type: 'text', label: 'Trust line', default: 'Trusted by 2,000+ people', tab: 'content' }],
  defaultSettings: { label: 'Trusted by 2,000+ people' },
};

export function ProofAvatars({ settings, blocks }: SectionComponentProps<ProofAvatarsSettings>) {
  const avatars = (blocks ?? []).map((b) => b.settings as unknown as GalleryImageSettings);
  return (
    <div className="flex flex-col items-center gap-2 px-4 pb-4">
      <div className="flex -space-x-3">
        {avatars.slice(0, 6).map((a, i) =>
          a.imageUrl ? (
            <ResponsiveImage key={i} src={a.imageUrl} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
          ) : (
            <div key={i} className="h-9 w-9 rounded-full border-2 border-white bg-neutral-200" />
          ),
        )}
      </div>
      {settings.label ? <p className="text-xs font-medium text-neutral-600">{settings.label}</p> : null}
    </div>
  );
}
