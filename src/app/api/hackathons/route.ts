import { NextResponse, type NextRequest } from 'next/server'
import { getHackathons, filterHackathons } from '@/data/hackathons'

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode   = searchParams.get('mode')   ?? undefined
  const status = searchParams.get('status') ?? undefined
  const tag    = searchParams.get('tag')    ?? undefined
  const search = searchParams.get('search') ?? undefined
  const sortRaw = searchParams.get('sort') ?? undefined
  const sort = (sortRaw === 'deadline' || sortRaw === 'prize') ? sortRaw : undefined

  const results = filterHackathons(getHackathons(), { mode, status, tag, search, sort })

  return NextResponse.json({
    hackathons: results,
    total: results.length,
    filters: { mode: mode ?? 'all', status: status ?? 'all', tag: tag ?? null, search: search ?? null, sort: sort ?? null },
  })
}
