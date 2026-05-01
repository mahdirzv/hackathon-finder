import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('config', () => {
  it('defaults auth provider to clerk', async () => {
    vi.resetModules()
    vi.stubEnv('AUTH_PROVIDER', undefined)
    const { config } = await import('./index')
    expect(config.auth.provider).toBe('clerk')
  })

  it('defaults theme preset to neutral', async () => {
    vi.resetModules()
    vi.stubEnv('THEME_PRESET', undefined)
    const { config } = await import('./index')
    expect(config.theme.preset).toBe('neutral')
  })

  it('reads AUTH_PROVIDER from env', async () => {
    vi.resetModules()
    vi.stubEnv('AUTH_PROVIDER', 'supabase')
    const { config } = await import('./index')
    expect(config.auth.provider).toBe('supabase')
  })

  it('reads THEME_PRESET from env', async () => {
    vi.resetModules()
    vi.stubEnv('THEME_PRESET', 'vivid')
    const { config } = await import('./index')
    expect(config.theme.preset).toBe('vivid')
  })

  it('rejects unknown AUTH_PROVIDER with an actionable message', async () => {
    vi.resetModules()
    vi.stubEnv('AUTH_PROVIDER', 'supabse') // typo
    await expect(import('./index')).rejects.toThrow(/Invalid environment variables/)
    await expect(import('./index')).rejects.toThrow(/AUTH_PROVIDER/)
  })

  it('rejects unknown THEME_PRESET', async () => {
    vi.resetModules()
    vi.stubEnv('THEME_PRESET', 'dark')
    await expect(import('./index')).rejects.toThrow(/THEME_PRESET/)
  })

  it('exports AUTH_PROVIDERS and THEME_PRESETS constants', async () => {
    vi.resetModules()
    const mod = await import('./index')
    expect(mod.AUTH_PROVIDERS).toEqual(['clerk', 'supabase', 'firebase', 'custom'])
    expect(mod.THEME_PRESETS).toEqual(['neutral', 'vivid'])
  })
})
