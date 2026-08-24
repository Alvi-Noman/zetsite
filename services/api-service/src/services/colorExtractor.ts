import path from 'path';
import sharp from 'sharp';
import { UPLOAD_DIR } from '../routes/uploadRoutes.js';

/**
 * Extracts an approximate dominant color from an image URL by downsampling
 * to a single pixel (sharp resizes with averaging, so the result is close to
 * a true average color) — no ML/AI involved, just pixel math. Used to give a
 * generated landing page's Hero a background/accent that isn't a flat
 * generic default.
 */
export async function extractDominantColor(imageUrl: string): Promise<string | null> {
  try {
    let input: string | Buffer;
    if (/^https?:\/\//i.test(imageUrl)) {
      input = await fetchBuffer(imageUrl);
    } else if (imageUrl.startsWith('/api/uploads/')) {
      // Locally-hosted upload — read straight off disk, no HTTP round-trip.
      input = path.join(UPLOAD_DIR, imageUrl.replace('/api/uploads/', ''));
    } else {
      return null;
    }

    const { data } = await sharp(input)
      .resize(1, 1, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const [r, g, b] = data;
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return null;
  }
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Mixes a hex color toward white by `amount` (0-1) — for a tasteful tinted
 * section background rather than a jarring solid block of the raw color. */
export function lighten(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** True if a hex color is dark enough that white text should sit on top of it. */
export function isDarkColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Perceived brightness (ITU-R BT.601).
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 140;
}
