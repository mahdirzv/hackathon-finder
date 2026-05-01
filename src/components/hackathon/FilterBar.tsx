'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const MODES = [
  { value: 'all',       label: 'All modes' },
  { value: 'remote',    label: 'Remote' },
  { value: 'in-person', label: 'In-person' },
  { value: 'hybrid',    label: 'Hybrid' },
]

const STATUSES = [
  { value: 'all',      label: 'All' },
  { value: 'ongoing',  label: 'Live now' },
  { value: 'upcoming', label: 'Upcoming' },
]

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const mode   = params.get('mode')   ?? 'all'
  const status = params.get('status') ?? 'all'

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === 'all') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      router.push(`/?${next.toString()}`, { scroll: false })
    },
    [params, router],
  )

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filter hackathons">
      <div className="flex items-center gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => update('status', s.value)}
            aria-pressed={status === s.value}
            className={`px-3 py-1 text-sm rounded-[var(--radius-sm)] transition-colors ${
              status === s.value
                ? 'bg-[var(--color-accent)] text-white font-medium'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => update('mode', m.value)}
            aria-pressed={mode === m.value}
            className={`px-3 py-1 text-sm rounded-[var(--radius-sm)] transition-colors ${
              mode === m.value
                ? 'bg-[var(--color-accent)] text-white font-medium'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
