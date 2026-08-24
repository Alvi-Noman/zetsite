/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
          hover: 'var(--surface-hover)',
          selected: 'var(--surface-selected)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          tertiary: 'var(--ink-tertiary)',
        },
        // Brand: near-black, primary buttons/actions (Polaris "brand").
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        // Interactive: blue, links/focus/selection (Polaris "link"/"emphasis").
        link: {
          DEFAULT: 'var(--link)',
          hover: 'var(--link-hover)',
          subtle: 'var(--link-subtle)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          subtle: 'var(--danger-subtle)',
        },
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle: 'var(--warning-subtle)',
        },
      },
      fontFamily: {
        sans: ['var(--p-font-family-sans)'],
      },
      fontSize: {
        xs: ['var(--p-font-size-300)', { lineHeight: 'var(--p-font-line-height-400)' }],
        sm: ['var(--p-font-size-325)', { lineHeight: 'var(--p-font-line-height-500)' }],
        base: ['var(--p-font-size-350)', { lineHeight: 'var(--p-font-line-height-500)' }],
        lg: ['var(--p-font-size-450)', { lineHeight: 'var(--p-font-line-height-600)' }],
        xl: ['var(--p-font-size-600)', { lineHeight: 'var(--p-font-line-height-800)' }],
        '2xl': ['var(--p-font-size-750)', { lineHeight: 'var(--p-font-line-height-1000)' }],
      },
      fontWeight: {
        normal: 'var(--p-font-weight-regular)',
        medium: 'var(--p-font-weight-medium)',
        semibold: 'var(--p-font-weight-semibold)',
        bold: 'var(--p-font-weight-bold)',
      },
      borderRadius: {
        sm: 'var(--p-border-radius-100)',
        md: 'var(--p-border-radius-200)',
        lg: 'var(--p-border-radius-300)',
        xl: 'var(--p-border-radius-400)',
      },
      boxShadow: {
        xs: 'var(--p-shadow-100)',
        sm: 'var(--p-shadow-200)',
        md: 'var(--p-shadow-300)',
        lg: 'var(--p-shadow-500)',
        focus: '0 0 0 3px var(--link-subtle)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--p-motion-ease)',
      },
      transitionDuration: {
        DEFAULT: 'var(--p-motion-duration-150)',
      },
    },
  },
};
