import { redirect } from 'next/navigation'
import type { AuthServerOps } from '../../interface'

/**
 * Custom provider — stub. Implements the graceful no-keys pattern that
 * clerk and supabase use: getUser returns null, requireUser redirects to
 * /sign-in, signOut redirects. Replace with your own session/cookie logic.
 */
const customServerOps: AuthServerOps = {
  async getUser() {
    return null
  },

  async requireUser() {
    redirect('/sign-in')
  },

  async signOut() {
    redirect('/sign-in')
  },

  publicPaths: ['/sign-in', '/sign-up', '/'],
}

export default customServerOps
