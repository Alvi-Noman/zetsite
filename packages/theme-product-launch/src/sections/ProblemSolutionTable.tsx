import { Check, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface ProblemSolutionTableSettings {
  problemHeading: string;
  problemText: string;
  solutionHeading: string;
  solutionText: string;
}

export const problemSolutionTableSchema: SectionSchema = {
  type: 'problemSolutionTable',
  label: 'Problem / solution (table)',
  fields: [
    { key: 'problemHeading', type: 'text', label: 'Old way heading', default: 'The old way', tab: 'content' },
    { key: 'problemText', type: 'richtext', label: 'Old way text', default: "Slow, expensive, and you're stuck doing it the hard way.", tab: 'content' },
    { key: 'solutionHeading', type: 'text', label: 'New way heading', default: 'The new way', tab: 'content' },
    { key: 'solutionText', type: 'richtext', label: 'New way text', default: 'Fast, affordable, and it just works.', tab: 'content' },
  ],
  defaultSettings: {
    problemHeading: 'The old way',
    problemText: "Slow, expensive, and you're stuck doing it the hard way.",
    solutionHeading: 'The new way',
    solutionText: 'Fast, affordable, and it just works.',
  },
};

export function ProblemSolutionTable({ settings, onFieldChange }: SectionComponentProps<ProblemSolutionTableSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-neutral-200">
        <div className="grid grid-cols-2 divide-x divide-neutral-200">
          <div className="flex items-center gap-2 bg-neutral-50 px-4 py-3">
            <X size={16} className="text-neutral-400" />
            <Editable
              as="span"
              fieldKey="problemHeading"
              value={settings.problemHeading}
              onFieldChange={onFieldChange}
              className="text-sm font-bold text-neutral-600"
            />
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 px-4 py-3">
            <Check size={16} className="text-yellow-700" />
            <Editable
              as="span"
              fieldKey="solutionHeading"
              value={settings.solutionHeading}
              onFieldChange={onFieldChange}
              className="text-sm font-bold text-yellow-800"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-neutral-200">
          <Editable
            as="p"
            fieldKey="problemText"
            value={settings.problemText}
            onFieldChange={onFieldChange}
            html
            multiline
            className="prose prose-neutral px-4 py-4 text-sm leading-relaxed text-neutral-600"
          />
          <Editable
            as="p"
            fieldKey="solutionText"
            value={settings.solutionText}
            onFieldChange={onFieldChange}
            html
            multiline
            className="prose prose-neutral px-4 py-4 text-sm leading-relaxed text-neutral-800"
          />
        </div>
      </div>
    </section>
  );
}
