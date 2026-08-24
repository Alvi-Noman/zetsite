import { ArrowDown } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface ProblemSolutionNarrativeSettings {
  problemHeading: string;
  problemText: string;
  solutionHeading: string;
  solutionText: string;
}

export const problemSolutionNarrativeSchema: SectionSchema = {
  type: 'problemSolutionNarrative',
  label: 'Problem / solution (narrative)',
  fields: [
    { key: 'problemHeading', type: 'text', label: 'Problem heading', default: 'Sound familiar?', tab: 'content' },
    { key: 'problemText', type: 'richtext', label: 'Problem text', default: "You've tried the usual fixes. They're slow, expensive, or just don't hold up.", tab: 'content' },
    { key: 'solutionHeading', type: 'text', label: 'Solution heading', default: 'There’s a better way', tab: 'content' },
    { key: 'solutionText', type: 'richtext', label: 'Solution text', default: 'We built this to remove the trade-off entirely.', tab: 'content' },
  ],
  defaultSettings: {
    problemHeading: 'Sound familiar?',
    problemText: "You've tried the usual fixes. They're slow, expensive, or just don't hold up.",
    solutionHeading: 'There’s a better way',
    solutionText: 'We built this to remove the trade-off entirely.',
  },
};

export function ProblemSolutionNarrative({ settings, onFieldChange }: SectionComponentProps<ProblemSolutionNarrativeSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
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
          className="prose prose-neutral text-sm leading-relaxed text-neutral-500"
        />
        <ArrowDown size={18} className="my-1 text-yellow-700" />
        <Editable
          as="h3"
          fieldKey="solutionHeading"
          value={settings.solutionHeading}
          onFieldChange={onFieldChange}
          className="text-xl font-serif font-normal text-neutral-900 block"
        />
        <Editable
          as="p"
          fieldKey="solutionText"
          value={settings.solutionText}
          onFieldChange={onFieldChange}
          html
          multiline
          className="prose prose-neutral text-sm leading-relaxed text-neutral-700"
        />
      </div>
    </section>
  );
}
