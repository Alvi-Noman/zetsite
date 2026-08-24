import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface ProofStatSettings {
  stat: string;
  label: string;
}

export const proofStatSchema: SectionSchema = {
  type: 'proofStat',
  label: 'Rating badge (big stat)',
  fields: [
    { key: 'stat', type: 'text', label: 'Stat', default: '10,000+', tab: 'content' },
    { key: 'label', type: 'text', label: 'Label', default: 'happy customers', tab: 'content' },
  ],
  defaultSettings: { stat: '10,000+', label: 'happy customers' },
};

export function ProofStat({ settings }: SectionComponentProps<ProofStatSettings>) {
  if (!settings.stat) return null;
  return (
    <div className="px-4 pb-4 text-center">
      <p className="text-3xl font-black tracking-tight text-neutral-900">{settings.stat}</p>
      <p className="text-sm text-neutral-500">{settings.label}</p>
    </div>
  );
}
