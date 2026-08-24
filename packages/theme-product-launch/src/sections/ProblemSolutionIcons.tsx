import { Check, X } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { Editable } from '@zetsite/theme-kit';

export interface ProblemSolutionIconsSettings {
  problemHeading: string;
  problemText: string;
  solutionHeading: string;
  solutionText: string;
}

export const problemSolutionIconsSchema: SectionSchema = {
  type: 'problemSolutionIcons',
  label: 'Problem / solution (icon lists)',
  fields: [
    { key: 'problemHeading', type: 'text', label: 'Problem heading', default: 'The pain points', tab: 'content' },
    {
      key: 'problemText',
      type: 'richtext',
      label: 'Problem list (one per line)',
      default: "Slow and time-consuming\nExpensive with hidden costs\nDoesn't hold up long-term",
      tab: 'content',
    },
    { key: 'solutionHeading', type: 'text', label: 'Solution heading', default: 'What you get instead', tab: 'content' },
    {
      key: 'solutionText',
      type: 'richtext',
      label: 'Solution list (one per line)',
      default: 'Set up in minutes\nHonest, upfront pricing\nBuilt to last, guaranteed',
      tab: 'content',
    },
  ],
  defaultSettings: {
    problemHeading: 'The pain points',
    problemText: "Slow and time-consuming\nExpensive with hidden costs\nDoesn't hold up long-term",
    solutionHeading: 'What you get instead',
    solutionText: 'Set up in minutes\nHonest, upfront pricing\nBuilt to last, guaranteed',
  },
};

function Lines({ text }: { text: string }) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export function ProblemSolutionIcons({ settings, onFieldChange }: SectionComponentProps<ProblemSolutionIconsSettings>) {
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
        <div>
          <Editable
            as="h3"
            fieldKey="problemHeading"
            value={settings.problemHeading}
            onFieldChange={onFieldChange}
            className="mb-3 text-lg font-bold text-neutral-900 block"
          />
          <ul className="space-y-2">
            {Lines({ text: settings.problemText }).map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                <X size={16} className="mt-0.5 shrink-0 text-neutral-400" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Editable
            as="h3"
            fieldKey="solutionHeading"
            value={settings.solutionHeading}
            onFieldChange={onFieldChange}
            className="mb-3 text-lg font-bold text-neutral-900 block"
          />
          <ul className="space-y-2">
            {Lines({ text: settings.solutionText }).map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-800">
                <Check size={16} className="mt-0.5 shrink-0 text-yellow-700" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
