import { NextResponse, type NextRequest } from 'next/server'

export const publicPaths = ['/sign-in', '/sign-up', '/']

/**
 * Custom provider proxy — stub.
 *
 * When `AUTH_PROVIDER=custom` is set without a real implementation:
 *  - Public paths (/, /sign-in, /sign-up) pass through with a console warning.
 *  - Protected paths redirect to /sign-in so the user sees a consistent
 *    "not signed in" UX instead of hitting the stub server which would throw
 *    NOT_CONFIGURED and crash the dashboard with a 500.
 *
 * Replace with your own session/cookie logic — mirror the clerk/supabase
 * patterns (call-time env guard, console.warn when not configured, protect
 * non-public routes). See src/features/auth/providers/clerk/proxy.ts.
 */
export function customProxy(req: NextRequest): NextResponse {
  if (typeof console !== 'undefined') {
    console.warn(
      '[auth] AUTH_PROVIDER=custom is set but the custom proxy is a stub. ' +
        'Implement src/features/auth/providers/custom/proxy.ts.',
    )
  }
  const { pathname } = req.nextUrl
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isPublic) return NextResponse.next()
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/sign-in'
  return NextResponse.redirect(redirectUrl)
}
