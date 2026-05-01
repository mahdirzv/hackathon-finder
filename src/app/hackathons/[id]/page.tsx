import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getUser } from '@/features/auth'
import { getHackathonById } from '@/data/hackathons'
import { Header } from '@/components/layout/Header'
import { Badge, Button } from '@/components/ui'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const h = getHackathonById(id)
  if (!h) return { title: 'Not found' }
  return {
    title: `${h.title} — HackathonFinder`,
    description: h.description,
  }
}

const MODE_LABELS: Record<string, string> = {
  remote: 'Remote',
  'in-person': 'In-person',
  hybrid: 'Hybrid',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ongoing') return <Badge variant="success">Live now</Badge>
  if (status === 'upcoming') return <Badge variant="outline">Upcoming</Badge>
  return <Badge variant="outline" className="opacity-60">Ended</Badge>
}

export default async function HackathonDetailPage({ params }: Props) {
  const { id } = await params
  const h    = getHackathonById(id)
  const user = await getUser()
  if (!h) notFound()

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-text-primary)] transition-colors">
            Hackathons
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-secondary)] truncate max-w-[200px]">{h.title}</span>
        </nav>

        {/* Hero */}
        <section aria-labelledby="hackathon-title" className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <h1 id="hackathon-title" className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                {h.title}
              </h1>
              <p className="text-[var(--color-text-muted)]">Organised by {h.organiser}</p>
            </div>
            <StatusBadge status={h.status} />
          </div>

          <p className="text-[var(--color-text-secondary)] leading-relaxed">{h.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {h.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </section>

        {/* Key details */}
        <section
          aria-labelledby="details-heading"
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <h2 id="details-heading" className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
            Event details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Detail label="Mode"       value={MODE_LABELS[h.mode] ?? h.mode} />
            <Detail label="Prize pool" value={h.prizePool ?? 'Not disclosed'} />
            <Detail label="Start date" value={formatDate(h.startDate)} />
            <Detail label="End date"   value={formatDate(h.endDate)} />
            {h.registrationDeadline && (
              <Detail label="Registration closes" value={formatDate(h.registrationDeadline)} />
            )}
            {h.location && (
              <Detail label="Location" value={h.location} />
            )}
            {h.teamSize && (
              <Detail label="Team size" value={h.teamSize} />
            )}
            <Detail label="Source" value={h.source} />
          </dl>
        </section>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={h.url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto">
              Register on {h.source} ↗
            </Button>
          </a>
          {!user && (
            <Link href="/sign-up">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign up for digest
              </Button>
            </Link>
          )}
        </div>

        {!user && (
          <p className="text-xs text-[var(--color-text-muted)]">
            <Link href="/sign-up" className="underline underline-offset-2 hover:text-[var(--color-text-primary)]">
              Create a free account
            </Link>{' '}
            to save this hackathon and receive email notifications about new events.
          </p>
        )}

      </main>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--color-text-muted)] text-xs mb-0.5">{label}</dt>
      <dd className="text-[var(--color-text-primary)] font-medium">{value}</dd>
    </div>
  )
}
