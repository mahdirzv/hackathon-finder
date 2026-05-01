import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const publicPaths = ['/sign-in', '/sign-up', '/']

// Call-time check — see clerk/server.ts for rationale.
const hasSupabaseKeys = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function supabaseProxy(request: NextRequest): Promise<NextResponse> {
  // Without keys, no-op so the app still boots — useful for first-run scaffolds.
  if (!hasSupabaseKeys()) {
    if (typeof console !== 'undefined') {
      console.warn(
        '[auth] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. ' +
          'Auth is disabled; add them to .env.local to enable Supabase.',
      )
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session — required, do not remove
  await supabase.auth.getUser()

  return supabaseResponse
}
