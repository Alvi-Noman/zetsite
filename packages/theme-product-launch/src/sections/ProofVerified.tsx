import { ShieldCheck } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface ProofVerifiedSettings {
  text: string;
}

export const proofVerifiedSchema: SectionSchema = {
  type: 'proofVerified',
  label: 'Rating badge (verified)',
  fields: [{ key: 'text', type: 'text', label: 'Text', default: 'Verified reviews', tab: 'content' }],
  defaultSettings: { text: 'Verified reviews' },
};

export function ProofVerified({ settings }: SectionComponentProps<ProofVerifiedSettings>) {
  if (!settings.text) return null;
  return (
    <div className="flex justify-center px-4 pb-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white">
        <ShieldCheck size={14} strokeWidth={2.5} />
        {settings.text}
      </span>
    </div>
  );
}
