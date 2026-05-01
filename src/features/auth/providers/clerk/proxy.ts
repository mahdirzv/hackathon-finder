import { NextResponse, type NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

export const publicPaths = ['/sign-in(.*)', '/sign-up(.*)', '/', '/hackathons(.*)', '/api/(.*)']

const isPublicRoute = createRouteMatcher(publicPaths)

// Call-time check — env vars can be missing at import but set at request time
// (and tests stub them per-case). See clerk/server.ts for the same pattern.
const hasClerkKeys = () =>
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY)

// Build the real Clerk middleware once at module load for the common case.
// Only invoked when hasClerkKeys() is true at request time.
const realClerkProxy = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

// Named 'proxy' to match Next.js 16 file convention (middleware.ts is deprecated).
// If Clerk keys are missing at request time, no-op so the app still boots —
// useful for first-run scaffolds before the user has filled in .env.local.
export const proxy = (req: NextRequest) => {
  if (!hasClerkKeys()) {
    if (typeof console !== 'undefined') {
      console.warn(
        '[auth] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY are not set. ' +
          'Auth is disabled; add them to .env.local to enable Clerk.',
      )
    }
    return NextResponse.next()
  }
  // clerkMiddleware returns a handler that accepts (req, ev). We only have req
  // from the Next.js proxy contract; the event is optional in practice.
  return (realClerkProxy as unknown as (req: NextRequest) => Response)(req)
}

// Note: the root `src/proxy.ts` exports its own `config` matcher — Next.js
// reads the matcher from the root file only. No `export const config` here
// deliberately, to keep a single matcher source of truth.
