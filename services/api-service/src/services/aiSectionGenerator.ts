// Structural AI generator: turns a free-text business/offer description into
// a full, ordered PageSection[] for the `advertorial` theme — the "choose
// which sections to use" capability that nativeLandingPageBuilder.ts does
// NOT have (that file only rewrites text on a fixed skeleton built from an
// existing product). Follows the same fail-soft/whitelist discipline as
// aiContentEnhancer.ts: never throws, always returns something usable.
//
// No React/theme-kit import here on purpose — same reason
// nativeLandingPageBuilder.ts hardcodes section/block type strings instead
// of importing a theme package: this is a plain Node service, themes are
// React packages meant for the browser/SSR bundlers, not this process.

import OpenAI from 'openai';
import { ADVERTORIAL_SECTION_MANIFEST, ADVERTORIAL_SECTION_TYPES } from './sectionManifests/advertorial.js';
import type { NativeSection, NativeSectionBlock } from './nativeLandingPageBuilder.js';

export interface GenerateFromDescriptionResult {
  sections: NativeSection[];
  title: string;
  seo: { metaTitle: string; metaDescription: string };
  status: 'ai-structural' | 'native';
  model?: string;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1';
const REQUEST_TIMEOUT_MS = 30_000;

function firstSentence(plainText: string, maxLen = 140): string {
  const match = plainText.match(/^[^.!?]{1,}[.!?]/);
  const sentence = (match ? match[0] : plainText).trim();
  if (!sentence) return '';
  if (sentence.length <= maxLen) return sentence;
  return `${sentence.slice(0, maxLen - 1).trimEnd()}…`;
}

function deriveTitle(description: string): string {
  const sentence = firstSentence(description, 60) || 'New landing page';
  return sentence.length > 60 ? `${sentence.slice(0, 57)}...` : sentence;
}

function deriveSeo(description: string): { metaTitle: string; metaDescription: string } {
  return {
    metaTitle: deriveTitle(description),
    metaDescription: firstSentence(description, 155) || 'Shop now.',
  };
}

// --- Prompt construction ------------------------------------------------

function buildSystemPrompt(): string {
  const sectionLines = ADVERTORIAL_SECTION_MANIFEST.map((s) => {
    const fieldsList = s.settingsFields.length
      ? s.settingsFields.map((f) => `${f.key} (${f.type}): ${f.description}`).join('; ')
      : '(no settings fields)';
    const blocksList = s.allowedBlockTypes?.length
      ? ` Allowed block types: ${s.allowedBlockTypes
          .map((bt) => {
            const bf = s.blockFields?.[bt];
            return bf ? `${bt} [${bf.map((f) => `${f.key} (${f.type})`).join(', ')}]` : bt;
          })
          .join(', ')}.`
      : '';
    return `- "${s.type}" (${s.label}): ${s.guidance} Settings: ${fieldsList}.${blocksList}`;
  }).join('\n');

  return [
    'You design the section structure of a single-product, high-conversion "advertorial" e-commerce landing page.',
    'You choose an ordered subset of the available section types below, and fill in ONLY their listed setting/block keys.',
    'Rules:',
    '- Always start with "header" and always end with "footer".',
    '- Choose a sensible ordered subset for a realistic single-product page — typically 6 to 10 body sections between header and footer, not all available types.',
    '- Only fill setting/block keys that are explicitly listed for that section type. Omit any field you are not confident about — it will get a sensible default.',
    '- For sections with allowed block types, emit reasonable block entries using only those block types and their listed fields.',
    '- NEVER invent product facts, prices, certifications, specs, or claims that are not implied by the user\'s description. Leave a field out entirely rather than fabricate a value.',
    '- Respond with JSON only, matching the requested schema.',
    '',
    'Available section types:',
    sectionLines,
  ].join('\n');
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    seo: {
      type: 'object',
      properties: {
        metaTitle: { type: 'string' },
        metaDescription: { type: 'string' },
      },
      required: ['metaTitle', 'metaDescription'],
      additionalProperties: false,
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ADVERTORIAL_SECTION_MANIFEST.map((s) => s.type) },
          settings: { type: 'object', additionalProperties: true },
          blocks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                settings: { type: 'object', additionalProperties: true },
              },
              required: ['type', 'settings'],
              additionalProperties: false,
            },
          },
        },
        required: ['type', 'settings', 'blocks'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'seo', 'sections'],
  additionalProperties: false,
} as const;

// --- Fallback (deterministic, no LLM) ------------------------------------

// Small, hand-authored fallback — deliberately NOT a full replica of
// theme-advertorial's starter template (that's a theme-package concern; this
// service cannot import it, see file header). Just enough to always return a
// usable, on-brand draft when the AI call fails for any reason.
function buildFallbackSections(description: string): NativeSection[] {
  const heroHeading = firstSentence(description, 80) || 'Introducing our newest product';
  const plain = description.trim();

  return [
    { type: 'header', settings: { storeName: 'My Store', tagline: '' } },
    {
      type: 'hero',
      settings: { imageUrl: '', overlayOpacity: 0.35, textAlign: 'center', height: 'medium' },
      blocks: [
        { type: 'heading', settings: { text: heroHeading, size: 'lg' } },
        { type: 'text', settings: { content: firstSentence(description, 140) } },
        { type: 'button', settings: { text: 'Order now', url: '#order' } },
      ],
    },
    {
      type: 'countdownBanner',
      settings: { backgroundColor: '#dc2626', textColor: '#ffffff', align: 'center' },
      blocks: [{ type: 'heading', settings: { text: 'Limited-time offer', size: 'sm' } }],
    },
    {
      type: 'trustBadges',
      settings: { backgroundColor: '#fef2f2' },
      blocks: [
        { type: 'trustBadge', settings: { icon: 'shield', label: 'Quality guaranteed', value: '' } },
        { type: 'trustBadge', settings: { icon: 'truck', label: 'Fast delivery', value: '' } },
        { type: 'trustBadge', settings: { icon: 'creditCard', label: 'Cash on delivery', value: 'Pay when it arrives' } },
      ],
    },
    {
      type: 'richText',
      settings: { imagePosition: 'none', backgroundColor: '#ffffff', align: 'left' },
      blocks: [
        { type: 'heading', settings: { text: 'About this product', size: 'md' } },
        { type: 'text', settings: { content: plain || 'Add your product description here.' } },
      ],
    },
    {
      type: 'faq',
      settings: { allowMultipleOpen: true },
      blocks: [
        { type: 'heading', settings: { text: 'Frequently asked questions', size: 'md' } },
        { type: 'faqItem', settings: { question: 'How long does shipping take?', answer: 'Edit this answer with your store’s real shipping timeframe.' } },
        { type: 'faqItem', settings: { question: 'What is your return policy?', answer: 'Edit this answer with your store’s real return policy.' } },
      ],
    },
    { type: 'footer', settings: { showYear: true } },
  ];
}

function buildFallback(description: string): GenerateFromDescriptionResult {
  return {
    sections: buildFallbackSections(description),
    title: deriveTitle(description),
    seo: deriveSeo(description),
    status: 'native',
  };
}

// --- Second defense layer: drop anything not in the manifest -------------

function sanitizeAgainstManifest(sections: unknown): NativeSection[] {
  if (!Array.isArray(sections)) return [];
  const result: NativeSection[] = [];
  for (const raw of sections) {
    if (!raw || typeof raw !== 'object') continue;
    const s = raw as { type?: unknown; settings?: unknown; blocks?: unknown };
    if (typeof s.type !== 'string' || !ADVERTORIAL_SECTION_TYPES.has(s.type)) continue;

    const manifestEntry = ADVERTORIAL_SECTION_MANIFEST.find((m) => m.type === s.type);
    const allowedBlockTypes = new Set(manifestEntry?.allowedBlockTypes ?? []);

    const blocks: NativeSectionBlock[] = Array.isArray(s.blocks)
      ? s.blocks
          .filter(
            (b: unknown): b is { type: string; settings?: unknown } =>
              !!b && typeof b === 'object' && typeof (b as { type?: unknown }).type === 'string' && allowedBlockTypes.has((b as { type: string }).type),
          )
          .map((b) => ({
            type: b.type,
            settings: b.settings && typeof b.settings === 'object' ? (b.settings as Record<string, unknown>) : {},
          }))
      : [];

    result.push({
      type: s.type,
      settings: s.settings && typeof s.settings === 'object' ? (s.settings as Record<string, unknown>) : {},
      blocks,
    });
  }
  return result;
}

// --- Main entry point ------------------------------------------------------

/**
 * Generates an ordered section list for a landing page from a free-text
 * description. Never throws: falls back to a small hardcoded starter
 * section list (status: 'native') on any failure — missing API key, network
 * error, timeout, invalid JSON, or an AI response that sanitizes down to
 * nothing usable.
 */
export async function generateLandingPageFromDescription(
  description: string,
  themeId: 'advertorial',
): Promise<GenerateFromDescriptionResult> {
  void themeId; // only advertorial is supported today; kept for a future multi-theme manifest lookup

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return buildFallback(description);

  const client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS });

  let raw: string | null | undefined;
  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: `Business/offer description:\n${description}` },
      ],
      // NOTE: strict:true (as used in aiContentEnhancer.ts) requires every
      // object in the schema to declare additionalProperties:false with a
      // fully enumerated property list — incompatible with the free-form
      // per-section `settings`/block-`settings` bags this generator needs
      // (section settings vary by type and aren't practical to fully
      // enumerate in one strict schema). With openai@4.104.0, omitting
      // `strict` (defaulting to non-strict json_schema mode) still gets a
      // JSON-only response while allowing `additionalProperties: true` on
      // the settings objects. We rely on sanitizeAgainstManifest() below
      // plus buildSectionsField() in the route as the real safety net
      // instead of schema strictness.
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'landing_page_structure', schema: RESPONSE_SCHEMA },
      },
    });
    raw = completion.choices[0]?.message?.content;
  } catch {
    return buildFallback(description);
  }

  if (!raw) return buildFallback(description);

  let parsed: { title?: unknown; seo?: { metaTitle?: unknown; metaDescription?: unknown }; sections?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return buildFallback(description);
  }

  const sections = sanitizeAgainstManifest(parsed.sections);
  if (sections.length === 0) return buildFallback(description);

  const defaults = deriveSeo(description);
  const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : deriveTitle(description);
  const metaTitle =
    parsed.seo && typeof parsed.seo.metaTitle === 'string' && parsed.seo.metaTitle.trim() ? parsed.seo.metaTitle.trim() : defaults.metaTitle;
  const metaDescription =
    parsed.seo && typeof parsed.seo.metaDescription === 'string' && parsed.seo.metaDescription.trim()
      ? parsed.seo.metaDescription.trim()
      : defaults.metaDescription;

  return {
    sections,
    title,
    seo: { metaTitle, metaDescription },
    status: 'ai-structural',
    model: DEFAULT_MODEL,
  };
}
