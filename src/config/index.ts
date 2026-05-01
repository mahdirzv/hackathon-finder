/**
 * PROJECT CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for runtime env. Parses `process.env` once at module
 * load via zod — typos fail loudly, types flow through the rest of the app.
 *
 *   auth.provider:  AUTH_PROVIDER env var (default: clerk)
 *   theme.preset:   THEME_PRESET  env var (default: neutral)
 *
 * Provider secret keys are intentionally optional. When keys are missing, the
 * matching provider no-ops gracefully and the sign-in/sign-up screens render
 * a "configure <provider>" notice — useful for first-run scaffolds before
 * the user has filled in .env.local.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { z } from 'zod'

export const AUTH_PROVIDERS = ['clerk', 'supabase', 'firebase', 'custom'] as const
export const THEME_PRESETS  = ['neutral', 'vivid']                         as const

export type AuthProviderName = (typeof AUTH_PROVIDERS)[number]
export type ThemePresetName  = (typeof THEME_PRESETS)[number]

const envSchema = z.object({
  AUTH_PROVIDER: z.enum(AUTH_PROVIDERS).default('clerk'),
  THEME_PRESET:  z.enum(THEME_PRESETS).default('neutral'),

  // Provider secrets — optional by design (graceful-no-keys path).
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY:                  z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL:          z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:     z.string().optional(),
})

function parseEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(
      `Invalid environment variables:\n${issues}\n` +
      `Check your .env.local against .env.example. AUTH_PROVIDER must be one of: ${AUTH_PROVIDERS.join(' | ')}.`,
    )
  }
  return result.data
}

const env = parseEnv()

export const config = {
  auth:  { provider: env.AUTH_PROVIDER },
  theme: { preset:   env.THEME_PRESET  },
} as const
