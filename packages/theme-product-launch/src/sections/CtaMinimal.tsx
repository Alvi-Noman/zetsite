import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface CtaMinimalSettings {}

export const ctaMinimalSchema: SectionSchema = {
  type: 'ctaMinimal',
  label: 'Final CTA (minimal text-link)',
  allowedBlockTypes: ['heading', 'text', 'button'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Ready to get started?', size: 'sm' } },
    { type: 'button', settings: { text: 'Buy now →', url: '#order' } },
  ],
  fields: [],
  defaultSettings: {},
};

export function CtaMinimal({ renderBlocks }: SectionComponentProps<CtaMinimalSettings>) {
  return (
    <section className="px-6 py-10 text-center">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-2 [&_a]:!bg-transparent [&_a]:!p-0 [&_a]:!text-sm [&_a]:!font-semibold [&_a]:!text-yellow-800 [&_a]:!shadow-none [&_a]:hover:!underline">
        {renderBlocks?.()}
      </div>
    </section>
  );
}
