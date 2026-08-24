import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';

export interface ProofMessageSettings {
  message: string;
}

export const proofMessageSchema: SectionSchema = {
  type: 'proofMessage',
  label: 'Message',
  fields: [{ key: 'message', type: 'text', label: 'Message', default: '🔥 12 people bought this in the last 24 hours', tab: 'content' }],
  defaultSettings: { message: '🔥 12 people bought this in the last 24 hours' },
};

// Rendered by the SocialProofBar section (rotates through the full list).
export function ProofMessage(_props: SectionComponentProps<ProofMessageSettings>) {
  return null;
}
