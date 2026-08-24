import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ICON_MAP, ResponsiveImage } from '@zetsite/theme-kit';

export interface FeaturesRowsSettings {
  width: 'page' | 'wide' | 'full';
}

export const featuresRowsSchema: SectionSchema = {
  type: 'featuresRows',
  label: 'Features & benefits (rows)',
  allowedBlockTypes: ['heading', 'column'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Why choose us', size: 'md' } },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
  ],
  fields: [],
  defaultSettings: { width: 'page' },
};

interface ColumnData {
  mediaType?: 'image' | 'icon';
  imageUrl?: string;
  iconName?: string;
  heading?: string;
  text?: string;
}

export function FeaturesRows({ blocks, renderBlocks }: SectionComponentProps<FeaturesRowsSettings>) {
  const columns = (blocks ?? []).filter((b) => b.type === 'column').map((b) => b.settings as ColumnData);
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-10 text-center">{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-col gap-10">
        {columns.map((col, i) => {
          const Icon = col.iconName ? ICON_MAP[col.iconName] : undefined;
          const reverse = i % 2 === 1;
          return (
            <div key={i} className={`flex items-center gap-6 ${reverse ? 'flex-row-reverse' : ''}`}>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                {col.mediaType === 'image' && col.imageUrl ? (
                  <ResponsiveImage src={col.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : Icon ? (
                  <Icon size={28} className="text-neutral-900" />
                ) : null}
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">{col.heading}</h3>
                {col.text ? <p className="mt-1 text-sm text-neutral-600">{col.text}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
