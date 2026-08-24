import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface ProofLogosSettings {
  label: string;
}

export const proofLogosSchema: SectionSchema = {
  type: 'proofLogos',
  label: 'Rating badge (press logos)',
  allowedBlockTypes: ['logoImage'],
  defaultBlocks: [
    { type: 'logoImage', settings: {} },
    { type: 'logoImage', settings: {} },
    { type: 'logoImage', settings: {} },
    { type: 'logoImage', settings: {} },
  ],
  fields: [{ key: 'label', type: 'text', label: 'Label', default: 'As seen in', tab: 'content' }],
  defaultSettings: { label: 'As seen in' },
};

export function ProofLogos({ settings, blocks, renderBlocks }: SectionComponentProps<ProofLogosSettings>) {
  if (!blocks?.length) return null;
  return (
    <div className="px-4 py-5 text-center">
      {settings.label ? <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{settings.label}</p> : null}
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-70 grayscale">
        {renderBlocks?.()}
      </div>
    </div>
  );
}
