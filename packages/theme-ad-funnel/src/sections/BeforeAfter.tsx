import { useState } from 'react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, WIDTH_FIELD, ALIGN_CLASS, widthClass, ResponsiveImage, type ContentAlign, type ContentWidth } from '@zetsite/theme-kit';

export interface BeforeAfterSettings {
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel: string;
  afterLabel: string;
  initialPosition: number;
  align: ContentAlign;
  width: ContentWidth;
}

export const beforeAfterSchema: SectionSchema = {
  type: 'beforeAfter',
  label: 'Before / after',
  allowedBlockTypes: ['heading'],
  fields: [
    { key: 'beforeImageUrl', type: 'image', label: 'Before image', default: '', tab: 'content' },
    { key: 'afterImageUrl', type: 'image', label: 'After image', default: '', tab: 'content' },
    { key: 'beforeLabel', type: 'text', label: 'Before label', default: 'Before', tab: 'content' },
    { key: 'afterLabel', type: 'text', label: 'After label', default: 'After', tab: 'content' },
    { key: 'initialPosition', type: 'number', label: 'Initial slider position (0-100)', default: 50, tab: 'style' },
    ALIGN_FIELD,
    WIDTH_FIELD,
  ],
  defaultSettings: {
    beforeImageUrl: '',
    afterImageUrl: '',
    beforeLabel: 'Before',
    afterLabel: 'After',
    initialPosition: 50,
    align: 'center',
    width: 'page',
  },
};

export function BeforeAfter({ settings, renderBlocks, priority }: SectionComponentProps<BeforeAfterSettings>) {
  const [split, setSplit] = useState(settings.initialPosition ?? 50);
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const widthCls = widthClass(settings.width, 'max-w-3xl');

  if (!settings.beforeImageUrl || !settings.afterImageUrl) {
    return <section className={`px-6 py-10 mx-auto text-center text-sm text-neutral-400 ${widthCls}`}>Add a before and an after image</section>;
  }

  return (
    <section className={`px-6 py-10 mx-auto ${widthCls}`}>
      <div className={`flex flex-col mb-8 ${align}`}>{renderBlocks?.()}</div>
      <div className="relative aspect-video overflow-hidden rounded-md select-none">
        <ResponsiveImage src={settings.afterImageUrl} alt={settings.afterLabel || 'After'} className="absolute inset-0 h-full w-full object-cover" priority={priority} />
        {settings.afterLabel ? (
          <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white">{settings.afterLabel}</span>
        ) : null}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
          <ResponsiveImage
            src={settings.beforeImageUrl}
            alt={settings.beforeLabel || 'Before'}
            className="h-full w-full object-cover"
            style={{ width: `${10000 / split}%`, maxWidth: 'none' }}
            priority={priority}
          />
          {settings.beforeLabel ? (
            <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white">{settings.beforeLabel}</span>
          ) : null}
        </div>
        <div className="absolute inset-y-0" style={{ left: `${split}%` }}>
          <div className="h-full w-0.5 bg-white" />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          className="absolute inset-x-0 bottom-3 mx-auto w-3/4"
        />
      </div>
    </section>
  );
}
