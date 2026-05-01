import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`redirect:${url}`) }),
}))

vi.mock('@clerk/nextjs/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clerk/nextjs/server')>()
  return {
    ...actual,
    currentUser: vi.fn().mockResolvedValue(null),
    auth: vi.fn().mockResolvedValue({ sessionId: null }),
    clerkClient: vi.fn().mockResolvedValue({
      sessions: { revokeSession: vi.fn() },
    }),
  }
})

import provider from './server'
import { currentUser, auth, clerkClient } from '@clerk/nextjs/server'

const mockCurrentUser = vi.mocked(currentUser)
const mockAuth        = vi.mocked(auth)
const mockClerkClient = vi.mocked(clerkClient)

describe('clerk auth provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Stub keys so hasClerkKeys() short-circuit doesn't skip the mocked APIs.
    // Separate tests below verify the no-keys path explicitly.
    vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_fake')
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_fake')
    mockCurrentUser.mockResolvedValue(null)
    mockAuth.mockResolvedValue({ sessionId: null } as never)
    mockClerkClient.mockResolvedValue({
      sessions: { revokeSession: vi.fn() },
    } as never)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('has correct interface shape', () => {
    expect(typeof provider.getUser).toBe('function')
    expect(typeof provider.requireUser).toBe('function')
    expect(typeof provider.signOut).toBe('function')
    expect(Array.isArray(provider.publicPaths)).toBe(true)
    expect(provider.publicPaths).toContain('/')
  })

  it('getUser returns null when not signed in', async () => {
    const result = await provider.getUser()
    expect(result).toBeNull()
  })

  it('getUser maps clerk user to User type with firstName + lastName', async () => {
    mockCurrentUser.mockResolvedValue({
      id: 'clerk-123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    } as never)

    const result = await provider.getUser()
    expect(result).toEqual({ id: 'clerk-123', email: 'test@example.com', name: 'Test User' })
  })

  it('getUser sets name to undefined when no first or last name', async () => {
    mockCurrentUser.mockResolvedValue({
      id: 'clerk-456',
      emailAddresses: [{ emailAddress: 'anon@example.com' }],
      firstName: null,
      lastName: null,
    } as never)

    const result = await provider.getUser()
    expect(result?.name).toBeUndefined()
  })

  it('requireUser redirects to /sign-in when not authenticated', async () => {
    await expect(provider.requireUser()).rejects.toThrow('redirect:/sign-in')
  })

  it('signOut revokes session then redirects', async () => {
    const revokeSession = vi.fn()
    mockAuth.mockResolvedValue({ sessionId: 'sess-abc' } as never)
    mockClerkClient.mockResolvedValue({ sessions: { revokeSession } } as never)

    await expect(provider.signOut()).rejects.toThrow('redirect:/sign-in')
    expect(revokeSession).toHaveBeenCalledWith('sess-abc')
  })

  it('signOut redirects without revoking when no session', async () => {
    const revokeSession = vi.fn()
    mockClerkClient.mockResolvedValue({ sessions: { revokeSession } } as never)

    await expect(provider.signOut()).rejects.toThrow('redirect:/sign-in')
    expect(revokeSession).not.toHaveBeenCalled()
  })

  describe('graceful no-keys path', () => {
    beforeEach(() => {
      // Clear the stubs set in the outer beforeEach.
      vi.unstubAllEnvs()
    })

    it('getUser returns null without calling currentUser when keys are missing', async () => {
      const result = await provider.getUser()
      expect(result).toBeNull()
      expect(mockCurrentUser).not.toHaveBeenCalled()
    })

    it('signOut redirects without calling Clerk APIs when keys are missing', async () => {
      await expect(provider.signOut()).rejects.toThrow('redirect:/sign-in')
      expect(mockAuth).not.toHaveBeenCalled()
    })
  })
})
