import { describe, it, expect } from 'vitest'
import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { radius } from './radius'
import { shadows } from './shadows'

// Sentinel values: these literal strings are intentionally not CSS vars.
// Any other non-var value in a token file is an architecture violation.
const ALLOWED_LITERALS = new Set(['0px', '9999px', 'none'])

function checkCssVars(obj: Record<string, unknown>, path = '') {
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'object' && val !== null) {
      checkCssVars(val as Record<string, unknown>, `${path}.${key}`)
    } else {
      const str = val as string
      const isVarRef   = typeof str === 'string' && str.startsWith('var(--')
      const isSentinel = ALLOWED_LITERALS.has(str)
      expect(
        isVarRef || isSentinel,
        `${path}.${key} = "${val}" must be a CSS var reference or an allowed literal (${[...ALLOWED_LITERALS].join(', ')})`
      ).toBe(true)
    }
  }
}

describe('color tokens', () => {
  it('all values are CSS var references', () => {
    checkCssVars(colors as unknown as Record<string, unknown>)
  })
})

describe('typography tokens', () => {
  it('all values are CSS var references', () => {
    checkCssVars(typography as unknown as Record<string, unknown>)
  })
})

describe('spacing tokens', () => {
  it('all values are CSS var references or allowed literals', () => {
    checkCssVars(spacing as unknown as Record<string, unknown>)
  })
})

describe('radius tokens', () => {
  it('all values are CSS var references or allowed literals', () => {
    checkCssVars(radius as unknown as Record<string, unknown>)
  })
})

describe('shadows tokens', () => {
  it('all values are CSS var references or allowed literals', () => {
    checkCssVars(shadows as unknown as Record<string, unknown>)
  })
})
