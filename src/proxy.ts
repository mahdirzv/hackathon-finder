/**
 * Root proxy (Next.js 16 — replaces middleware.ts).
 *
 * Imports from `@/features/auth/proxy` (proxy-only entry) rather than the
 * barrel to avoid pulling 'use client' component modules into the proxy's
 * server evaluation path. See `src/features/auth/proxy.ts` for why.
 *
 * Switching provider: set AUTH_PROVIDER in .env.local and restart. No code
 * edits here — new providers register in the proxyProviders map.
 */
import { authProxy } from '@/features/auth/proxy'

export const proxy = authProxy

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
