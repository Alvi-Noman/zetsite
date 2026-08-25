// Layer 2 of the landing-page generation pipeline: optional, best-effort
// text polish on top of the native builder's guaranteed-good draft.
//
// Deliberately narrow surface: OpenAI is only ever asked to rewrite the
// VALUE of specific already-existing {sectionIndex, blockIndex, key}
// fields. It cannot add/remove/reorder sections or blocks, and it never
// sees or touches image fields — so a bad or missing response can only ever
// make the copy less polished, never break the page. See the "Landing
// Pages" plan (§3, Layer 2) for the full design rationale.

import OpenAI from 'openai';
import type { NativeSection } from './nativeLandingPageBuilder.js';

interface EditableField {
  sectionIndex: number;
  blockIndex: number;
  key: string;
  currentValue: string;
  guidance: string;
}

interface ProductContext {
  title: string;
  description: string;
  category: string;
  price?: number;
}

export interface EnhanceResult {
  sections: NativeSection[];
  status: 'ai-enhanced' | 'ai-partial';
  appliedCount: number;
  model: string;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1';
const REQUEST_TIMEOUT_MS = 30_000;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Walks the native sections and lists the specific fields OpenAI is allowed to rewrite. */
function collectEditableFields(sections: NativeSection[]): EditableField[] {
  const fields: EditableField[] = [];

  sections.forEach((section, sectionIndex) => {
    (section.blocks ?? []).forEach((block, blockIndex) => {
      if (section.type === 'hero' || section.type === 'richText') {
        if (block.type === 'heading' && typeof block.settings.text === 'string') {
          fields.push({
            sectionIndex,
            blockIndex,
            key: 'text',
            currentValue: block.settings.text,
            guidance: section.type === 'hero' ? 'Hero heading: punchy, ≤10 words, no fabricated claims.' : 'Section heading: short and specific.',
          });
        }
        if (block.type === 'text' && typeof block.settings.content === 'string') {
          fields.push({
            sectionIndex,
            blockIndex,
            key: 'content',
            currentValue: block.settings.content,
            guidance:
              section.type === 'hero'
                ? 'Hero subheading: one punchy sentence, ≤140 characters, plain text (no HTML).'
                : 'Body paragraph: may include simple HTML (<p>, <b>, <ul><li>) matching the current value\'s style, expand naturally on the current text without repeating the hero line, do not invent facts not present in the product description.',
          });
        }
      }
      if (section.type === 'faq' && block.type === 'faqItem' && typeof block.settings.answer === 'string') {
        fields.push({
          sectionIndex,
          blockIndex,
          key: 'answer',
          currentValue: block.settings.answer,
          guidance:
            'FAQ answer: only replace this generic placeholder with a real, specific answer if the product description actually contains that information (e.g. real shipping/return/fit details). Otherwise return the current value unchanged.',
        });
      }
    });
  });

  return fields;
}

function buildPrompt(product: ProductContext, fields: EditableField[]): string {
  const lines = [
    `Product: ${product.title}`,
    product.category ? `Category: ${product.category}` : null,
    product.price != null ? `Price: ৳${product.price.toFixed(2)}` : null,
    `Description: ${stripHtml(product.description).slice(0, 2000) || '(none provided)'}`,
    '',
    'Below are draft landing-page text fields. For each, return an improved value ONLY if you can genuinely improve it using the product description above — otherwise return the current value unchanged. Never invent specs, certifications, prices, or claims not present in the description. Follow each field\'s guidance exactly.',
    '',
    ...fields.map(
      (f, i) =>
        `Field ${i}: section ${f.sectionIndex}, block ${f.blockIndex}, key "${f.key}"\n  Guidance: ${f.guidance}\n  Current value: ${JSON.stringify(f.currentValue)}`,
    ),
  ];
  return lines.filter((l): l is string => l !== null).join('\n');
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    fields: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sectionIndex: { type: 'integer' },
          blockIndex: { type: 'integer' },
          key: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['sectionIndex', 'blockIndex', 'key', 'value'],
        additionalProperties: false,
      },
    },
  },
  required: ['fields'],
  additionalProperties: false,
} as const;

/**
 * Best-effort text enhancement. Returns null (never throws) on any failure —
 * missing key, network error, timeout, or invalid response — so callers can
 * simply fall back to the native draft.
 */
export async function enhanceLandingPageContent(
  nativeSections: NativeSection[],
  product: ProductContext,
): Promise<EnhanceResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const editableFields = collectEditableFields(nativeSections);
  if (editableFields.length === 0) return null;

  const client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS });

  let raw: string | null | undefined;
  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You improve e-commerce landing page copy. You never fabricate product facts, prices, specs, or certifications beyond what is given. You always respond with the requested JSON structure only.',
        },
        { role: 'user', content: buildPrompt(product, editableFields) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'landing_page_field_rewrites', schema: RESPONSE_SCHEMA, strict: true },
      },
    });
    raw = completion.choices[0]?.message?.content;
  } catch {
    return null;
  }

  if (!raw) return null;

  let parsed: { fields?: { sectionIndex: number; blockIndex: number; key: string; value: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const whitelist = new Set(editableFields.map((f) => `${f.sectionIndex}:${f.blockIndex}:${f.key}`));
  const next = nativeSections.map((s) => ({ ...s, blocks: s.blocks?.map((b) => ({ ...b, settings: { ...b.settings } })) }));

  let appliedCount = 0;
  let sawResult = false;
  for (const item of parsed.fields ?? []) {
    sawResult = true;
    if (!item || typeof item.value !== 'string') continue;
    const addr = `${item.sectionIndex}:${item.blockIndex}:${item.key}`;
    if (!whitelist.has(addr)) continue;
    if (item.value.length === 0 || item.value.length > 5000) continue;

    const block = next[item.sectionIndex]?.blocks?.[item.blockIndex];
    if (!block) continue;
    block.settings[item.key] = item.value;
    appliedCount += 1;
  }

  return {
    sections: next,
    status: sawResult && appliedCount === editableFields.length ? 'ai-enhanced' : 'ai-partial',
    appliedCount,
    model: DEFAULT_MODEL,
  };
}
