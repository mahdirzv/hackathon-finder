/**
 * Proxy-only entry point for the auth module.
 *
 * Why a separate file? `src/proxy.ts` (Next.js 16 root proxy) runs in an
 * edge/server context. Importing the auth module's barrel (`./index`) would
 * chain-load every provider's `'use client'` components at proxy evaluation,
 * which Next.js can't cleanly analyze — it broke the `redirect('/sign-in')`
 * path in v0.1.4 (/dashboard returned 200 instead of 307).
 *
 * This file imports ONLY the per-provider proxy functions, keeping the root
 * proxy path free of any client component imports.
 */
import { config } from '@/config'
import type { AuthProviderName } from '@/config'
import type { AuthProxy } from './interface'

import { proxy as clerkProxy } from './providers/clerk/proxy'
import { supabaseProxy }       from './providers/supabase/proxy'
import { firebaseProxy }       from './providers/firebase/proxy'
import { customProxy }         from './providers/custom/proxy'

const proxyProviders: Record<AuthProviderName, AuthProxy> = {
  clerk:    clerkProxy,
  supabase: supabaseProxy,
  firebase: firebaseProxy,
  custom:   customProxy,
}

export const authProxy: AuthProxy = proxyProviders[config.auth.provider]
