import { NextResponse, type NextRequest } from 'next/server'

export const publicPaths = ['/sign-in', '/sign-up', '/']

/**
 * Firebase provider proxy — stub.
 *
 * When `AUTH_PROVIDER=firebase` is set without a real implementation:
 *  - Public paths (/, /sign-in, /sign-up) pass through with a console warning.
 *  - Protected paths redirect to /sign-in so the user sees a consistent
 *    "not signed in" UX instead of hitting the stub server which would throw
 *    NOT_CONFIGURED and crash the dashboard with a 500.
 *
 * Replace this with real session logic — mirror the clerk/supabase patterns
 * (call-time env guard, console.warn when keys are missing, protect non-public
 * routes). See src/features/auth/providers/clerk/proxy.ts for the reference.
 */
export function firebaseProxy(req: NextRequest): NextResponse {
  if (typeof console !== 'undefined') {
    console.warn(
      '[auth] AUTH_PROVIDER=firebase is set but the firebase proxy is a stub. ' +
        'Implement src/features/auth/providers/firebase/proxy.ts to enable real auth.',
    )
  }
  const { pathname } = req.nextUrl
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isPublic) return NextResponse.next()
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/sign-in'
  return NextResponse.redirect(redirectUrl)
}
