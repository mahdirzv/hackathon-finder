import { describe, it, expect, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [], set: vi.fn() }),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`redirect:${url}`) }),
}))
vi.mock('@clerk/nextjs/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clerk/nextjs/server')>()
  return {
    ...actual,
    currentUser: vi.fn().mockResolvedValue(null),
    auth: vi.fn().mockResolvedValue({ sessionId: null }),
    clerkClient: vi.fn().mockResolvedValue({ sessions: { revokeSession: vi.fn() } }),
  }
})
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } })),
  createBrowserClient: vi.fn(() => ({})),
}))

describe('auth module public API', () => {
  it('exports getUser function', async () => {
    const auth = await import('./index')
    expect(typeof auth.getUser).toBe('function')
  })

  it('exports requireUser function', async () => {
    const auth = await import('./index')
    expect(typeof auth.requireUser).toBe('function')
  })

  it('exports signOut function', async () => {
    const auth = await import('./index')
    expect(typeof auth.signOut).toBe('function')
  })

  it('exports authProxy from the proxy-only entry', async () => {
    const proxyMod = await import('./proxy')
    expect(typeof proxyMod.authProxy).toBe('function')
  })

  it('exports publicPaths array', async () => {
    const auth = await import('./index')
    expect(Array.isArray(auth.publicPaths)).toBe(true)
    expect(auth.publicPaths.length).toBeGreaterThan(0)
  })
})
