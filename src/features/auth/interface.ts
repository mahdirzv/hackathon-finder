import type { NextRequest, NextResponse } from 'next/server'
import type { User } from './types'

/**
 * Every auth provider must implement this interface.
 * Screens import from @/features/auth — never from providers directly.
 */
export interface AuthServerOps {
  /** Returns the current user, or null if not authenticated. */
  getUser(): Promise<User | null>

  /**
   * Returns the current user.
   * Redirects to /sign-in if not authenticated (never returns null).
   */
  requireUser(): Promise<User>

  /** Signs the current user out and clears the session. */
  signOut(): Promise<void>

  /**
   * Paths that bypass auth protection (no redirect to sign-in).
   * Informational — the active provider's proxy uses its own copy
   * (some providers need regex patterns, some need exact paths).
   */
  publicPaths: string[]
}

export interface AuthComponentOps {
  /**
   * Sign-in form component.
   * Handles all provider-specific logic internally.
   * On success: redirects to /dashboard.
   */
  SignInForm: React.ComponentType

  /**
   * Sign-up form component.
   * On success: redirects to /dashboard.
   */
  SignUpForm: React.ComponentType
}

/**
 * Proxy function. Called by the root src/proxy.ts on every request the
 * Next.js matcher selects. In Next.js 16, 'middleware' is renamed to 'proxy'
 * at the file level — providers export a function named `<provider>Proxy`.
 *
 * Return type accepts `Response` (not just `NextResponse`) because Clerk's
 * `clerkMiddleware` returns a plain `Response`. `NextResponse extends Response`,
 * so returning either is valid.
 */
export type AuthProxy = (
  req: NextRequest,
) => Response | NextResponse | void | Promise<Response | NextResponse | void>
