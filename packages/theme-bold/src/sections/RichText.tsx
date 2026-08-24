import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import {
  ALIGN_FIELD,
  WIDTH_FIELD,
  gapField,
  ALIGN_CLASS,
  widthClass,
  VERTICAL_ALIGN_FIELD,
  IMAGE_BEHAVIOR_FIELD,
  AMBIENT_ZOOM_KEYFRAMES,
  ambientZoomStyle,
  type ContentAlign,
  type ContentWidth,
  type VerticalAlign,
} from '@zetsite/theme-kit';

export interface RichTextSettings {
  imagePosition: 'left' | 'right' | 'none';
  backgroundColor: string;
  align: ContentAlign;
  width: ContentWidth;
  gap: number;
  imageFirstOnMobile: boolean;
  eyebrow: string;
  verticalAlign: VerticalAlign;
  imageBehavior: 'none' | 'ambient';
}

const ROW_ALIGN_CLASS: Record<VerticalAlign, string> = {
  top: 'items-start',
  middle: 'items-center',
  bottom: 'items-end',
};

export const richTextSchema: SectionSchema = {
  type: 'richText',
  label: 'Rich text / image',
  allowedBlockTypes: ['heading', 'text', 'image', 'video', 'divider'],
  defaultBlocks: [
    { type: 'heading', settings: { text: 'Our story', size: 'md' } },
    { type: 'text', settings: { content: 'Tell your brand story here.' } },
  ],
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Eyebrow text (shown above heading)', default: '', tab: 'content' },
    {
      key: 'imagePosition',
      type: 'select',
      label: 'Image position',
      default: 'right',
      tab: 'style',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
        { label: 'None', value: 'none' },
      ],
    },
    { key: 'backgroundColor', type: 'color', label: 'Background color', default: '#ffffff', tab: 'style' },
    { ...VERTICAL_ALIGN_FIELD, label: 'Content position (vertical)' },
    IMAGE_BEHAVIOR_FIELD,
    ALIGN_FIELD,
    WIDTH_FIELD,
    gapField(48),
    { key: 'imageFirstOnMobile', type: 'boolean', label: 'Show image first on mobile', default: true, tab: 'advanced' },
  ],
  defaultSettings: {
    imagePosition: 'right',
    backgroundColor: '#ffffff',
    align: 'left',
    width: 'page',
    gap: 48,
    imageFirstOnMobile: true,
    eyebrow: '',
    verticalAlign: 'middle',
    imageBehavior: 'none',
  },
};

export function RichText({ settings, blocks, renderBlocks }: SectionComponentProps<RichTextSettings>) {
  const hasImage = settings.imagePosition !== 'none' && blocks?.some((b) => b.type === 'image');
  const imageFirst = settings.imagePosition === 'left';
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.left;
  const imageFirstOnMobile = settings.imageFirstOnMobile ?? true;
  const mobileTextOrder = imageFirstOnMobile ? 'order-last' : 'order-first';
  const mobileImageOrder = imageFirstOnMobile ? 'order-first' : 'order-last';
  const rowAlign = ROW_ALIGN_CLASS[settings.verticalAlign ?? 'middle'] ?? ROW_ALIGN_CLASS.middle;
  const zoomStyle = ambientZoomStyle(settings.imageBehavior);

  const textBlock = (
    <div className={`flex-1 space-y-5 flex flex-col ${align} ${hasImage ? `${mobileTextOrder} md:order-none` : ''}`}>
      {settings.eyebrow ? (
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{settings.eyebrow}</span>
      ) : null}
      {renderBlocks?.((b) => b.type !== 'image')}
    </div>
  );

  const imageBlock = hasImage ? (
    <div className={`flex-1 overflow-hidden ${mobileImageOrder} md:order-none`} style={zoomStyle}>
      {renderBlocks?.((b) => b.type === 'image')}
    </div>
  ) : null;

  return (
    <section className={`px-6 py-20 mx-auto bg-white ${widthClass(settings.width, 'max-w-5xl')}`}>
      {zoomStyle ? <style>{AMBIENT_ZOOM_KEYFRAMES}</style> : null}
      <div className={`flex flex-col md:flex-row ${rowAlign}`} style={{ gap: settings.gap ?? 48 }}>
        {hasImage && imageFirst ? imageBlock : null}
        {textBlock}
        {hasImage && !imageFirst ? imageBlock : null}
      </div>
    </section>
  );
}
