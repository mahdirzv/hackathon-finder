/**
 * Neutral theme preset — clean, minimal, professional.
 * All hex values for CSS custom properties live here.
 */
export const neutralTheme: Record<string, string> = {
  '--color-background': '#f8fafc',
  '--color-surface':    '#ffffff',
  '--color-border':     '#e2e8f0',

  '--color-text-primary':   '#0f172a',
  '--color-text-secondary': '#334155',
  '--color-text-muted':     '#64748b',

  '--color-accent': '#0369a1',

  '--color-success': '#059669',
  '--color-warning': '#d97706',
  '--color-error':   '#dc2626',

  '--radius':    '0.5rem',
  '--radius-sm': 'calc(0.5rem * 0.6)',
  '--radius-md': 'calc(0.5rem * 0.8)',
  '--radius-lg': '0.5rem',

  '--spacing-1':  '4px',
  '--spacing-2':  '8px',
  '--spacing-3':  '12px',
  '--spacing-4':  '16px',
  '--spacing-6':  '24px',
  '--spacing-8':  '32px',
  '--spacing-12': '48px',
  '--spacing-16': '64px',

  '--font-sans': 'Inter, ui-sans-serif, system-ui, sans-serif',
  '--font-mono': 'JetBrains Mono, ui-monospace, monospace',
  '--font-size-xs':   '0.75rem',
  '--font-size-sm':   '0.875rem',
  '--font-size-base': '1rem',
  '--font-size-lg':   '1.125rem',
  '--font-size-xl':   '1.25rem',
  '--font-size-2xl':  '1.5rem',
  '--font-size-3xl':  '1.875rem',
  '--font-weight-normal':   '400',
  '--font-weight-medium':   '500',
  '--font-weight-semibold': '600',
  '--font-weight-bold':     '700',
  '--line-height-tight':    '1.25',
  '--line-height-normal':   '1.5',
  '--line-height-relaxed':  '1.75',

  '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
}
