import { redirect } from 'next/navigation'
import type { AuthServerOps } from '../../interface'

/**
 * Firebase provider — stub. Implements the graceful no-keys pattern that
 * clerk and supabase use: getUser returns null (so pages render as
 * "logged out"), requireUser redirects to /sign-in, signOut redirects.
 *
 * Replace with a real Firebase Admin SDK implementation. Install
 * `firebase-admin` and read the session cookie set by the Firebase client SDK.
 */
const firebaseServerOps: AuthServerOps = {
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

export default firebaseServerOps
