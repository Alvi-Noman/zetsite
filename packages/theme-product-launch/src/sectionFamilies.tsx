import type { SectionFamily } from '@zetsite/theme-kit';

// Small (~120x80) wireframe previews — plain divs, no images, so they can
// never silently drift out of sync with the real section design.
const BOX = 'relative h-20 w-full overflow-hidden rounded-sm bg-neutral-100';

function Bar({ className = '' }: { className?: string }) {
  return <div className={`rounded-sm bg-neutral-400 ${className}`} />;
}

// --- Hero ------------------------------------------------------------------

function HeroCenteredSkeleton() {
  return (
    <div className={BOX}>
      <div className="absolute inset-0 bg-neutral-300" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <Bar className="h-2 w-14 !bg-white" />
        <Bar className="h-1.5 w-10 !bg-white/70" />
        <div className="mt-1 h-2.5 w-8 rounded-full bg-neutral-900" />
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
        <div className="h-2 w-8 rounded-full bg-neutral-900" />
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
        <div className="mt-1 h-2 w-8 rounded-full bg-neutral-900" />
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
      <div className="mt-1 h-2 w-8 rounded-full bg-neutral-900" />
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
          <div className="h-1.5 w-6 rounded-full bg-neutral-900" />
        </div>
      </div>
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

// --- Rating badge ------------------------------------------------------------

function RatingStarsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-yellow-500" />)}</div>
      <Bar className="h-1.5 w-14 !bg-neutral-300" />
    </div>
  );
}
function ProofBarSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center bg-neutral-50`}>
      <Bar className="h-1.5 w-16 !bg-neutral-400" />
    </div>
  );
}
function ProofLogosSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-2 bg-white`}>
      <Bar className="h-1 w-10 !bg-neutral-300" />
      <div className="flex gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-3 w-6 rounded-sm bg-neutral-300" />)}</div>
    </div>
  );
}
function ProofStatSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <Bar className="h-3.5 w-14" />
      <Bar className="h-1 w-10 !bg-neutral-300" />
    </div>
  );
}
function ProofAvatarsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1.5 bg-white`}>
      <div className="flex -space-x-1.5">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 w-4 rounded-full border border-white bg-neutral-300" />)}</div>
      <Bar className="h-1 w-14 !bg-neutral-300" />
    </div>
  );
}
function ProofVerifiedSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center bg-white`}>
      <div className="h-3 w-14 rounded-full bg-neutral-900" />
    </div>
  );
}

// --- Problem / Solution ------------------------------------------------------

function ProblemSolutionTwoCardsSkeleton() {
  return (
    <div className={`${BOX} flex gap-1.5 p-1.5`}>
      <div className="flex-1 rounded-sm bg-neutral-100 p-1"><Bar className="h-1.5 w-8" /></div>
      <div className="flex-1 rounded-sm bg-yellow-50 p-1"><Bar className="h-1.5 w-8 !bg-yellow-600" /></div>
    </div>
  );
}
function ProblemSolutionTableSkeleton() {
  return (
    <div className={`${BOX} flex flex-col gap-0.5 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-1">
          <Bar className="h-1.5 w-1/2" />
          <Bar className="h-1.5 w-1/2 !bg-yellow-500" />
        </div>
      ))}
    </div>
  );
}
function ProblemSolutionNarrativeSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1`}>
      <Bar className="h-1.5 w-14" />
      <div className="h-1.5 w-1.5 rotate-90 rounded-full bg-yellow-600" />
      <Bar className="h-1.5 w-14 !bg-yellow-600" />
    </div>
  );
}
function ProblemSolutionIconsSkeleton() {
  return (
    <div className={`${BOX} flex gap-1.5 p-1.5`}>
      <div className="flex-1 space-y-1">{Array.from({ length: 3 }).map((_, i) => <Bar key={i} className="h-1.5 w-full" />)}</div>
      <div className="flex-1 space-y-1">{Array.from({ length: 3 }).map((_, i) => <Bar key={i} className="h-1.5 w-full !bg-yellow-500" />)}</div>
    </div>
  );
}
function ProblemSolutionQuoteSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1`}>
      <Bar className="h-1.5 w-16 italic" />
      <Bar className="h-1 w-8 !bg-neutral-300" />
    </div>
  );
}
function ProblemSolutionImageSkeleton() {
  return (
    <div className={`${BOX} flex gap-1.5 p-1.5`}>
      <div className="flex-1 space-y-1"><div className="h-6 w-full rounded-sm bg-neutral-300" /><Bar className="h-1.5 w-full" /></div>
      <div className="flex-1 space-y-1"><div className="h-6 w-full rounded-sm bg-yellow-200" /><Bar className="h-1.5 w-full !bg-yellow-600" /></div>
    </div>
  );
}

// --- Features & benefits -----------------------------------------------------

function FeaturesGridSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-2`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="h-4 w-4 rounded-full bg-neutral-300" />
          <Bar className="h-1 w-6" />
        </div>
      ))}
    </div>
  );
}
function FeaturesRowsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1.5 p-1.5`}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className={`flex items-center gap-1.5 ${i % 2 ? 'flex-row-reverse' : ''}`}>
          <div className="h-4 w-4 shrink-0 rounded bg-neutral-300" />
          <Bar className="h-1.5 flex-1" />
        </div>
      ))}
    </div>
  );
}
function FeaturesNumberedSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-[8px] font-black text-neutral-300">{i + 1}</span>
          <Bar className="h-1.5 flex-1" />
        </div>
      ))}
    </div>
  );
}
function FeaturesTabsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1.5`}>
      <div className="flex gap-1">
        <div className="h-2 w-6 rounded-full bg-neutral-900" />
        <div className="h-2 w-6 rounded-full bg-neutral-200" />
        <div className="h-2 w-6 rounded-full bg-neutral-200" />
      </div>
      <Bar className="h-1.5 w-14 !bg-neutral-300" />
    </div>
  );
}
function FeaturesChecklistSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-2 gap-1 p-1.5`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-yellow-600" /><Bar className="h-1 flex-1" /></div>
      ))}
    </div>
  );
}
function FeaturesStatsSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-2`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <Bar className="h-2.5 w-6" />
          <Bar className="h-1 w-5 !bg-neutral-300" />
        </div>
      ))}
    </div>
  );
}

// --- How it works --------------------------------------------------------

function HowItWorksCirclesSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-2`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[7px] font-bold text-white">{i + 1}</div>
      ))}
    </div>
  );
}
function HowItWorksTimelineSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1.5 pl-3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="relative flex items-center gap-1.5">
          <div className="absolute -left-3 h-2 w-2 rounded-full bg-yellow-700" />
          <Bar className="h-1.5 w-14" />
        </div>
      ))}
    </div>
  );
}
function HowItWorksTabsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1.5`}>
      <div className="flex gap-1">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-3 w-3 rounded-full ${i === 0 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />)}</div>
      <Bar className="h-1.5 w-14 !bg-neutral-300" />
    </div>
  );
}
function HowItWorksCardsSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center gap-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-10 w-6 rounded-sm border border-neutral-200" />
      ))}
    </div>
  );
}
function HowItWorksAccordionSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-neutral-200 pb-0.5">
          <Bar className="h-1.5 w-12" />
          <div className="h-1 w-1 rotate-90 bg-neutral-400" />
        </div>
      ))}
    </div>
  );
}
function HowItWorksSplitSkeleton() {
  return (
    <div className={`${BOX} flex items-center gap-1.5 p-1.5`}>
      <div className="flex-1 space-y-1">{Array.from({ length: 3 }).map((_, i) => <Bar key={i} className="h-1.5 w-full" />)}</div>
      <div className="h-14 w-8 rounded-sm bg-neutral-300" />
    </div>
  );
}

// --- Testimonials ------------------------------------------------------------

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

// --- Gallery ------------------------------------------------------------

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
      <div className="flex gap-0.5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-1 w-1 rounded-full ${i === 0 ? 'bg-neutral-900' : 'bg-neutral-300'}`} />)}</div>
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

// --- FAQ ------------------------------------------------------------

function FaqAccordionSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-neutral-200 pb-0.5">
          <Bar className="h-1.5 w-12" />
          <div className="h-1 w-1 bg-neutral-400" />
        </div>
      ))}
    </div>
  );
}
function FaqGridSkeleton() {
  return (
    <div className={`${BOX} grid grid-cols-2 gap-1.5 p-1.5`}>
      {Array.from({ length: 4 }).map((_, i) => <Bar key={i} className="h-1.5 w-full" />)}
    </div>
  );
}
function FaqNumberedSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5"><span className="text-[7px] font-black text-neutral-300">{i + 1}</span><Bar className="h-1.5 flex-1" /></div>
      ))}
    </div>
  );
}
function FaqTabsSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1.5`}>
      <div className="flex gap-1">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-2 w-6 rounded-full ${i === 0 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />)}</div>
      <Bar className="h-1.5 w-14 !bg-neutral-300" />
    </div>
  );
}
function FaqChatSkeleton() {
  return (
    <div className={`${BOX} flex flex-col justify-center gap-1 p-1.5`}>
      <div className="h-2 w-10 self-start rounded-full bg-neutral-200" />
      <div className="h-2 w-10 self-end rounded-full bg-neutral-900" />
    </div>
  );
}
function FaqSidebarSkeleton() {
  return (
    <div className={`${BOX} flex gap-1.5 p-1.5`}>
      <div className="flex-1 space-y-1"><Bar className="h-1.5 w-full" /><Bar className="h-1 w-full !bg-neutral-300" /></div>
      <div className="flex-[2] space-y-1">{Array.from({ length: 2 }).map((_, i) => <Bar key={i} className="h-1.5 w-full" />)}</div>
    </div>
  );
}

// --- Final CTA ------------------------------------------------------------

function CtaDarkSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-neutral-800`}>
      <Bar className="h-1.5 w-14 !bg-white" />
      <div className="h-2 w-8 rounded-full bg-white" />
    </div>
  );
}
function CtaImageSkeleton() {
  return (
    <div className={BOX}>
      <div className="absolute inset-0 bg-neutral-500" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Bar className="h-1.5 w-14 !bg-white" />
        <div className="h-2 w-8 rounded-full bg-white" />
      </div>
    </div>
  );
}
function CtaGuaranteeSkeleton() {
  return (
    <div className={`${BOX} flex items-center gap-1.5 p-1.5`}>
      <div className="flex-1 space-y-1"><Bar className="h-1.5 w-full" /><div className="h-2 w-8 rounded-full bg-neutral-900" /></div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-sm border border-neutral-200 py-2"><div className="h-3 w-3 rounded-full bg-yellow-600" /></div>
    </div>
  );
}
function CtaMinimalSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <Bar className="h-1.5 w-12" />
      <Bar className="h-1 w-8 !bg-yellow-600 underline" />
    </div>
  );
}
function CtaUrgencySkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-neutral-800`}>
      <div className="h-1.5 w-10 rounded-full bg-yellow-500/60" />
      <Bar className="h-1.5 w-12 !bg-white" />
      <div className="h-2 w-8 rounded-full bg-white" />
    </div>
  );
}
function CtaDualSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-neutral-800`}>
      <Bar className="h-1.5 w-14 !bg-white" />
      <div className="flex gap-1"><div className="h-2 w-7 rounded-full bg-white" /><div className="h-2 w-7 rounded-full border border-white" /></div>
    </div>
  );
}

// --- Order form ------------------------------------------------------------

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
      <div className="h-2 w-8 rounded-full bg-neutral-900" />
    </div>
  );
}
function OrderFormMinimalSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1`}>
      {Array.from({ length: 2 }).map((_, i) => <Bar key={i} className="h-1.5 w-12 !bg-neutral-200" />)}
      <div className="h-2 w-10 rounded-full bg-neutral-900" />
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
      <div className="h-2.5 w-12 rounded-full bg-neutral-900" />
    </div>
  );
}
function OrderFormCardSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center bg-neutral-50 p-1.5`}>
      <div className="flex h-full w-full flex-col justify-center gap-1 rounded-sm border border-neutral-300 bg-white p-1.5">
        <Bar className="h-1.5 w-full !bg-neutral-200" />
        <div className="h-2 w-full rounded-full bg-neutral-900" />
      </div>
    </div>
  );
}

// --- Footer ------------------------------------------------------------

function FooterCenteredSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <Bar className="h-1 w-14 !bg-neutral-300" />
      <div className="flex gap-1"><div className="h-1.5 w-1.5 rounded-full bg-neutral-300" /><div className="h-1.5 w-1.5 rounded-full bg-neutral-300" /></div>
    </div>
  );
}
function FooterColumnsSkeleton() {
  return (
    <div className={`${BOX} flex justify-center gap-2 p-1.5`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-0.5"><Bar className="h-1 w-6 !bg-neutral-300" /><Bar className="h-0.5 w-6 !bg-neutral-200" /><Bar className="h-0.5 w-6 !bg-neutral-200" /></div>
      ))}
    </div>
  );
}
function FooterNewsletterSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <div className="flex gap-1"><div className="h-2 w-8 rounded-sm border border-neutral-300" /><div className="h-2 w-4 rounded-sm bg-neutral-900" /></div>
      <Bar className="h-1 w-10 !bg-neutral-200" />
    </div>
  );
}
function FooterSocialSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-white`}>
      <div className="flex gap-1">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-2.5 w-2.5 rounded-full bg-neutral-300" />)}</div>
      <Bar className="h-1 w-8 !bg-neutral-200" />
    </div>
  );
}
function FooterMinimalSkeleton() {
  return (
    <div className={`${BOX} flex items-center justify-center bg-white`}>
      <Bar className="h-1 w-10 !bg-neutral-300" />
    </div>
  );
}
function FooterStatementSkeleton() {
  return (
    <div className={`${BOX} flex flex-col items-center justify-center gap-1 bg-neutral-800`}>
      <Bar className="h-1.5 w-14 !bg-white" />
      <Bar className="h-1 w-10 !bg-neutral-400" />
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

export const ratingBadgeFamily: SectionFamily = {
  id: 'ratingBadge',
  label: 'Rating badge',
  variants: [
    { sectionType: 'ratingBadge', label: 'Stars + count', Skeleton: RatingStarsSkeleton },
    { sectionType: 'socialProofBar', label: 'Proof bar', Skeleton: ProofBarSkeleton },
    { sectionType: 'proofLogos', label: 'Press logos', Skeleton: ProofLogosSkeleton },
    { sectionType: 'proofStat', label: 'Big stat', Skeleton: ProofStatSkeleton },
    { sectionType: 'proofAvatars', label: 'Avatar cluster', Skeleton: ProofAvatarsSkeleton },
    { sectionType: 'proofVerified', label: 'Verified badge', Skeleton: ProofVerifiedSkeleton },
  ],
};

export const problemSolutionFamily: SectionFamily = {
  id: 'problemSolution',
  label: 'Problem / Solution',
  variants: [
    { sectionType: 'problemSolution', label: 'Two cards', Skeleton: ProblemSolutionTwoCardsSkeleton },
    { sectionType: 'problemSolutionTable', label: 'Comparison table', Skeleton: ProblemSolutionTableSkeleton },
    { sectionType: 'problemSolutionNarrative', label: 'Narrative', Skeleton: ProblemSolutionNarrativeSkeleton },
    { sectionType: 'problemSolutionIcons', label: 'Icon lists', Skeleton: ProblemSolutionIconsSkeleton },
    { sectionType: 'problemSolutionQuote', label: 'Quote-led', Skeleton: ProblemSolutionQuoteSkeleton },
    { sectionType: 'problemSolutionImage', label: 'Image cards', Skeleton: ProblemSolutionImageSkeleton },
  ],
};

export const featuresFamily: SectionFamily = {
  id: 'features',
  label: 'Features & benefits',
  variants: [
    { sectionType: 'multiColumn', label: 'Icon grid', Skeleton: FeaturesGridSkeleton },
    { sectionType: 'featuresRows', label: 'Alternating rows', Skeleton: FeaturesRowsSkeleton },
    { sectionType: 'featuresNumbered', label: 'Numbered list', Skeleton: FeaturesNumberedSkeleton },
    { sectionType: 'featuresTabs', label: 'Tabbed', Skeleton: FeaturesTabsSkeleton },
    { sectionType: 'featuresChecklist', label: 'Checklist grid', Skeleton: FeaturesChecklistSkeleton },
    { sectionType: 'featuresStats', label: 'Stat callouts', Skeleton: FeaturesStatsSkeleton },
  ],
};

export const howItWorksFamily: SectionFamily = {
  id: 'howItWorks',
  label: 'How it works',
  variants: [
    { sectionType: 'howItWorks', label: 'Numbered circles', Skeleton: HowItWorksCirclesSkeleton },
    { sectionType: 'howItWorksTimeline', label: 'Vertical timeline', Skeleton: HowItWorksTimelineSkeleton },
    { sectionType: 'howItWorksTabs', label: 'Tabbed steps', Skeleton: HowItWorksTabsSkeleton },
    { sectionType: 'howItWorksCards', label: 'Cards', Skeleton: HowItWorksCardsSkeleton },
    { sectionType: 'howItWorksAccordion', label: 'Accordion', Skeleton: HowItWorksAccordionSkeleton },
    { sectionType: 'howItWorksSplit', label: 'Split screen', Skeleton: HowItWorksSplitSkeleton },
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

export const faqFamily: SectionFamily = {
  id: 'faq',
  label: 'FAQ',
  variants: [
    { sectionType: 'faq', label: 'Accordion', Skeleton: FaqAccordionSkeleton },
    { sectionType: 'faqGrid', label: 'Two-column grid', Skeleton: FaqGridSkeleton },
    { sectionType: 'faqNumbered', label: 'Numbered list', Skeleton: FaqNumberedSkeleton },
    { sectionType: 'faqTabs', label: 'Tabbed categories', Skeleton: FaqTabsSkeleton },
    { sectionType: 'faqChat', label: 'Chat bubbles', Skeleton: FaqChatSkeleton },
    { sectionType: 'faqSidebar', label: 'Sidebar', Skeleton: FaqSidebarSkeleton },
  ],
};

export const finalCtaFamily: SectionFamily = {
  id: 'finalCta',
  label: 'Final CTA',
  variants: [
    { sectionType: 'finalCta', label: 'Dark band', Skeleton: CtaDarkSkeleton },
    { sectionType: 'ctaImage', label: 'Image background', Skeleton: CtaImageSkeleton },
    { sectionType: 'ctaGuarantee', label: 'Guarantee split', Skeleton: CtaGuaranteeSkeleton },
    { sectionType: 'ctaMinimal', label: 'Minimal text-link', Skeleton: CtaMinimalSkeleton },
    { sectionType: 'ctaUrgency', label: 'Urgency strip', Skeleton: CtaUrgencySkeleton },
    { sectionType: 'ctaDual', label: 'Dual button', Skeleton: CtaDualSkeleton },
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

export const footerFamily: SectionFamily = {
  id: 'footer',
  label: 'Footer',
  variants: [
    { sectionType: 'footer', label: 'Centered', Skeleton: FooterCenteredSkeleton },
    { sectionType: 'footerColumns', label: 'Multi-column links', Skeleton: FooterColumnsSkeleton },
    { sectionType: 'footerNewsletter', label: 'Newsletter band', Skeleton: FooterNewsletterSkeleton },
    { sectionType: 'footerSocial', label: 'Social-prominent', Skeleton: FooterSocialSkeleton },
    { sectionType: 'footerMinimal', label: 'Minimal', Skeleton: FooterMinimalSkeleton },
    { sectionType: 'footerStatement', label: 'Dark statement', Skeleton: FooterStatementSkeleton },
  ],
};

export const sectionFamilies: SectionFamily[] = [
  heroFamily,
  ratingBadgeFamily,
  problemSolutionFamily,
  featuresFamily,
  howItWorksFamily,
  testimonialsFamily,
  galleryFamily,
  faqFamily,
  finalCtaFamily,
  orderFormFamily,
  footerFamily,
];
