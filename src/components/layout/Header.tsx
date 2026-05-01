import Link from 'next/link'
import { getUser } from '@/features/auth'
import { Button } from '@/components/ui'

export async function Header() {
  const user = await getUser()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-[var(--color-text-primary)] tracking-tight text-sm">
            HackathonFinder
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 rounded-[var(--radius)] hover:bg-[var(--color-background)] transition-colors"
            >
              Hackathons
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-xs text-[var(--color-text-muted)]">{user.email}</span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Join free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
