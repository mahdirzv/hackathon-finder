import { requireUser, signOut } from '@/features/auth'
import { getHackathons } from '@/data/hackathons'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await requireUser()
  const all  = getHackathons()

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  const ongoing  = all.filter((h) => h.status === 'ongoing')
  const upcoming = all.filter((h) => h.status === 'upcoming').slice(0, 3)

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {user.name ? `Welcome, ${user.name.split(' ')[0]}` : 'Your dashboard'}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{user.email}</p>
          </div>
          <form action={handleSignOut}>
            <Button variant="outline" size="sm" type="submit">Sign out</Button>
          </form>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Email" value={user.email} />
              {user.name && <Row label="Name" value={user.name} />}
              <Row label="Account ID" value={user.id} mono />
            </dl>
          </CardContent>
        </Card>

        {/* Email digest preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Email digest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Choose how often you receive hackathon updates at <strong>{user.email}</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Weekly', 'Daily', 'Off'].map((freq) => (
                  <Badge
                    key={freq}
                    variant={freq === 'Weekly' ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1 text-sm rounded-[var(--radius)]"
                  >
                    {freq}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Email delivery requires backend integration — coming soon.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Live hackathons quick view */}
        <Card>
          <CardHeader>
            <CardTitle>Live right now</CardTitle>
          </CardHeader>
          <CardContent>
            {ongoing.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No ongoing hackathons at the moment.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {ongoing.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-text-primary)] truncate">{h.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Ends {new Date(h.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {h.prizePool ? ` · ${h.prizePool}` : ''}
                      </p>
                    </div>
                    <a href={h.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button variant="outline" size="sm">Register ↗</Button>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming quick view */}
        <Card>
          <CardHeader>
            <CardTitle>Coming up</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {upcoming.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)] truncate">{h.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Starts {new Date(h.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {h.prizePool ? ` · ${h.prizePool}` : ''}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">{h.mode}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </main>
    </>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="text-[var(--color-text-muted)] w-20 shrink-0">{label}</dt>
      <dd className={mono ? 'text-xs text-[var(--color-text-muted)] font-mono' : 'text-[var(--color-text-primary)]'}>
        {value}
      </dd>
    </div>
  )
}
