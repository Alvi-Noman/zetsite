import { useState, type ImgHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface ImageVariants {
  thumbnail?: string;
  medium?: string;
  large?: string;
  original?: string;
  placeholder?: string;
  avif?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  variants?: ImageVariants;
  /** Used when there are no generated variants (e.g. legacy uploads). */
  fallbackSrc?: string;
  alt: string;
  sizes?: string;
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
 * Renders a variant-aware <picture>: an AVIF <source> (smaller, preferred)
 * with a WebP <img> fallback, both with srcset across thumbnail/medium/large
 * widths, lazy-loading unless `priority`, and a blurred base64 placeholder
 * (LQIP) that cross-fades out once the real image loads.
 */
export default function ResponsiveImage({
  variants,
  fallbackSrc,
  alt,
  sizes = '(max-width: 640px) 100vw, 400px',
  priority = false,
  className,
  ...props
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  const src = variants?.medium ?? variants?.large ?? variants?.thumbnail ?? fallbackSrc;
  const webpSrcSet = buildSrcSet(variants);
  const avifSrcSet = buildSrcSet(variants?.avif);

  if (!src) return null;

  return (
    <span className="relative block h-full w-full overflow-hidden">
      {variants?.placeholder && !loaded && (
        <img
          src={variants.placeholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
        />
      )}
      <picture>
        {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
        <img
          src={src}
          srcSet={webpSrcSet}
          sizes={webpSrcSet ? sizes : undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          className={clsx(
            'relative h-full w-full object-cover transition-opacity duration-300',
            loaded || !variants?.placeholder ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...props}
        />
      </picture>
    </span>
  );
}
