import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface ProblemSolutionQuoteSettings {
  problemHeading: string;
  problemText: string;
  solutionHeading: string;
  solutionText: string;
}

export const problemSolutionQuoteSchema: SectionSchema = {
  type: 'problemSolutionQuote',
  label: 'Problem / solution (quote-led)',
  fields: [
    { key: 'problemHeading', type: 'text', label: 'Quote author', default: 'Amara K.', tab: 'content' },
    {
      key: 'problemText',
      type: 'richtext',
      label: 'Quote (the problem, in their words)',
      default: '"I tried everything else first — nothing actually solved it."',
      tab: 'content',
    },
    { key: 'solutionHeading', type: 'text', label: 'Solution heading', default: 'There’s a better way', tab: 'content' },
    { key: 'solutionText', type: 'richtext', label: 'Solution text', default: 'We built this to remove the trade-off entirely.', tab: 'content' },
  ],
  defaultSettings: {
    problemHeading: 'Amara K.',
    problemText: '"I tried everything else first — nothing actually solved it."',
    solutionHeading: 'There’s a better way',
    solutionText: 'We built this to remove the trade-off entirely.',
  },
};

export function ProblemSolutionQuote({ settings, onFieldChange }: SectionComponentProps<ProblemSolutionQuoteSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <Editable
          as="p"
          fieldKey="problemText"
          value={settings.problemText}
          onFieldChange={onFieldChange}
          html
          multiline
          className="prose prose-neutral text-lg italic leading-relaxed text-neutral-600"
        />
        <Editable
          as="p"
          fieldKey="problemHeading"
          value={settings.problemHeading}
          onFieldChange={onFieldChange}
          className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 block"
        />
        <div className="mx-auto my-6 h-px w-10 bg-neutral-200" />
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
          className="prose prose-neutral mt-2 text-sm leading-relaxed text-neutral-700"
        />
      </div>
    </section>
  );
}
