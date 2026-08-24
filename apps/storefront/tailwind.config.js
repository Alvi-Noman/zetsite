import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
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
        // Bangla fallback after the Latin font in both stacks — Inter/the
        // default serif stack have no Bengali glyphs, so the browser
        // substitutes Noto Sans Bengali per-character automatically.
        sans: ['Inter Variable', 'Noto Sans Bengali', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Noto Sans Bengali', 'Times New Roman', 'Times', 'serif'],
      },
    },
  },
  plugins: [typography],
};
