import { ArrowRight, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable, ResponsiveImage } from '@zetsite/theme-kit';

export interface ProblemSolutionImageSettings {
  problemHeading: string;
  problemText: string;
  solutionHeading: string;
  solutionText: string;
  problemImageUrl: string;
  solutionImageUrl: string;
}

export const problemSolutionImageSchema: SectionSchema = {
  type: 'problemSolutionImage',
  label: 'Problem / solution (image cards)',
  fields: [
    { key: 'problemHeading', type: 'text', label: 'Problem heading', default: 'Sound familiar?', tab: 'content' },
    { key: 'problemText', type: 'richtext', label: 'Problem text', default: "You've tried the usual fixes. They're slow, expensive, or just don't hold up.", tab: 'content' },
    { key: 'problemImageUrl', type: 'image', label: 'Problem image', default: '', tab: 'content' },
    { key: 'solutionHeading', type: 'text', label: 'Solution heading', default: 'There’s a better way', tab: 'content' },
    { key: 'solutionText', type: 'richtext', label: 'Solution text', default: 'We built this to remove the trade-off entirely.', tab: 'content' },
    { key: 'solutionImageUrl', type: 'image', label: 'Solution image', default: '', tab: 'content' },
  ],
  defaultSettings: {
    problemHeading: 'Sound familiar?',
    problemText: "You've tried the usual fixes. They're slow, expensive, or just don't hold up.",
    problemImageUrl: '',
    solutionHeading: 'There’s a better way',
    solutionText: 'We built this to remove the trade-off entirely.',
    solutionImageUrl: '',
  },
};

export function ProblemSolutionImage({ settings, onFieldChange }: SectionComponentProps<ProblemSolutionImageSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 sm:gap-8">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
          {settings.problemImageUrl ? (
            <ResponsiveImage src={settings.problemImageUrl} alt="" className="h-36 w-full object-cover" />
          ) : (
            <div className="flex h-36 w-full items-center justify-center bg-neutral-100">
              <X size={20} className="text-neutral-300" />
            </div>
          )}
          <div className="p-6">
            <Editable as="h3" fieldKey="problemHeading" value={settings.problemHeading} onFieldChange={onFieldChange} className="text-xl font-bold text-neutral-900 block" />
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
        </div>
        <div className="overflow-hidden rounded-2xl border border-yellow-100 bg-yellow-50/60">
          {settings.solutionImageUrl ? (
            <ResponsiveImage src={settings.solutionImageUrl} alt="" className="h-36 w-full object-cover" />
          ) : (
            <div className="flex h-36 w-full items-center justify-center bg-yellow-100/60">
              <ArrowRight size={20} className="text-yellow-700" />
            </div>
          )}
          <div className="p-6">
            <Editable as="h3" fieldKey="solutionHeading" value={settings.solutionHeading} onFieldChange={onFieldChange} className="text-xl font-serif font-normal text-neutral-900 block" />
            <Editable
              as="p"
              fieldKey="solutionText"
              value={settings.solutionText}
              onFieldChange={onFieldChange}
              html
              multiline
              className="prose prose-neutral mt-3 text-sm leading-relaxed text-neutral-700/90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
