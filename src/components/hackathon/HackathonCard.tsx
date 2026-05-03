import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import type { Hackathon } from '@/types/hackathon'

const MODE_LABELS: Record<string, string> = {
  remote: 'Remote',
  'in-person': 'In-person',
  hybrid: 'Hybrid',
}

function StatusBadge({ status }: { status: Hackathon['status'] }) {
  if (status === 'ongoing') {
    return (
      <Badge variant="success" className="text-[10px] font-semibold uppercase tracking-wide">
        Live
      </Badge>
    )
  }
  if (status === 'upcoming') {
    return (
      <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide">
        Upcoming
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
      Ended
    </Badge>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function HackathonCard({ hackathon: h }: { hackathon: Hackathon }) {
  return (
    <article>
      <Card className="h-full flex flex-col hover:shadow-[var(--shadow-md)] transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              <CardTitle className="text-base leading-snug line-clamp-2">
                {h.title}
              </CardTitle>
              <span className="text-xs text-[var(--color-text-muted)]">{h.organiser}</span>
            </div>
            <StatusBadge status={h.status} />
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3">
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
            {h.description}
          </p>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div>
              <dt className="text-[var(--color-text-muted)]">Mode</dt>
              <dd className="text-[var(--color-text-primary)] font-medium mt-0.5">{MODE_LABELS[h.mode]}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Prize</dt>
              <dd className="text-[var(--color-text-primary)] font-medium mt-0.5">{h.prizePool ?? '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--color-text-muted)]">Dates</dt>
              <dd className="text-[var(--color-text-primary)] font-medium mt-0.5">
                {formatDate(h.startDate)} – {formatDate(h.endDate)}
              </dd>
            </div>
            {h.location && (
              <div className="col-span-2">
                <dt className="text-[var(--color-text-muted)]">Location</dt>
                <dd className="text-[var(--color-text-primary)] font-medium mt-0.5">{h.location}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-1">
            {h.tags.map((tag) => (
              <a key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className="hover:underline cursor-pointer">
                <Badge variant="outline" className="text-[10px]">{tag}</Badge>
              </a>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-0 gap-2">
          <Link href={`/hackathons/${h.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">Details</Button>
          </Link>
          <a href={h.url} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full">Register ↗</Button>
          </a>
        </CardFooter>
      </Card>
    </article>
  )
}
