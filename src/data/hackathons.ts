import type { Hackathon, HackathonFilters } from '@/types/hackathon'
import data from './hackathons.json'

export const hackathons = data as Hackathon[]

export function filterHackathons(list: Hackathon[], filters: HackathonFilters): Hackathon[] {
  return list.filter((h) => {
    if (filters.mode && filters.mode !== 'all' && h.mode !== filters.mode) return false
    if (filters.status && filters.status !== 'all' && h.status !== filters.status) return false
    if (filters.tag) {
      const q = filters.tag.toLowerCase()
      if (!h.tags.some((t) => t.toLowerCase().includes(q))) return false
    }
    return true
  })
}

export function getHackathons(): Hackathon[] {
  return hackathons
}

export function getHackathonById(id: string): Hackathon | undefined {
  return hackathons.find((h) => h.id === id)
}
