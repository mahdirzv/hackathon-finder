import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AuthServerOps } from '../../interface'
import type { User } from '../../types'

// Call-time check — see clerk/server.ts for rationale.
const hasSupabaseKeys = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from Server Component — proxy handles session refresh
          }
        },
      },
    }
  )
}

function toUser(supabaseUser: {
  id: string
  email?: string
  user_metadata?: { full_name?: string }
}): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: supabaseUser.user_metadata?.full_name,
  }
}

const supabaseServerOps: AuthServerOps = {
  async getUser() {
    // Without keys, the proxy no-ops and the Supabase client would crash on init.
    // Return null so pages render as 'logged out' instead of 500ing.
    if (!hasSupabaseKeys()) return null
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? toUser(user) : null
  },

  async requireUser() {
    const user = await supabaseServerOps.getUser()
    if (!user) redirect('/sign-in')
    return user
  },

  async signOut() {
    if (!hasSupabaseKeys()) {
      redirect('/sign-in')
    }
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/sign-in')
  },

  publicPaths: ['/sign-in', '/sign-up', '/'],
}

export default supabaseServerOps
