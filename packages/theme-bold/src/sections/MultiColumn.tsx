import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, WIDTH_FIELD, gapField, ALIGN_CLASS, widthClass, ICON_MAP, ResponsiveImage, type ContentAlign, type ContentWidth } from '@zetsite/theme-kit';

export interface MultiColumnSettings {
  columns: number;
  align: ContentAlign;
  width: ContentWidth;
  gap: number;
  imageShape: 'circle' | 'square';
  buttonText: string;
  buttonUrl: string;
}

export const multiColumnSchema: SectionSchema = {
  type: 'multiColumn',
  label: 'Multi-column',
  allowedBlockTypes: ['heading', 'column'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Why choose us', size: 'md' } },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
    { type: 'column', settings: {} },
  ],
  fields: [
    { key: 'buttonText', type: 'text', label: 'Button text (optional)', default: '', tab: 'content' },
    { key: 'buttonUrl', type: 'url', label: 'Button link', default: '', tab: 'content' },
    { key: 'columns', type: 'number', label: 'Columns', default: 3, tab: 'style' },
    {
      key: 'imageShape',
      type: 'select',
      label: 'Image shape',
      default: 'square',
      tab: 'style',
      options: [
        { label: 'Circle', value: 'circle' },
        { label: 'Square', value: 'square' },
      ],
    },
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(1),
  ],
  defaultSettings: { columns: 3, align: 'center', width: 'page', gap: 1, imageShape: 'square', buttonText: '', buttonUrl: '' },
};

interface ColumnData {
  mediaType?: 'image' | 'icon';
  imageUrl?: string;
  iconName?: string;
  heading?: string;
  text?: string;
  linkUrl?: string;
}

export function MultiColumn({ settings, blocks, renderBlocks }: SectionComponentProps<MultiColumnSettings>) {
  const columns = (blocks ?? []).filter((b) => b.type === 'column').map((b) => b.settings as ColumnData);
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  return (
    <section className={`px-6 py-20 mx-auto bg-white ${widthClass(settings.width, 'max-w-5xl')}`}>
      <div className={`flex flex-col mb-12 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div
        className="grid bg-black border border-black"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, settings.columns || 3)}, minmax(0, 1fr))`, gap: settings.gap ?? 1 }}
      >
        {columns.map((col, i) => {
          const Icon = col.iconName ? ICON_MAP[col.iconName] : undefined;
          const content = (
            <div className="text-center bg-white p-6 h-full">
              {col.mediaType === 'image' && col.imageUrl ? (
                <ResponsiveImage
                  src={col.imageUrl}
                  alt=""
                  className={`mx-auto mb-4 h-16 w-16 object-cover ${settings.imageShape === 'circle' ? 'rounded-full' : ''}`}
                />
              ) : col.mediaType !== 'image' && Icon ? (
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-black text-white">
                  <Icon size={22} />
                </div>
              ) : null}
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900">{col.heading}</h3>
              {col.text ? <p className="mt-2 text-sm text-neutral-600">{col.text}</p> : null}
            </div>
          );
          return col.linkUrl ? (
            <a key={i} href={col.linkUrl} className="hover:opacity-80 transition-opacity">
              {content}
            </a>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>
      {settings.buttonText ? (
        <div className={`mt-10 flex ${settings.align === 'left' ? 'justify-start' : settings.align === 'right' ? 'justify-end' : 'justify-center'}`}>
          <a
            href={settings.buttonUrl || '/'}
            className="inline-block bg-black px-6 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
          >
            {settings.buttonText}
          </a>
        </div>
      ) : null}
    </section>
  );
}
