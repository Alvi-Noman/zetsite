import type { ImgHTMLAttributes } from 'react';
import { deriveImageVariants } from './media.js';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string | undefined;
  alt: string;
  sizes?: string;
  /** LCP hint: renders eager + fetchpriority=high instead of the lazy default. */
  priority?: boolean;
}

const WIDTHS: Record<'thumbnail' | 'medium' | 'large', number> = {
  thumbnail: 200,
  medium: 800,
  large: 1600,
};

function buildSrcSet(sizes: { thumbnail?: string; medium?: string; large?: string } | undefined) {
  if (!sizes) return undefined;
  const srcSet = (Object.entries(WIDTHS) as [keyof typeof WIDTHS, number][])
    .filter(([key]) => sizes[key])
    .map(([key, width]) => `${sizes[key]} ${width}w`)
    .join(', ');
  return srcSet || undefined;
}

/**
 * Renders a variant-aware <picture> for storefront images: an AVIF <source>
 * (smaller, preferred) with a WebP <img> fallback, both with srcset across
 * thumbnail/medium/large widths (derived from the stored medium URL via
 * deriveImageVariants), lazy-loading unless `priority`. Falls back to a
 * plain <img src> when the URL doesn't match the generated-variant naming
 * convention (legacy/external images).
 */
export function ResponsiveImage({ src, alt, sizes = '(max-width: 640px) 100vw, 800px', priority = false, className, ...props }: ResponsiveImageProps) {
  if (!src) return null;

  const variants = deriveImageVariants(src);
  const webpSrcSet = buildSrcSet(variants);
  const avifSrcSet = buildSrcSet(variants?.avif);

  const imgProps = {
    src,
    srcSet: webpSrcSet,
    sizes: webpSrcSet ? sizes : undefined,
    alt,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    fetchPriority: priority ? ('high' as const) : ('auto' as const),
    className,
    ...props,
  };

  if (!avifSrcSet) {
    return <img {...imgProps} />;
  }

  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <img {...imgProps} />
    </picture>
  );
}
