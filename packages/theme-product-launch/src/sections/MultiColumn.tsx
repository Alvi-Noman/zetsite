import { Fragment } from 'react';
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
  // The desktop column width is an arbitrary computed value (from merchant
  // settings), so it can't become a static Tailwind class — hence the CSS
  // custom property below, read only at sm+ via a *static* arbitrary-value
  // class (`sm:flex-[0_1_var(--item-basis)]`, which Tailwind's scanner can
  // see regardless of what the variable's runtime value is). Below sm, no
  // flex-basis is set at all, so `w-full` naturally stacks items full-width
  // — flex-wrap + a fixed flex-basis (rather than CSS grid) so an incomplete
  // last row still centers itself instead of hugging the left edge.
  const itemVars = { '--item-basis': `calc((100% - ${gap * (columnCount - 1)}px) / ${columnCount})` } as React.CSSProperties;
  const itemClass = 'w-full sm:w-auto sm:flex-[0_1_var(--item-basis)]';

  return (
    <section className={`px-6 py-10 mx-auto ${widthClass(settings.width, 'max-w-5xl')}`}>
      <div className={`flex flex-col mb-10 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      {/* Mobile: stacked cards connected by a short vertical line, matching
          the same "top to bottom" treatment as ProblemSolution/HowItWorks.
          Desktop (sm+): unchanged flex-wrap grid. */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center" style={{ gap }}>
        {columnBlocks.map((block, i) => {
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
          const connector =
            i < columnBlocks.length - 1 ? (
              <div key={`${block.id}-connector`} className="relative flex h-6 items-center justify-center sm:hidden" aria-hidden="true">
                <span className="h-full w-px bg-neutral-300" />
              </div>
            ) : null;
          return (
            <Fragment key={block.id}>
              {col.linkUrl ? (
                <a href={col.linkUrl} className={`hover:opacity-80 transition-opacity ${itemClass}`} style={itemVars}>
                  {content}
                </a>
              ) : (
                <div className={itemClass} style={itemVars}>
                  {content}
                </div>
              )}
              {connector}
            </Fragment>
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
