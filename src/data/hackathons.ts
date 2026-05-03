import type { Hackathon, HackathonFilters } from '@/types/hackathon'
import data from './hackathons.json'

export const hackathons = data as Hackathon[]

function parsePrize(prizePool?: string): number {
  if (!prizePool) return 0
  const match = prizePool.replace(/[$£₹]/, '').replace(/,/g, '').match(/^[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

export function filterHackathons(list: Hackathon[], filters: HackathonFilters): Hackathon[] {
  let results = list.filter((h) => {
    if (filters.mode && filters.mode !== 'all' && h.mode !== filters.mode) return false
    if (filters.status && filters.status !== 'all' && h.status !== filters.status) return false
    if (filters.tag) {
      const q = filters.tag.toLowerCase()
      if (!h.tags.some((t) => t.toLowerCase().includes(q))) return false
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = [h.title, h.organiser, h.description, h.tags.join(' ')].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  if (filters.sort === 'deadline') {
    results = [...results].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  } else if (filters.sort === 'prize') {
    results = [...results].sort((a, b) => parsePrize(b.prizePool) - parsePrize(a.prizePool))
  }

  return results
}

export function getHackathons(): Hackathon[] {
  return hackathons
}

export function getHackathonById(id: string): Hackathon | undefined {
  return hackathons.find((h) => h.id === id)
}
