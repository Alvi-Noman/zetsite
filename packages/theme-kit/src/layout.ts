import type { CSSProperties } from 'react';

export type ContentAlign = 'left' | 'center' | 'right';
export type ContentWidth = 'page' | 'full';

// Shared by section components in both themes so "Alignment" and "Width"
// settings behave consistently everywhere they're offered.
export const ALIGN_CLASS: Record<ContentAlign, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

export function widthClass(width: ContentWidth | undefined, pageMaxWidth: string): string {
  return width === 'full' ? '' : pageMaxWidth;
}

export const ALIGN_FIELD = {
  key: 'align',
  type: 'select' as const,
  label: 'Alignment',
  default: 'center',
  tab: 'style' as const,
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
};

export const WIDTH_FIELD = {
  key: 'width',
  type: 'select' as const,
  label: 'Width',
  default: 'page',
  tab: 'style' as const,
  options: [
    { label: 'Page', value: 'page' },
    { label: 'Full', value: 'full' },
  ],
};

export function gapField(defaultPx: number) {
  return {
    key: 'gap',
    type: 'number' as const,
    label: 'Gap (px)',
    default: defaultPx,
    tab: 'style' as const,
  };
}

export type ImageAspect = 'natural' | 'square' | 'landscape' | 'portrait';

export const ASPECT_CLASS: Record<ImageAspect, string> = {
  natural: '',
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
};

export const IMAGE_ASPECT_FIELD = {
  key: 'imageAspect',
  type: 'select' as const,
  label: 'Image aspect ratio',
  default: 'natural',
  tab: 'style' as const,
  options: [
    { label: 'Natural', value: 'natural' },
    { label: 'Square', value: 'square' },
    { label: 'Landscape', value: 'landscape' },
    { label: 'Portrait', value: 'portrait' },
  ],
};

export const MOBILE_IMAGE_FIELD = {
  key: 'mobileImageUrl',
  type: 'image' as const,
  label: 'Mobile image (optional)',
  default: '',
  tab: 'content' as const,
};

export function successMessageField(defaultText: string) {
  return {
    key: 'successMessage',
    type: 'text' as const,
    label: 'Success message',
    default: defaultText,
    tab: 'content' as const,
  };
}

export const AUTOPLAY_FIELD = {
  key: 'autoplay',
  type: 'boolean' as const,
  label: 'Autoplay',
  default: true,
  tab: 'advanced' as const,
};

export const LOOP_FIELD = {
  key: 'loop',
  type: 'boolean' as const,
  label: 'Loop',
  default: true,
  tab: 'advanced' as const,
};

export const MUTED_FIELD = {
  key: 'muted',
  type: 'boolean' as const,
  label: 'Mute audio',
  default: true,
  tab: 'advanced' as const,
};

export const DISMISSIBLE_FIELD = {
  key: 'dismissible',
  type: 'boolean' as const,
  label: 'Allow visitors to dismiss',
  default: false,
  tab: 'advanced' as const,
};

export type SectionHeight = 'small' | 'medium' | 'large' | 'full';

export const HEIGHT_CLASS: Record<SectionHeight, string> = {
  small: 'min-h-[320px]',
  medium: 'min-h-[480px]',
  large: 'min-h-[640px]',
  full: 'min-h-screen',
};

export const HEIGHT_FIELD = {
  key: 'height',
  type: 'select' as const,
  label: 'Section height',
  default: 'medium',
  tab: 'style' as const,
  options: [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Full screen', value: 'full' },
  ],
};

// Matches Shopify Dawn's "content position" pattern: vertical placement is a
// separate axis from horizontal alignment, combined to form a 9-point grid
// (top-left … bottom-right) the way image-banner/slideshow expose it.
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export const VERTICAL_ALIGN_CLASS: Record<VerticalAlign, string> = {
  top: 'justify-start',
  middle: 'justify-center',
  bottom: 'justify-end',
};

export const VERTICAL_ALIGN_FIELD = {
  key: 'verticalAlign',
  type: 'select' as const,
  label: 'Content position (vertical)',
  default: 'middle',
  tab: 'style' as const,
  options: [
    { label: 'Top', value: 'top' },
    { label: 'Middle', value: 'middle' },
    { label: 'Bottom', value: 'bottom' },
  ],
};

// Dawn's "mobile_content_alignment" — a separate alignment control for small
// screens, distinct from the desktop ALIGN_FIELD.
export const MOBILE_ALIGN_FIELD = {
  key: 'mobileAlign',
  type: 'select' as const,
  label: 'Text alignment (mobile)',
  default: 'center',
  tab: 'style' as const,
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
};

// Dawn's "image_behavior: ambient" — a slow continuous zoom/pan (Ken Burns
// effect) applied to a background or feature image.
export const IMAGE_BEHAVIOR_FIELD = {
  key: 'imageBehavior',
  type: 'select' as const,
  label: 'Image motion',
  default: 'none',
  tab: 'style' as const,
  options: [
    { label: 'None', value: 'none' },
    { label: 'Ambient zoom', value: 'ambient' },
  ],
};

export const AMBIENT_ZOOM_KEYFRAMES = `
  @keyframes zetsite-ambient-zoom { from { transform: scale(1); } to { transform: scale(1.08); } }
`;

export function ambientZoomStyle(behavior: string | undefined): CSSProperties | undefined {
  if (behavior !== 'ambient') return undefined;
  return { animation: 'zetsite-ambient-zoom 20s ease-in-out infinite alternate' };
}

// Dawn's "show_text_box" — an optional semi-transparent backdrop behind text
// overlaid on an image, so copy stays legible regardless of image contrast.
export const SHOW_TEXT_BACKDROP_FIELD = {
  key: 'showTextBackdrop',
  type: 'boolean' as const,
  label: 'Show background behind text',
  default: false,
  tab: 'style' as const,
};

export const TEXT_BACKDROP_CLASS = 'rounded-lg bg-black/30 p-6 backdrop-blur-sm';
