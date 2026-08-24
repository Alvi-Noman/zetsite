export interface ImageVariants {
  thumbnail?: string;
  medium?: string;
  large?: string;
  avif?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

const MD_WEBP = /-md\.webp$/;

// Upload URLs are content-hashed and follow a fixed naming convention
// (uploadRoutes.ts's processImage: {hash}-thumb/md/lg.webp + {hash}-thumb/md/lg.avif).
// Only the flat medium WebP URL is ever persisted into section/block settings,
// so the sibling variant URLs are derived here rather than stored — no
// backend or schema change needed. Legacy/external URLs that don't match the
// convention fall back to undefined so callers can render a plain <img>.
export function deriveImageVariants(url: string | undefined): ImageVariants | undefined {
  if (!url || !MD_WEBP.test(url)) return undefined;
  const base = url.replace(MD_WEBP, '');
  return {
    thumbnail: `${base}-thumb.webp`,
    medium: url,
    large: `${base}-lg.webp`,
    avif: {
      thumbnail: `${base}-thumb.avif`,
      medium: `${base}-md.avif`,
      large: `${base}-lg.avif`,
    },
  };
}

// For CSS background-image (Hero/HeroSlideshow), which can't use <picture>.
// image-set() lets the browser pick AVIF when supported and falls back to
// the plain url() for anything that doesn't understand image-set() at all.
export function backgroundImageSet(url: string | undefined): string {
  if (!url) return '';
  const variants = deriveImageVariants(url);
  if (!variants?.avif?.large) return `url(${url})`;
  return `image-set(url(${variants.avif.large}) type("image/avif"), url(${variants.large ?? url}) type("image/webp"))`;
}
