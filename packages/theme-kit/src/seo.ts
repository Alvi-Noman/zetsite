export interface FaqEntry {
  question?: string;
  answer?: string;
}

export function faqJsonLd(items: FaqEntry[]): string | null {
  const entries = items.filter((i) => i.question && i.answer);
  if (entries.length === 0) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
  // Prevent a literal "</script>" inside answer text from closing the tag early.
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
