import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { ALIGN_FIELD, gapField, ALIGN_CLASS, ResponsiveImage, type ContentAlign } from '@zetsite/theme-kit';

export interface LogoBarSettings {
  align: ContentAlign;
  gap: number;
  grayscale: boolean;
  marquee: boolean;
  marqueeSpeed: number;
}

export const logoBarSchema: SectionSchema = {
  type: 'logoBar',
  label: 'Logo bar',
  allowedBlockTypes: ['heading', 'logoImage'],
  defaultBlocks: [{ type: 'heading', settings: { text: 'As seen in', size: 'md' } }],
  fields: [
    ALIGN_FIELD,
    gapField(40),
    { key: 'grayscale', type: 'boolean', label: 'Grayscale logos', default: true, tab: 'style' },
    { key: 'marquee', type: 'boolean', label: 'Auto-scroll (marquee)', default: false, tab: 'style' },
    { key: 'marqueeSpeed', type: 'number', label: 'Scroll speed (seconds per loop)', default: 30, tab: 'style' },
  ],
  defaultSettings: { align: 'center', gap: 40, grayscale: true, marquee: false, marqueeSpeed: 30 },
};

interface LogoData {
  imageUrl?: string;
  linkUrl?: string;
}

function Logos({ logos, imgClass, gap }: { logos: LogoData[]; imgClass: string; gap: number }) {
  return (
    <div className="flex shrink-0 items-center" style={{ gap }}>
      {logos.map((logo, i) =>
        logo.linkUrl ? (
          <a key={i} href={logo.linkUrl}>
            <ResponsiveImage src={logo.imageUrl} alt="" className={imgClass} />
          </a>
        ) : (
          <ResponsiveImage key={i} src={logo.imageUrl} alt="" className={imgClass} />
        ),
      )}
    </div>
  );
}

export function LogoBar({ settings, blocks, renderBlocks }: SectionComponentProps<LogoBarSettings>) {
  const logos = (blocks ?? [])
    .filter((b) => b.type === 'logoImage')
    .map((b) => b.settings as LogoData)
    .filter((l) => l.imageUrl);
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  const grayscale = settings.grayscale ?? true;
  const imgClass = `h-8 object-contain ${grayscale ? 'grayscale hover:grayscale-0 transition-all' : ''}`;
  const marquee = (settings.marquee ?? false) && logos.length > 0;
  const gap = settings.gap ?? 40;

  return (
    <section className="px-6 py-14 bg-white">
      <div className={`flex flex-col mb-8 ${align}`}>{renderBlocks?.((b) => b.type === 'heading')}</div>
      {logos.length === 0 ? (
        <p className="text-center text-sm text-neutral-400">Add logo blocks</p>
      ) : marquee ? (
        <div className="overflow-hidden">
          <style>{`
            @keyframes zetsite-logo-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          `}</style>
          <div
            className="flex w-max hover:[animation-play-state:paused]"
            style={{ animation: `zetsite-logo-marquee ${settings.marqueeSpeed ?? 30}s linear infinite`, gap }}
          >
            <Logos logos={logos} imgClass={imgClass} gap={gap} />
            <Logos logos={logos} imgClass={imgClass} gap={gap} />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center" style={{ gap }}>
          {logos.map((logo, i) =>
            logo.linkUrl ? (
              <a key={i} href={logo.linkUrl}>
                <ResponsiveImage src={logo.imageUrl} alt="" className={imgClass} />
              </a>
            ) : (
              <ResponsiveImage key={i} src={logo.imageUrl} alt="" className={imgClass} />
            ),
          )}
        </div>
      )}
    </section>
  );
}
