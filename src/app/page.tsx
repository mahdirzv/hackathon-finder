import { Suspense } from 'react'
import { getUser } from '@/features/auth'
import { getHackathons, filterHackathons } from '@/data/hackathons'
import { Header } from '@/components/layout/Header'
import { HackathonCard } from '@/components/hackathon/HackathonCard'
import { FilterBar } from '@/components/hackathon/FilterBar'
import { NewsletterBanner } from '@/components/NewsletterBanner'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ mode?: string; status?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { mode, status } = await searchParams
  const user    = await getUser()
  const all     = getHackathons()
  const results = filterHackathons(all, { mode, status })

  const total    = all.length
  const ongoing  = all.filter((h) => h.status === 'ongoing').length
  const upcoming = all.filter((h) => h.status === 'upcoming').length

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        <section aria-labelledby="hero-heading" className="flex flex-col gap-3">
          <h1 id="hero-heading" className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Find Your Next Hackathon
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-xl">
            Browse legitimate hackathons across Devpost, MLH, ETHGlobal, and more — all in one place.
            No sign-up required to browse.
          </p>
          <div className="flex items-center gap-5 mt-1" aria-label="Summary statistics">
            <Stat value={total}    label="hackathons" />
            <Stat value={ongoing}  label="live now" accent />
            <Stat value={upcoming} label="upcoming" />
          </div>
        </section>

        {!user && <NewsletterBanner />}

        <section aria-labelledby="listings-heading">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 id="listings-heading" className="text-sm font-medium text-[var(--color-text-muted)]">
                {results.length} {results.length === 1 ? 'result' : 'results'}
                {((mode && mode !== 'all') || (status && status !== 'all')) ? ' — filtered' : ''}
              </h2>
              <Suspense>
                <FilterBar />
              </Suspense>
            </div>

            {results.length === 0 ? (
              <p className="text-center py-16 text-[var(--color-text-muted)]">
                No hackathons match your filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((h) => (
                  <HackathonCard key={h.id} hackathon={h} />
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
    </>
  )
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={`text-2xl font-bold tabular-nums ${accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}
      >
        {value}
      </span>
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
    </div>
  )
}
