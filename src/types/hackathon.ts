export type HackathonMode   = 'remote' | 'in-person' | 'hybrid'
export type HackathonStatus = 'upcoming' | 'ongoing' | 'ended'
export type HackathonSource = 'Devpost' | 'MLH' | 'Devfolio' | 'DoraHacks' | 'ETHGlobal' | 'Unstop' | 'Other'

export type Hackathon = {
  id: string
  title: string
  organiser: string
  description: string
  url: string
  source: HackathonSource
  mode: HackathonMode
  status: HackathonStatus
  startDate: string
  endDate: string
  registrationDeadline?: string
  prizePool?: string
  tags: string[]
  location?: string
  teamSize?: string
}

export type HackathonFilters = {
  mode?: string
  status?: string
  tag?: string
  search?: string
  sort?: 'deadline' | 'prize'
}
