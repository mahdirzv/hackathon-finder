import { describe, it, expect } from 'vitest'
import { neutralTheme } from './neutral'
import { vividTheme } from './vivid'
import { getTheme } from './index'

// Every CSS var that both themes must define.
// Derived from the union of token file references so tests stay in sync with the token layer.
const REQUIRED_TOKENS = [
  // Colors
  '--color-background',
  '--color-surface',
  '--color-border',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-muted',
  '--color-accent',
  '--color-success',
  '--color-warning',
  '--color-error',
  // Radius
  '--radius',
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  // Spacing
  '--spacing-1',
  '--spacing-2',
  '--spacing-3',
  '--spacing-4',
  '--spacing-6',
  '--spacing-8',
  '--spacing-12',
  '--spacing-16',
  // Typography
  '--font-sans',
  '--font-mono',
  '--font-size-xs',
  '--font-size-sm',
  '--font-size-base',
  '--font-size-lg',
  '--font-size-xl',
  '--font-size-2xl',
  '--font-size-3xl',
  '--font-weight-normal',
  '--font-weight-medium',
  '--font-weight-semibold',
  '--font-weight-bold',
  '--line-height-tight',
  '--line-height-normal',
  '--line-height-relaxed',
  // Shadows
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
]

function checkTheme(theme: Record<string, string>, name: string) {
  for (const token of REQUIRED_TOKENS) {
    expect(
      token in theme,
      `${name} is missing required token: ${token}`
    ).toBe(true)
    expect(typeof theme[token]).toBe('string')
    expect(theme[token].length).toBeGreaterThan(0)
  }
}

describe('neutralTheme', () => {
  it('contains all required tokens', () => checkTheme(neutralTheme, 'neutralTheme'))
})

describe('vividTheme', () => {
  it('contains all required tokens', () => checkTheme(vividTheme, 'vividTheme'))
})

describe('getTheme', () => {
  it('returns neutralTheme for "neutral"', () => {
    expect(getTheme('neutral')).toBe(neutralTheme)
  })

  it('returns vividTheme for "vivid"', () => {
    expect(getTheme('vivid')).toBe(vividTheme)
  })

  it('throws for unknown preset', () => {
    expect(() => getTheme('unknown' as never)).toThrow()
  })
})
