import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, WIDTH_FIELD, gapField, ALIGN_CLASS, widthClass, ICON_MAP, Editable, ResponsiveImage, type ContentAlign, type ContentWidth } from '@zetsite/theme-kit';

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
      default: 'circle',
      tab: 'style',
      options: [
        { label: 'Circle', value: 'circle' },
        { label: 'Square', value: 'square' },
      ],
    },
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(32),
  ],
  defaultSettings: { columns: 3, align: 'center', width: 'page', gap: 32, imageShape: 'circle', buttonText: '', buttonUrl: '' },
};

interface ColumnData {
  mediaType?: 'image' | 'icon';
  imageUrl?: string;
  iconName?: string;
  heading?: string;
  text?: string;
  linkUrl?: string;
}

export function MultiColumn({ settings, blocks, renderBlocks, onBlockFieldChange }: SectionComponentProps<MultiColumnSettings>) {
  const columnBlocks = (blocks ?? []).filter((b) => b.type === 'column');
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;

  const columnCount = Math.max(1, settings.columns || 3);
  const gap = settings.gap ?? 32;
  // flex-wrap + a fixed flex-basis per item (rather than CSS grid) so an
  // incomplete last row centers itself instead of hugging the left edge —
  // grid would otherwise always fill rows left-to-right regardless of the
  // section's alignment setting.
  const itemStyle = { flex: `0 1 calc((100% - ${gap * (columnCount - 1)}px) / ${columnCount})` };

  return (
    <section className={`px-6 py-10 mx-auto ${widthClass(settings.width, 'max-w-5xl')}`}>
      <div className={`flex flex-col mb-10 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      <div className="flex flex-wrap justify-center" style={{ gap }}>
        {columnBlocks.map((block) => {
          const col = block.settings as ColumnData;
          const Icon = col.iconName ? ICON_MAP[col.iconName] : undefined;
          const fieldChange = onBlockFieldChange ? (key: string, value: string) => onBlockFieldChange(block.id, key, value) : undefined;
          const content = (
            <div className="text-center">
              {col.mediaType === 'image' && col.imageUrl ? (
                <ResponsiveImage
                  src={col.imageUrl}
                  alt=""
                  className={`mx-auto mb-4 h-16 w-16 object-cover ${settings.imageShape === 'square' ? 'rounded-md' : 'rounded-full'}`}
                />
              ) : col.mediaType !== 'image' && Icon ? (
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                  <Icon size={24} />
                </div>
              ) : null}
              <Editable as="h3" fieldKey="heading" value={col.heading ?? ''} onFieldChange={fieldChange} className="text-base font-bold text-neutral-900 block" />
              {col.text || fieldChange ? (
                <Editable as="p" fieldKey="text" value={col.text ?? ''} onFieldChange={fieldChange} html multiline className="prose prose-neutral mt-2 text-sm text-neutral-600" />
              ) : null}
            </div>
          );
          return col.linkUrl ? (
            <a key={block.id} href={col.linkUrl} className="hover:opacity-80 transition-opacity" style={itemStyle}>
              {content}
            </a>
          ) : (
            <div key={block.id} style={itemStyle}>
              {content}
            </div>
          );
        })}
      </div>
      {settings.buttonText ? (
        <div className={`mt-10 flex ${settings.align === 'left' ? 'justify-start' : settings.align === 'right' ? 'justify-end' : 'justify-center'}`}>
          <a
            href={settings.buttonUrl || '/'}
            className="inline-block rounded-md bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-yellow-800 transition-colors"
          >
            {settings.buttonText}
          </a>
        </div>
      ) : null}
    </section>
  );
}
