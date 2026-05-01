export const typography = {
  fontFamily: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },

  fontSize: {
    xs:   'var(--font-size-xs)',
    sm:   'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg:   'var(--font-size-lg)',
    xl:   'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
  },

  fontWeight: {
    normal:   'var(--font-weight-normal)',
    medium:   'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold:     'var(--font-weight-bold)',
  },

  lineHeight: {
    tight:   'var(--line-height-tight)',
    normal:  'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
  },
} as const
