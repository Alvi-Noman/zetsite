import type { SectionComponentProps, SectionSchema } from '@zetsite/theme-kit';
import { MOBILE_IMAGE_FIELD } from '@zetsite/theme-kit';

export interface SlideSettings {
  imageUrl: string;
  mobileImageUrl: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
}

export const slideSchema: SectionSchema = {
  type: 'slide',
  label: 'Slide',
  fields: [
    { key: 'imageUrl', type: 'image', label: 'Image', default: '', tab: 'content' },
    MOBILE_IMAGE_FIELD,
    { key: 'heading', type: 'text', label: 'Heading', default: 'New arrivals', tab: 'content' },
    { key: 'subheading', type: 'text', label: 'Subheading', default: '', tab: 'content' },
    { key: 'buttonText', type: 'text', label: 'Button text', default: 'Shop now', tab: 'content' },
    { key: 'buttonUrl', type: 'url', label: 'Button link', default: '/', tab: 'content' },
  ],
  defaultSettings: {
    imageUrl: '',
    mobileImageUrl: '',
    heading: 'New arrivals',
    subheading: '',
    buttonText: 'Shop now',
    buttonUrl: '/',
  },
};

// Rendered entirely by the HeroSlideshow section (which owns the rotation state).
export function Slide(_props: SectionComponentProps<SlideSettings>) {
  return null;
}
