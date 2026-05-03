---
phase: "hackathon-finder-01-search-tags-sort"
product: "HackathonFinder"
deliverables: 4
files_touched:
  - src/types/hackathon.ts
  - src/data/hackathons.ts
  - src/components/hackathon/FilterBar.tsx
  - src/components/hackathon/HackathonCard.tsx
  - src/app/page.tsx
  - src/app/api/hackathons/route.ts
---

# Search, Tag Filters, and Sort

## Context

HackathonFinder has 50 hackathons. The FilterBar (`src/components/hackathon/FilterBar.tsx`) only supports mode and status toggles. There is no search, no tag filtering in the UI (backend `filterHackathons()` supports `tag` but it is never exposed), and no sort. Tags are displayed on cards but are not interactive.

Stack: Next.js 16, React 19, Tailwind CSS 4 (CSS vars only — no `tailwind.config.js`), all styling via `var(--color-*)` / `var(--radius*)` tokens. FilterBar is a client component using `useSearchParams` + `router.push`.

Read `AGENTS.md` before writing any code.

## Deliverables

1. **Extend types and filter logic.** In `src/types/hackathon.ts`, add `search?: string` and `sort?: 'deadline' | 'prize'` to `HackathonFilters`. In `src/data/hackathons.ts`, extend `filterHackathons()`: `search` does a case-insensitive substring match across `title`, `organiser`, `description`, and `tags` (joined) — a hackathon matches if any field contains the query. `sort` runs after filtering: `deadline` sorts by `endDate` ascending (soonest first); `prize` sorts by prize pool descending (parse leading `$` / `£` / `₹` number, treat non-numeric as 0).

2. **Search input in FilterBar.** Add a text input at the start of `FilterBar` (before the status pills). It reads `?search=` from searchParams and writes it back on change (debounced 300 ms via `useEffect` + `setTimeout`). Clear the param when the field is emptied. Styling: match the existing pill groups — same border, background, border-radius tokens. Input `placeholder="Search hackathons…"`, `aria-label="Search hackathons"`.

3. **Sort dropdown in FilterBar.** Add a `<select>` at the end of `FilterBar` that writes `?sort=` to the URL. Options: `{ value: '', label: 'Sort: Default' }`, `{ value: 'deadline', label: 'Soonest deadline' }`, `{ value: 'prize', label: 'Highest prize' }`. Same border/bg styling as the pill groups.

4. **Clickable tag pills + wire page and API.** In `HackathonCard`, wrap each tag `<span>` in an `<a href="/?tag=X">` so clicking a tag filters the listing. Style the same as now; add `hover:underline` cursor pointer. In `page.tsx`, read `search` and `sort` from `searchParams` and pass to `filterHackathons()`; update the results-count line to mention active search term if present. In `src/app/api/hackathons/route.ts`, read `?search=` and `?sort=` params and pass to `filterHackathons()`.

## Do not

- Do not add any new npm packages
- Do not use hardcoded hex colours — use `var(--color-*)` tokens only
- Do not modify `hackathons.json`, the auth system, or any files outside `files_touched`
- Do not add `React.FormEvent` (removed in React 19) — use `{ target: HTMLInputElement }` structural types

## Verification

```bash
cd ~/projects/HackathonFinder && pnpm build
```

Pass = exit 0, no TypeScript errors.

Manual checks:
- Typing in search box filters visible cards client-side
- Clicking a tag navigates to `/?tag=AI` and shows only AI-tagged hackathons
- Sort dropdown changes ordering of results
- API `GET /api/hackathons?search=google&sort=prize` returns filtered + sorted JSON

## MUST-FINISH

- [ ] `HackathonFilters` has `search` and `sort` fields
- [ ] `filterHackathons()` applies search (title+organiser+description+tags) and sort (deadline/prize)
- [ ] FilterBar has a debounced search input wired to `?search=`
- [ ] FilterBar has a sort dropdown wired to `?sort=`
- [ ] Tag pills on HackathonCard are anchor links to `/?tag=X`
- [ ] `page.tsx` passes `search` and `sort` from searchParams to `filterHackathons()`
- [ ] API route passes `search` and `sort` to `filterHackathons()`
- [ ] `pnpm build` passes with zero TypeScript errors
