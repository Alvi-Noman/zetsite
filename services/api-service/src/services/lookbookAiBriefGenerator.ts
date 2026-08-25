// Same idea as productAiBriefGenerator.ts, but tuned for theme-lookbook's
// visual-merchandising structure (watches/sunglasses/apparel-style
// products) instead of theme-product-launch's problem/solution framing.
// One OpenAI call produces a brief covering hero, key features, materials
// & craftsmanship, lifestyle story, what's-in-the-box, testimonials, and
// the closing CTA — cached on the product doc (keyed by a hash of
// title+description) and mapped onto buildLookbookSections' fixed,
// always-present section slots, replacing their generic placeholder copy.

import OpenAI from 'openai';
import type { Db, ObjectId } from 'mongodb';
import { hashProductBriefSource } from './productAiBriefGenerator.js';

export interface LookbookAiBriefSpecItem {
  label: string;
  value: string;
}

export interface LookbookAiBriefTestimonial {
  quote: string;
  author: string;
  rating: number;
}

export interface LookbookAiBrief {
  version: 1;
  sourceHash: string;
  generatedAt: string;
  model: string;
  hero: { heading: string; subheading: string };
  keyFeatures: { source: 'extracted' | 'generic'; items: LookbookAiBriefSpecItem[] };
  materials: { source: 'extracted' | 'generic'; heading: string; text: string };
  lifestyle: { heading: string; text: string };
  whatsInBox: { source: 'extracted' | 'generic'; includes: string; packaging: string };
  testimonials: { items: LookbookAiBriefTestimonial[] };
  finalCta: { heading: string; text: string };
}

interface ProductContext {
  title: string;
  description: string;
  category?: string;
  price?: number;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1';
const REQUEST_TIMEOUT_MS = 30_000;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildPrompt(product: ProductContext): string {
  return [
    `Product title: ${product.title}`,
    product.category ? `Category: ${product.category}` : null,
    product.price != null ? `Price: ৳${product.price.toFixed(2)}` : null,
    `Description: ${stripHtml(product.description).slice(0, 3000) || '(none provided)'}`,
    '',
    'This is for a "Lookbook" visual-merchandising landing page (watches, sunglasses, apparel, and similar considered-design products) — the tone is aspirational and craftsmanship-led, NOT a problem/solution pitch. Treat BOTH the product title and the description as sources of real product facts — merchants often pack materials, specs, or dimensions into the title itself, not just the description.',
    '',
    'Generate a structured content brief. Rules:',
    '- Never invent specs, materials, or claims not present in the title or description.',
    '- hero.heading: 5-10 words, style/design-led (e.g. evokes craftsmanship or considered design), not a problem-solving pitch.',
    '- hero.subheading: 20-25 words, descriptive, may restate the core value proposition.',
    '- keyFeatures: if the title or description states concrete materials/specs/dimensions/attributes, extract 3-4 as short label + value pairs and set source to "extracted". Otherwise write 3-4 plausible generic label/value pairs appropriate for this category (e.g. "Material: Premium, considered materials") and set source to "generic".',
    '- materials: a short heading and 1-2 sentence paragraph about materials/construction/craftsmanship. Set source to "extracted" only if the title or description actually describes materials or construction; otherwise write generic aspirational copy for this category and set source to "generic".',
    '- lifestyle: a short heading and one aspirational brand-story-style sentence (e.g. "understated, versatile, made to be worn"). This is always brand voice, never a specific factual claim.',
    '- whatsInBox: "includes" and "packaging" values. Set source to "extracted" only if the title or description explicitly states box contents; otherwise write a plausible generic guess for this category (e.g. "<product>, dust cloth, care card") and set source to "generic".',
    '- testimonials: always write 2 short, realistic, generic customer quotes (never attributed to a real person) — these are always placeholder content for the merchant to replace.',
    '- finalCta: a short closing heading (2-4 words, e.g. "Yours, today") and one short closing line (shipping/returns/durability style reassurance, ≤12 words).',
  ]
    .filter((l): l is string => l !== null)
    .join('\n');
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    hero: {
      type: 'object',
      properties: { heading: { type: 'string' }, subheading: { type: 'string' } },
      required: ['heading', 'subheading'],
      additionalProperties: false,
    },
    keyFeatures: {
      type: 'object',
      properties: {
        source: { type: 'string', enum: ['extracted', 'generic'] },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: { label: { type: 'string' }, value: { type: 'string' } },
            required: ['label', 'value'],
            additionalProperties: false,
          },
        },
      },
      required: ['source', 'items'],
      additionalProperties: false,
    },
    materials: {
      type: 'object',
      properties: {
        source: { type: 'string', enum: ['extracted', 'generic'] },
        heading: { type: 'string' },
        text: { type: 'string' },
      },
      required: ['source', 'heading', 'text'],
      additionalProperties: false,
    },
    lifestyle: {
      type: 'object',
      properties: { heading: { type: 'string' }, text: { type: 'string' } },
      required: ['heading', 'text'],
      additionalProperties: false,
    },
    whatsInBox: {
      type: 'object',
      properties: {
        source: { type: 'string', enum: ['extracted', 'generic'] },
        includes: { type: 'string' },
        packaging: { type: 'string' },
      },
      required: ['source', 'includes', 'packaging'],
      additionalProperties: false,
    },
    testimonials: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: { quote: { type: 'string' }, author: { type: 'string' }, rating: { type: 'integer' } },
            required: ['quote', 'author', 'rating'],
            additionalProperties: false,
          },
        },
      },
      required: ['items'],
      additionalProperties: false,
    },
    finalCta: {
      type: 'object',
      properties: { heading: { type: 'string' }, text: { type: 'string' } },
      required: ['heading', 'text'],
      additionalProperties: false,
    },
  },
  required: ['hero', 'keyFeatures', 'materials', 'lifestyle', 'whatsInBox', 'testimonials', 'finalCta'],
  additionalProperties: false,
} as const;

const GENERIC_KEY_FEATURES: LookbookAiBriefSpecItem[] = [
  { label: 'Material', value: 'Premium, considered materials' },
  { label: 'Made for', value: 'Everyday wear' },
];

const GENERIC_TESTIMONIALS: LookbookAiBriefTestimonial[] = [
  { quote: 'Exactly what I was looking for — arrived quickly and works great.', author: 'Verified buyer', rating: 5 },
  { quote: 'Great quality for the price. Would order again.', author: 'Verified buyer', rating: 5 },
];

function clampArray<T>(items: unknown, min: number, max: number, fallback: T[]): T[] {
  const arr = Array.isArray(items) ? (items as T[]) : [];
  if (arr.length < min) return fallback;
  return arr.slice(0, max);
}

/**
 * Best-effort brief generation. Returns null (never throws) on any failure
 * — missing key, network error, timeout, or invalid response.
 */
export async function generateLookbookAiBrief(product: ProductContext): Promise<LookbookAiBrief | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS });

  let raw: string | null | undefined;
  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You write grounded, non-fabricated e-commerce landing page copy for a considered-design/lifestyle product from its title and description. You always respond with the requested JSON structure only.',
        },
        { role: 'user', content: buildPrompt(product) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'lookbook_ai_brief', schema: RESPONSE_SCHEMA, strict: true },
      },
    });
    raw = completion.choices[0]?.message?.content;
  } catch {
    return null;
  }

  if (!raw) return null;

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;

  const hero = {
    heading: typeof parsed.hero?.heading === 'string' && parsed.hero.heading.trim() ? parsed.hero.heading.trim() : product.title,
    subheading: typeof parsed.hero?.subheading === 'string' ? parsed.hero.subheading.trim() : '',
  };

  return {
    version: 1,
    sourceHash: hashProductBriefSource(product.title, product.description),
    generatedAt: new Date().toISOString(),
    model: DEFAULT_MODEL,
    hero,
    keyFeatures: {
      source: parsed.keyFeatures?.source === 'extracted' ? 'extracted' : 'generic',
      items: clampArray(parsed.keyFeatures?.items, 2, 4, GENERIC_KEY_FEATURES),
    },
    materials: {
      source: parsed.materials?.source === 'extracted' ? 'extracted' : 'generic',
      heading: typeof parsed.materials?.heading === 'string' && parsed.materials.heading.trim() ? parsed.materials.heading.trim() : 'Materials & craftsmanship',
      text:
        typeof parsed.materials?.text === 'string' && parsed.materials.text.trim()
          ? parsed.materials.text.trim()
          : 'Every detail is chosen with intention — from the finish to the fasteners — so quality is felt, not just claimed.',
    },
    lifestyle: {
      heading:
        typeof parsed.lifestyle?.heading === 'string' && parsed.lifestyle.heading.trim()
          ? parsed.lifestyle.heading.trim()
          : 'Made for the everyday, built for anywhere',
      text:
        typeof parsed.lifestyle?.text === 'string' && parsed.lifestyle.text.trim()
          ? parsed.lifestyle.text.trim()
          : 'Understated, versatile, and made to be worn — not stored away.',
    },
    whatsInBox: {
      source: parsed.whatsInBox?.source === 'extracted' ? 'extracted' : 'generic',
      includes: typeof parsed.whatsInBox?.includes === 'string' && parsed.whatsInBox.includes.trim() ? parsed.whatsInBox.includes.trim() : `${product.title}, dust cloth, care card`,
      packaging: typeof parsed.whatsInBox?.packaging === 'string' && parsed.whatsInBox.packaging.trim() ? parsed.whatsInBox.packaging.trim() : 'Gift-ready box',
    },
    testimonials: { items: clampArray(parsed.testimonials?.items, 2, 2, GENERIC_TESTIMONIALS) },
    finalCta: {
      heading: typeof parsed.finalCta?.heading === 'string' && parsed.finalCta.heading.trim() ? parsed.finalCta.heading.trim() : 'Yours, today',
      text:
        typeof parsed.finalCta?.text === 'string' && parsed.finalCta.text.trim()
          ? parsed.finalCta.text.trim()
          : 'Free shipping. 30-day returns. Made to last.',
    },
  };
}

/**
 * Reads a cached brief off the product doc (aiBriefLookbook) if its
 * title+description hasn't changed since it was generated; otherwise
 * generates a fresh one and persists it back onto the product. Returns
 * null if generation fails (e.g. no API key) — callers fall back to
 * native/generic content.
 */
export async function getOrCreateLookbookAiBrief(
  db: Db,
  product: { _id: ObjectId; title: string; description?: string; category?: string; price?: number; aiBriefLookbook?: LookbookAiBrief | null },
): Promise<LookbookAiBrief | null> {
  const description = product.description ?? '';
  const currentHash = hashProductBriefSource(product.title, description);

  if (product.aiBriefLookbook && product.aiBriefLookbook.sourceHash === currentHash) {
    return product.aiBriefLookbook;
  }

  const brief = await generateLookbookAiBrief({
    title: product.title,
    description,
    category: product.category,
    price: product.price,
  });
  if (!brief) return null;

  await db.collection('products').updateOne({ _id: product._id }, { $set: { aiBriefLookbook: brief } });
  return brief;
}
