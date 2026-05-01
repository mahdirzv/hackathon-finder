import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`redirect:${url}`) }),
}))

import provider from './server'

describe('custom provider stub (graceful no-config)', () => {
  it('getUser returns null', async () => {
    await expect(provider.getUser()).resolves.toBeNull()
  })

  it('requireUser redirects to /sign-in', async () => {
    await expect(provider.requireUser()).rejects.toThrow('redirect:/sign-in')
  })

  it('signOut redirects to /sign-in', async () => {
    await expect(provider.signOut()).rejects.toThrow('redirect:/sign-in')
  })

  it('has correct public interface shape', () => {
    expect(typeof provider.getUser).toBe('function')
    expect(typeof provider.requireUser).toBe('function')
    expect(typeof provider.signOut).toBe('function')
    expect(Array.isArray(provider.publicPaths)).toBe(true)
  })
})
