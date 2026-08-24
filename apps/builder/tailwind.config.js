import designSystemPreset from '@zetsite/design-system/tailwind-preset';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [designSystemPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-kit/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-minimal/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-bold/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-advertorial/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-funnel/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-editorial/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-ad-funnel/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-conversion-pro/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-product-launch/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/theme-lookbook/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Extends (doesn't replace) the design-system preset's Inter stack —
        // a Bangla fallback so any Bangla text (a store name, or Bangla
        // copy rendered live in the canvas preview) still displays
        // correctly instead of tofu, since Inter has no Bengali glyphs.
        sans: ['var(--p-font-family-sans)', 'Noto Sans Bengali', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Noto Sans Bengali', 'Times New Roman', 'Times', 'serif'],
      },
    },
  },
  plugins: [typography],
};
