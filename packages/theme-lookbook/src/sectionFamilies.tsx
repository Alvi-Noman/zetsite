import type { SectionFamily } from '@zetsite/theme-kit';

// Small (~120x80) wireframe previews — plain divs, no images, so they can
// never silently drift out of sync with the real section design.
const BOX = 'relative h-20 w-full overflow-hidden rounded-sm bg-neutral-100';

function Bar({ className = '' }: { className?: string }) {
  return <div className={`rounded-sm bg-neutral-400 ${className}`} />;
}

// --- Hero --------------------------------------------------------------

function HeroCenteredSkeleton() {
  return (
    <div className={BOX}>
      <div className="absolute inset-0 bg-neutral-300" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <Bar className="h-2 w-14 !bg-white" />
        <Bar className="h-1.5 w-10 !bg-white/70" />
        <div className="mt-1 h-2.5 w-8 rounded-full bg-stone-900" />
      </div>
    </div>
  );
}
function HeroShopSkeleton() {
  return (
    <div className={BOX}>
      <div className="absolute inset-x-6 top-1.5 h-10 rounded-sm bg-neutral-300" />
      <div className="absolute inset-x-0 bottom-1.5 flex flex-col items-center gap-1">
        <Bar className="h-1.5 w-12" />
        <Bar className="h-1.5 w-6 !bg-neutral-300" />
        <div className="h-2 w-8 rounded-full bg-stone-900" />
      </div>
    </div>
  );
}
function HeroSplitSkeleton() {
  return (
    <div className={`${BOX} flex items-center gap-1.5 px-1.5`}>
      <div className="h-14 w-1/2 rounded-sm bg-neutral-300" />
      <div className="flex w-1/2 flex-col gap-1">
        <Bar className="h-2 w-full" />
        <Bar className="h-1.5 w-3/4 !bg-neutral-300" />
        <div className="mt-1 h-2 w-8 rounded-full bg-stone-900" />
      </div>
    </div>
  );
}
function HeroMinimalSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1.5 bg-white`}>
      <div className="h-5 w-5 rounded-full bg-neutral-300" />
      <Bar className="h-2 w-14" />
      <Bar className="h-1.5 w-10 !bg-neutral-300" />
      <div className="mt-1 h-2 w-8 rounded-full bg-stone-900" />
    </div>
  );
}
function HeroFullBleedSkeleton() {
  return (
    <div className={BOX}>
      <div className="absolute inset-0 bg-neutral-400" />
      <div className="absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">
        <Bar className="h-2 w-12 !bg-white" />
        <div className="h-1.5 w-7 rounded-full bg-white" />
      </div>
    </div>
  );
}
function HeroFramedSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center bg-neutral-50 p-1.5`}>
      <div className="flex h-full w-16 flex-col overflow-hidden rounded-sm border border-neutral-300 bg-white">
        <div className="h-9 w-full bg-neutral-300" />
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
          <Bar className="h-1 w-10" />
          <div className="h-1.5 w-6 rounded-full bg-stone-900" />
        </div>
      </div>
    </div>
  );
}

// --- Gallery --------------------------------------------------------------

function GalleryGridSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-3 gap-1 p-1.5`}>
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-sm bg-neutral-300" />)}
    </div>
  );
}
function GalleryBeforeAfterSkeleton() {
  return (
    <div className={`${BOX} relative flex`}>
      <div className="h-full w-1/2 bg-neutral-300" />
      <div className="h-full w-1/2 bg-neutral-100" />
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white" />
    </div>
  );
}
function GalleryMasonrySkeleton() {
  return (
    <div className={`${BOX} flex gap-1 p-1.5`}>
      <div className="flex flex-1 flex-col gap-1"><div className="h-6 rounded-sm bg-neutral-300" /><div className="h-9 rounded-sm bg-neutral-200" /></div>
      <div className="flex flex-1 flex-col gap-1"><div className="h-10 rounded-sm bg-neutral-200" /><div className="h-5 rounded-sm bg-neutral-300" /></div>
    </div>
  );
}
function GalleryCarouselSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1`}>
      <div className="h-10 w-16 rounded-sm bg-neutral-300" />
      <div className="flex gap-0.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-1 w-1 rounded-full ${i === 0 ? 'bg-stone-900' : 'bg-neutral-300'}`} />)}</div>
    </div>
  );
}
function GalleryStorySkeleton() {
  return (
    <div className={`${BOX} flex items-center gap-1.5 p-1.5`}>
      <div className="h-14 w-8 shrink-0 rounded-sm bg-neutral-300" />
      <Bar className="h-1.5 flex-1" />
    </div>
  );
}
function GalleryThumbsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1`}>
      <div className="h-10 w-12 rounded-sm bg-neutral-300" />
      <div className="flex gap-0.5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-2 w-2 rounded-sm bg-neutral-200" />)}</div>
    </div>
  );
}

// --- Product specs --------------------------------------------------------

function SpecsRowsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-0.5 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`flex justify-between px-1.5 py-1 ${i % 2 === 0 ? 'bg-neutral-50' : ''}`}>
          <Bar className="h-1 w-8 !bg-neutral-300" />
          <Bar className="h-1 w-8" />
        </div>
      ))}
    </div>
  );
}
function SpecsIconCardsSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-2 gap-1.5 p-1.5`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1 rounded-sm border border-neutral-200 p-1"><div className="h-2 w-2 rounded-full bg-yellow-600" /><Bar className="h-1 flex-1" /></div>
      ))}
    </div>
  );
}
function SpecsGridSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-2 gap-2 p-1.5`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-t border-neutral-300 pt-0.5"><Bar className="h-1 w-8 !bg-neutral-300" /><Bar className="mt-0.5 h-1.5 w-10" /></div>
      ))}
    </div>
  );
}
function SpecsAccordionSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-neutral-200 pb-0.5"><Bar className="h-1.5 w-12" /><div className="h-1 w-1 bg-neutral-400" /></div>
      ))}
    </div>
  );
}
function SpecsMinimalSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1.5 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between"><Bar className="h-1 w-8 !bg-neutral-300" /><Bar className="h-1 w-6" /></div>
      ))}
    </div>
  );
}
function SpecsCardGridSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-3 gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-sm bg-neutral-50 p-1 text-center"><Bar className="mx-auto h-1 w-6 !bg-neutral-300" /><Bar className="mx-auto mt-0.5 h-1 w-8" /></div>
      ))}
    </div>
  );
}

// --- Rich text --------------------------------------------------------

function RichTextSplitSkeleton() {
  return (
    <div className={`${BOX} flex items-center gap-1.5 px-1.5`}>
      <div className="flex-1 space-y-1"><Bar className="h-1.5 w-full" /><Bar className="h-1 w-3/4 !bg-neutral-300" /><Bar className="h-1 w-2/3 !bg-neutral-300" /></div>
      <div className="h-14 w-10 rounded-sm bg-neutral-300" />
    </div>
  );
}
function RichTextQuoteSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-neutral-50`}>
      <Bar className="h-1.5 w-16 !bg-neutral-300" />
      <Bar className="h-1.5 w-12 !bg-neutral-300" />
    </div>
  );
}
function RichTextDropCapSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      <Bar className="h-2 w-14" />
      <div className="flex items-start gap-1"><div className="h-4 w-2.5 bg-neutral-300" /><Bar className="h-1 flex-1 !bg-neutral-300" /></div>
    </div>
  );
}
function RichTextCenteredSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <Bar className="h-2 w-12" />
      <Bar className="h-1 w-16 !bg-neutral-300" />
    </div>
  );
}
function RichTextMagazineSkeleton() {
  return (
    <div className={`${BOX} flex flex-col gap-1 p-1.5`}>
      <div className="h-8 w-full rounded-sm bg-neutral-300" />
      <div className="flex gap-1"><Bar className="h-1 flex-1 !bg-neutral-300" /><Bar className="h-1 flex-1 !bg-neutral-300" /></div>
    </div>
  );
}
function RichTextImageBgSkeleton() {
  return (
    <div className={BOX}>
      <div className="absolute inset-0 bg-stone-600" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Bar className="h-1.5 w-14 !bg-white" />
        <Bar className="h-1 w-10 !bg-white/70" />
      </div>
    </div>
  );
}

// --- Variant swatches --------------------------------------------------------

function SwatchesCircleSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1.5 bg-white`}>
      {['#111', '#5C4433', '#C7C7C7', '#B08D57'].map((c, i) => <div key={i} className="h-4 w-4 rounded-full" style={{ backgroundColor: c }} />)}
    </div>
  );
}
function SwatchesSquareSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1.5 bg-white`}>
      {['#111', '#5C4433', '#C7C7C7', '#B08D57'].map((c, i) => <div key={i} className="h-4 w-4" style={{ backgroundColor: c }} />)}
    </div>
  );
}
function SwatchesLargeSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-2 bg-white`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5"><div className="h-6 w-6 rounded-sm bg-neutral-300" /><Bar className="h-1 w-5 !bg-neutral-300" /></div>
      ))}
    </div>
  );
}
function SwatchesPillsSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1 bg-white`}>
      <div className="h-3 w-8 rounded-full bg-stone-900" />
      <div className="h-3 w-8 rounded-full border border-neutral-300" />
      <div className="h-3 w-8 rounded-full border border-neutral-300" />
    </div>
  );
}
function SwatchesCardsSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-3 gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 rounded-sm border border-neutral-200 p-1"><div className="h-3 w-3 rounded-full bg-neutral-300" /><Bar className="h-1 w-5 !bg-neutral-300" /></div>
      ))}
    </div>
  );
}
function SwatchesListSkeleton() {
  return (
    <div className={`${BOX} flex gap-1.5 p-1.5`}>
      <div className="h-full w-8 rounded-sm bg-neutral-300" />
      <div className="flex flex-1 flex-col justify-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => <Bar key={i} className="h-1.5 w-full !bg-neutral-200" />)}
      </div>
    </div>
  );
}

// --- Testimonials --------------------------------------------------------

function TestimonialsCarouselSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <Bar className="h-1.5 w-16" />
      <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-neutral-300" /><Bar className="h-1 w-6 !bg-neutral-300" /></div>
    </div>
  );
}
function TestimonialsGridSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 w-6 rounded-sm border border-neutral-200" />)}
    </div>
  );
}
function TestimonialsFeaturedSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <Bar className="h-2.5 w-16" />
      <div className="h-3 w-3 rounded-full bg-neutral-300" />
    </div>
  );
}
function TestimonialsVideoSkeleton() {
  return (
    <div className={`${BOX} flex items-center gap-1.5 p-1.5`}>
      <div className="relative h-12 w-12 shrink-0 rounded bg-neutral-300">
        <div className="absolute inset-0 flex items-center justify-center"><div className="h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-white" /></div>
      </div>
      <Bar className="h-1.5 flex-1" />
    </div>
  );
}
function TestimonialsResultsSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-2`}>
      <Bar className="h-3 w-8" />
      <Bar className="h-1.5 w-8 !bg-neutral-300" />
    </div>
  );
}
function TestimonialsRatingsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-0.5 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-1 w-full rounded-full bg-neutral-100"><div className="h-full rounded-full bg-yellow-500" style={{ width: `${80 - i * 25}%` }} /></div>
      ))}
    </div>
  );
}

// --- Trust badges --------------------------------------------------------

function TrustBadgesRowSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1.5 bg-neutral-50`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1 rounded-sm bg-white p-1 shadow-sm"><div className="h-3 w-3 rounded-full bg-yellow-600" /><Bar className="h-1 w-5" /></div>
      ))}
    </div>
  );
}
function TrustBadgesStackSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5 border-b border-neutral-200 pb-0.5"><div className="h-2 w-2 rounded-full bg-yellow-600" /><Bar className="h-1 flex-1" /></div>
      ))}
    </div>
  );
}
function TrustBadgesMinimalSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center bg-white`}>
      <Bar className="h-1 w-16 !bg-neutral-300" />
    </div>
  );
}
function TrustBadgesCirclesSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-2 bg-white`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5"><div className="h-5 w-5 rounded-full border border-yellow-300" /><Bar className="h-1 w-5 !bg-neutral-300" /></div>
      ))}
    </div>
  );
}
function TrustBadgesCardsSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-3 gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-sm border border-neutral-200 p-1"><div className="h-2 w-2 rounded-full bg-yellow-600" /><Bar className="mt-1 h-1 w-8 !bg-neutral-300" /></div>
      ))}
    </div>
  );
}
function TrustBadgesStripSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1.5 bg-stone-800`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1 border-r border-white/20 pr-1.5 last:border-0"><div className="h-2 w-2 rounded-full bg-yellow-500" /><Bar className="h-1 w-5 !bg-white/70" /></div>
      ))}
    </div>
  );
}

// --- Featured collection --------------------------------------------------------

function FeaturedGridSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-4 gap-1 p-1.5`}>
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-sm bg-neutral-300" />)}
    </div>
  );
}
function FeaturedCarouselSkeleton() {
  return (
    <div className={`${BOX} flex items-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-full w-10 shrink-0 rounded-sm bg-neutral-300" />)}
      <div className="h-full w-4 shrink-0 rounded-sm bg-neutral-100" />
    </div>
  );
}
function FeaturedListSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5"><div className="h-6 w-6 rounded-sm bg-neutral-300" /><Bar className="h-1 flex-1 !bg-neutral-300" /></div>
      ))}
    </div>
  );
}
function FeaturedMasonrySkeleton() {
  return (
    <div className={`${BOX} flex gap-1 p-1.5`}>
      <div className="flex flex-1 flex-col gap-1"><div className="h-6 rounded-sm bg-neutral-300" /><div className="h-9 rounded-sm bg-neutral-200" /></div>
      <div className="flex flex-1 flex-col gap-1"><div className="h-10 rounded-sm bg-neutral-200" /><div className="h-5 rounded-sm bg-neutral-300" /></div>
    </div>
  );
}
function FeaturedTwoUpSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1.5 p-1.5`}>
      <div className="h-full flex-1 rounded-sm bg-neutral-300" />
      <div className="h-full flex-1 rounded-sm bg-neutral-300" />
    </div>
  );
}
function FeaturedMinimalSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between border-b border-neutral-200 pb-0.5"><Bar className="h-1 w-10 !bg-neutral-300" /><Bar className="h-1 w-5" /></div>
      ))}
    </div>
  );
}

// --- Order form --------------------------------------------------------

function OrderFormFullSkeleton() {
  return (
    <div className={`${BOX} flex gap-1.5 p-1.5`}>
      <div className="flex-[3] space-y-1">{Array.from({ length: 3 }).map((_, i) => <Bar key={i} className="h-1.5 w-full !bg-neutral-200" />)}</div>
      <div className="flex-[2] rounded-sm bg-neutral-100" />
    </div>
  );
}
function OrderFormStepsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1.5`}>
      <div className="flex gap-1 text-[7px] font-semibold text-neutral-400"><span>1</span><span>—</span><span>2</span></div>
      <Bar className="h-1.5 w-12" />
      <div className="h-2 w-8 rounded-full bg-yellow-700" />
    </div>
  );
}
function OrderFormMinimalSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1`}>
      {Array.from({ length: 2 }).map((_, i) => <Bar key={i} className="h-1.5 w-12 !bg-neutral-200" />)}
      <div className="h-2 w-10 rounded-full bg-yellow-700" />
    </div>
  );
}
function OrderFormStickySkeleton() {
  return (
    <div className={`${BOX} flex gap-1.5 p-1.5`}>
      <div className="flex-[3] space-y-1">{Array.from({ length: 3 }).map((_, i) => <Bar key={i} className="h-1.5 w-full !bg-neutral-200" />)}</div>
      <div className="flex-[2] rounded-sm border border-dashed border-neutral-300" />
    </div>
  );
}
function OrderFormExpressSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <Bar className="h-2 w-10" />
      <div className="h-2.5 w-12 rounded-full bg-yellow-700" />
    </div>
  );
}
function OrderFormCardSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center bg-neutral-50 p-1.5`}>
      <div className="flex h-full w-full flex-col justify-center gap-1 rounded-sm border border-neutral-300 bg-white p-1.5">
        <Bar className="h-1.5 w-full !bg-neutral-200" />
        <div className="h-2 w-full rounded-full bg-yellow-700" />
      </div>
    </div>
  );
}

export const heroFamily: SectionFamily = {
  id: 'hero',
  label: 'Hero',
  variants: [
    { sectionType: 'hero', label: 'Centered', Skeleton: HeroCenteredSkeleton },
    { sectionType: 'shopHero', label: 'Image first', Skeleton: HeroShopSkeleton },
    { sectionType: 'heroSplit', label: 'Split', Skeleton: HeroSplitSkeleton },
    { sectionType: 'heroMinimal', label: 'Minimal', Skeleton: HeroMinimalSkeleton },
    { sectionType: 'heroFullBleed', label: 'Full-bleed', Skeleton: HeroFullBleedSkeleton },
    { sectionType: 'heroFramed', label: 'Framed card', Skeleton: HeroFramedSkeleton },
  ],
};

export const galleryFamily: SectionFamily = {
  id: 'gallery',
  label: 'Gallery',
  variants: [
    { sectionType: 'gallery', label: 'Grid + lightbox', Skeleton: GalleryGridSkeleton },
    { sectionType: 'beforeAfter', label: 'Before / after', Skeleton: GalleryBeforeAfterSkeleton },
    { sectionType: 'galleryMasonry', label: 'Masonry', Skeleton: GalleryMasonrySkeleton },
    { sectionType: 'galleryCarousel', label: 'Carousel', Skeleton: GalleryCarouselSkeleton },
    { sectionType: 'galleryStory', label: 'Story split', Skeleton: GalleryStorySkeleton },
    { sectionType: 'galleryThumbs', label: 'Thumbnail strip', Skeleton: GalleryThumbsSkeleton },
  ],
};

export const productSpecsFamily: SectionFamily = {
  id: 'productSpecs',
  label: 'Product specs',
  variants: [
    { sectionType: 'productSpecs', label: 'Bordered rows', Skeleton: SpecsRowsSkeleton },
    { sectionType: 'specsIconCards', label: 'Icon cards', Skeleton: SpecsIconCardsSkeleton },
    { sectionType: 'specsGrid', label: 'Two-column grid', Skeleton: SpecsGridSkeleton },
    { sectionType: 'specsAccordion', label: 'Accordion', Skeleton: SpecsAccordionSkeleton },
    { sectionType: 'specsMinimal', label: 'Minimal list', Skeleton: SpecsMinimalSkeleton },
    { sectionType: 'specsCardGrid', label: 'Card grid', Skeleton: SpecsCardGridSkeleton },
  ],
};

export const richTextFamily: SectionFamily = {
  id: 'richText',
  label: 'Rich text / image',
  variants: [
    { sectionType: 'richText', label: 'Image + text', Skeleton: RichTextSplitSkeleton },
    { sectionType: 'richTextQuote', label: 'Quote-style', Skeleton: RichTextQuoteSkeleton },
    { sectionType: 'richTextDropCap', label: 'Editorial drop-cap', Skeleton: RichTextDropCapSkeleton },
    { sectionType: 'richTextCentered', label: 'Centered', Skeleton: RichTextCenteredSkeleton },
    { sectionType: 'richTextMagazine', label: 'Magazine two-column', Skeleton: RichTextMagazineSkeleton },
    { sectionType: 'richTextImageBg', label: 'Image background', Skeleton: RichTextImageBgSkeleton },
  ],
};

export const variantSwatchesFamily: SectionFamily = {
  id: 'variantSwatches',
  label: 'Variant swatches',
  variants: [
    { sectionType: 'variantSwatches', label: 'Circular', Skeleton: SwatchesCircleSkeleton },
    { sectionType: 'swatchesSquare', label: 'Square', Skeleton: SwatchesSquareSkeleton },
    { sectionType: 'swatchesLarge', label: 'Large image', Skeleton: SwatchesLargeSkeleton },
    { sectionType: 'swatchesPills', label: 'Pill buttons', Skeleton: SwatchesPillsSkeleton },
    { sectionType: 'swatchesCards', label: 'Card select', Skeleton: SwatchesCardsSkeleton },
    { sectionType: 'swatchesList', label: 'List with preview', Skeleton: SwatchesListSkeleton },
  ],
};

export const testimonialsFamily: SectionFamily = {
  id: 'testimonials',
  label: 'Testimonials',
  variants: [
    { sectionType: 'testimonials', label: 'Single carousel', Skeleton: TestimonialsCarouselSkeleton },
    { sectionType: 'testimonialsGrid', label: 'Grid of cards', Skeleton: TestimonialsGridSkeleton },
    { sectionType: 'testimonialsFeatured', label: 'Featured quote', Skeleton: TestimonialsFeaturedSkeleton },
    { sectionType: 'testimonialsVideo', label: 'Video', Skeleton: TestimonialsVideoSkeleton },
    { sectionType: 'testimonialsResults', label: 'Results-focused', Skeleton: TestimonialsResultsSkeleton },
    { sectionType: 'testimonialsRatings', label: 'Rating breakdown', Skeleton: TestimonialsRatingsSkeleton },
  ],
};

export const trustBadgesFamily: SectionFamily = {
  id: 'trustBadges',
  label: 'Trust badges',
  variants: [
    { sectionType: 'trustBadges', label: 'Icon row', Skeleton: TrustBadgesRowSkeleton },
    { sectionType: 'trustBadgesStack', label: 'Stacked list', Skeleton: TrustBadgesStackSkeleton },
    { sectionType: 'trustBadgesMinimal', label: 'Minimal text', Skeleton: TrustBadgesMinimalSkeleton },
    { sectionType: 'trustBadgesCircles', label: 'Icon circles', Skeleton: TrustBadgesCirclesSkeleton },
    { sectionType: 'trustBadgesCards', label: 'Guarantee cards', Skeleton: TrustBadgesCardsSkeleton },
    { sectionType: 'trustBadgesStrip', label: 'Divided strip', Skeleton: TrustBadgesStripSkeleton },
  ],
};

export const featuredCollectionFamily: SectionFamily = {
  id: 'featuredCollection',
  label: 'Featured collection',
  variants: [
    { sectionType: 'featuredCollection', label: 'Grid', Skeleton: FeaturedGridSkeleton },
    { sectionType: 'featuredCollectionCarousel', label: 'Carousel', Skeleton: FeaturedCarouselSkeleton },
    { sectionType: 'featuredCollectionList', label: 'List, large images', Skeleton: FeaturedListSkeleton },
    { sectionType: 'featuredCollectionMasonry', label: 'Masonry', Skeleton: FeaturedMasonrySkeleton },
    { sectionType: 'featuredCollectionTwoUp', label: 'Two-up large', Skeleton: FeaturedTwoUpSkeleton },
    { sectionType: 'featuredCollectionMinimal', label: 'Minimal text links', Skeleton: FeaturedMinimalSkeleton },
  ],
};

export const orderFormFamily: SectionFamily = {
  id: 'orderForm',
  label: 'Order form',
  variants: [
    { sectionType: 'orderForm', label: 'Full + summary', Skeleton: OrderFormFullSkeleton },
    { sectionType: 'orderFormSteps', label: 'Two-step', Skeleton: OrderFormStepsSkeleton },
    { sectionType: 'orderFormMinimal', label: 'Minimal', Skeleton: OrderFormMinimalSkeleton },
    { sectionType: 'orderFormSticky', label: 'Sticky sidebar', Skeleton: OrderFormStickySkeleton },
    { sectionType: 'orderFormExpress', label: 'Express modal', Skeleton: OrderFormExpressSkeleton },
    { sectionType: 'orderFormCard', label: 'Card', Skeleton: OrderFormCardSkeleton },
  ],
};

export const sectionFamilies: SectionFamily[] = [
  heroFamily,
  galleryFamily,
  productSpecsFamily,
  richTextFamily,
  variantSwatchesFamily,
  testimonialsFamily,
  trustBadgesFamily,
  featuredCollectionFamily,
  orderFormFamily,
];
