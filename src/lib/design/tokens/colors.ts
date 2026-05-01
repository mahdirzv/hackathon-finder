/**
 * Semantic color tokens — CSS var references only.
 * Hex values live in src/lib/design/themes/*.ts
 * Components use these tokens, never raw hex or theme values directly.
 */
export const colors = {
  background: 'var(--color-background)',
  surface:    'var(--color-surface)',
  border:     'var(--color-border)',

  text: {
    primary:   'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted:     'var(--color-text-muted)',
  },

  accent: 'var(--color-accent)',

  feedback: {
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error:   'var(--color-error)',
  },
} as const
