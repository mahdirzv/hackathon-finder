import type { Metadata } from 'next'
import { config } from '@/config'
import { getTheme } from '@/lib/design/themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'HackathonFinder — Find your next hackathon',
  description: 'Browse legitimate hackathons across Devpost, MLH, ETHGlobal, and more. Filter by mode, status, and tech stack.',
}

// ClerkProvider requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to be set.
// Read at call time so dev hot-reloads and prod builds with different envs
// behave correctly. Matches the call-time guard pattern used in provider code.
const getClerkKey = () => process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

// RootLayout is async so we can lazy-import ClerkProvider ONLY when
// AUTH_PROVIDER=clerk. Under any other provider the @clerk/nextjs chunk is
// never loaded — keeps the supabase/firebase/custom bundles Clerk-free.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme(config.theme.preset)

  // Convert theme object to inline CSS custom properties. Values come from
  // our own themes/*.ts files (hex + units), so `;` and `<` cannot appear.
  const themeVars = Object.entries(theme)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  const head = (
    <head>
      <style>{`:root { ${themeVars} }`}</style>
    </head>
  )

  // Fast path: any non-clerk provider OR clerk with no keys. Skip the dynamic
  // import entirely — Clerk's package never enters the bundle.
  const clerkKey = getClerkKey()
  if (config.auth.provider !== 'clerk' || !clerkKey) {
    return (
      <html lang="en">
        {head}
        <body>{children}</body>
      </html>
    )
  }

  // Clerk path: dynamic import so non-clerk builds don't pay the cost.
  const { ClerkProvider } = await import('@clerk/nextjs')
  return (
    <html lang="en">
      {head}
      <body>
        <ClerkProvider publishableKey={clerkKey}>{children}</ClerkProvider>
      </body>
    </html>
  )
}
