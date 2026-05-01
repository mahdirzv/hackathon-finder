/**
 * AUTH MODULE — PUBLIC API
 * ─────────────────────────────────────────────────────────────────────────────
 * Import everything auth-related from here. Never import from providers directly.
 *
 * Switching providers is fully env-driven:
 *   1. Set AUTH_PROVIDER=<name> in .env.local (clerk | supabase | firebase | custom)
 *   2. Fill in the provider's env vars (see .env.example)
 *   3. Restart the dev server
 *
 * Server ops AND components dispatch at runtime from config.auth.provider.
 * The root proxy imports from `@/features/auth/proxy` directly (narrow entry)
 * to avoid pulling 'use client' component modules into the proxy evaluation
 * path — see modules/auth/proxy.ts for why.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { config } from '@/config'
import type { AuthProviderName } from '@/config'
import type { AuthServerOps, AuthComponentOps } from './interface'

// Server ops
import clerkOps    from './providers/clerk/server'
import supabaseOps from './providers/supabase/server'
import firebaseOps from './providers/firebase/server'
import customOps   from './providers/custom/server'

// UI components (namespace-imported, then narrowed to AuthComponentOps shape)
import * as clerkUI    from './providers/clerk/components'
import * as supabaseUI from './providers/supabase/components'
import * as firebaseUI from './providers/firebase/components'
import * as customUI   from './providers/custom/components'

const serverProviders: Record<AuthProviderName, AuthServerOps> = {
  clerk:    clerkOps,
  supabase: supabaseOps,
  firebase: firebaseOps,
  custom:   customOps,
}

const componentProviders: Record<AuthProviderName, AuthComponentOps> = {
  clerk:    clerkUI,
  supabase: supabaseUI,
  firebase: firebaseUI,
  custom:   customUI,
}

const active = config.auth.provider

// ─── Server ops (runtime-dispatched) ──────────────────────────────────────────
const serverOps = serverProviders[active]
export const getUser     = () => serverOps.getUser()
export const requireUser = () => serverOps.requireUser()
export const signOut     = () => serverOps.signOut()
export const publicPaths = serverOps.publicPaths

// ─── Components (runtime-dispatched) ──────────────────────────────────────────
const ui = componentProviders[active]
export const SignInForm = ui.SignInForm
export const SignUpForm = ui.SignUpForm

// Note: `authProxy` lives in `./proxy.ts` (proxy-only entry) — import from
// there if you ever need it. The root src/proxy.ts does that already.
