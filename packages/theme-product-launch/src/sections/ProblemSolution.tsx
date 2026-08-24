import { ArrowRight, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable, ALIGN_FIELD, ALIGN_CLASS, type ContentAlign } from '@zetsite/theme-kit';

export interface ProblemSolutionSettings {
  problemHeading: string;
  problemText: string;
  solutionHeading: string;
  solutionText: string;
  align: ContentAlign;
}

export const problemSolutionSchema: SectionSchema = {
  type: 'problemSolution',
  label: 'Problem / solution',
  fields: [
    { key: 'problemHeading', type: 'text', label: 'Problem heading', default: "Sound familiar?", tab: 'content' },
    {
      key: 'problemText',
      type: 'richtext',
      label: 'Problem text',
      default: "You've tried the usual fixes. They're slow, expensive, or just don't hold up — and you're stuck doing it the hard way.",
      tab: 'content',
    },
    { key: 'solutionHeading', type: 'text', label: 'Solution heading', default: 'There’s a better way', tab: 'content' },
    {
      key: 'solutionText',
      type: 'richtext',
      label: 'Solution text',
      default: 'We built this to remove the trade-off entirely — so you get the result you want without the usual catch.',
      tab: 'content',
    },
    ALIGN_FIELD,
  ],
  defaultSettings: {
    problemHeading: 'Sound familiar?',
    problemText: "You've tried the usual fixes. They're slow, expensive, or just don't hold up — and you're stuck doing it the hard way.",
    solutionHeading: 'There’s a better way',
    solutionText: 'We built this to remove the trade-off entirely — so you get the result you want without the usual catch.',
    align: 'center',
  },
};

export function ProblemSolution({ settings, onFieldChange }: SectionComponentProps<ProblemSolutionSettings>) {
  const align = ALIGN_CLASS[settings.align] ?? ALIGN_CLASS.center;
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 sm:gap-8">
        <div className={`flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 ${align}`}>
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
            <X size={18} strokeWidth={2.5} />
          </span>
          <Editable
            as="h3"
            fieldKey="problemHeading"
            value={settings.problemHeading}
            onFieldChange={onFieldChange}
            className="text-xl font-serif font-normal text-neutral-900 block"
          />
          <Editable
            as="p"
            fieldKey="problemText"
            value={settings.problemText}
            onFieldChange={onFieldChange}
            html
            multiline
            className="prose prose-neutral mt-3 text-sm leading-relaxed text-neutral-600"
          />
        </div>

        <div className={`flex flex-col rounded-2xl border border-yellow-100 bg-yellow-50/60 p-6 sm:p-8 ${align}`}>
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-700 text-white">
            <ArrowRight size={18} strokeWidth={2.5} />
          </span>
          <Editable
            as="h3"
            fieldKey="solutionHeading"
            value={settings.solutionHeading}
            onFieldChange={onFieldChange}
            className="text-xl font-serif font-normal text-stone-900 block"
          />
          <Editable
            as="p"
            fieldKey="solutionText"
            value={settings.solutionText}
            onFieldChange={onFieldChange}
            html
            multiline
            className="prose prose-neutral mt-3 text-sm leading-relaxed text-stone-700/90"
          />
        </div>
      </div>
    </section>
  );
}
