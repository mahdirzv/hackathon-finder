'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

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

const SORT_OPTIONS = [
  { value: '',         label: 'Sort: Default' },
  { value: 'deadline', label: 'Soonest deadline' },
  { value: 'prize',    label: 'Highest prize' },
]

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const mode   = params.get('mode')   ?? 'all'
  const status = params.get('status') ?? 'all'
  const sort   = params.get('sort')   ?? ''

  const [searchValue, setSearchValue] = useState(params.get('search') ?? '')

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === 'all' || value === '') {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      router.push(`/?${next.toString()}`, { scroll: false })
    },
    [params, router],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString())
      if (searchValue) {
        next.set('search', searchValue)
      } else {
        next.delete('search')
      }
      router.push(`/?${next.toString()}`, { scroll: false })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const pillGroupStyle = "flex items-center gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
  const inputGroupStyle = "rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5"

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filter hackathons">
      <input
        type="search"
        value={searchValue}
        onChange={(e: { target: HTMLInputElement }) => setSearchValue(e.target.value)}
        placeholder="Search hackathons…"
        aria-label="Search hackathons"
        className={`text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] outline-none placeholder:text-[var(--color-text-muted)] ${inputGroupStyle}`}
        style={{ minWidth: '180px' }}
      />

      <div className={pillGroupStyle}>
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

      <div className={pillGroupStyle}>
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

      <select
        value={sort}
        onChange={(e: { target: HTMLSelectElement }) => update('sort', e.target.value)}
        aria-label="Sort hackathons"
        className={`text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] outline-none cursor-pointer ${inputGroupStyle}`}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
