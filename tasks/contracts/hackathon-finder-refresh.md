---
phase: 1
product: HackathonFinder
deliverables: 3
---

# Contract: Hackathon Data Refresh

## Context

HackathonFinder is a Next.js 16 app (at `~/projects/HackathonFinder`) that helps users discover legitimate hackathons. The full hackathon list lives in `src/data/hackathons.json` — a plain JSON file that is the sole data source. The Hackathon type is defined in `src/types/hackathon.ts`.

The agent skill at `.claude/agents/hackathon-finder.md` documents the approved sources and rules for finding hackathons. Read it first.

Today's date: 2026-05-01. Any hackathon whose `endDate` is before today should have `status` set to `ended`.

## Deliverables

1. Fetch hackathons from DoraHacks public API (`https://dorahacks.io/api/hackathon/list?type=public&limit=20&offset=0`) using curl. Filter for entries whose end date is >= 2026-05-01. Map each to the Hackathon schema. Skip any with missing title, dates, or URL.

2. Fetch ETHGlobal events by curling `https://ethglobal.com/events` and extracting event slugs, then fetch each event's detail page for title, dates, prize, and location. Only include events ending >= 2026-05-01.

3. Merge all new hackathons into `src/data/hackathons.json`: no duplicate IDs, update `status` to `ended` on existing entries whose `endDate` < 2026-05-01, then run `pnpm build` to confirm the app still compiles.

## Verification

| Criterion | Command | Expected |
|---|---|---|
| Build passes | `cd ~/projects/HackathonFinder && pnpm build` | Exit 0, no TypeScript errors |
| JSON is valid | `python3 -c "import json; json.load(open('src/data/hackathons.json'))"` | Exit 0 |
| No duplicate IDs | `python3 -c "import json; d=json.load(open('src/data/hackathons.json')); ids=[h['id'] for h in d]; assert len(ids)==len(set(ids)), 'duplicates'"` | Exit 0 |

## MUST-FINISH

- `src/data/hackathons.json` updated with new and corrected entries
- `pnpm build` passes
