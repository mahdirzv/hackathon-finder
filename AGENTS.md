<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

This file is the single source of truth for AI agents working on this codebase. Read it fully before writing any code.

---

## Stack (exact versions)

| Package | Version | Notes |
|---|---|---|
| Next.js | 16.x | Breaking changes vs 14/15 — see section below |
| React | 19.x | Breaking changes vs 18 — see section below |
| TypeScript | 5.x | Strict mode |
| Tailwind CSS | 4.x | New config format — no `tailwind.config.js` |
| Clerk | 6.x | `@clerk/nextjs` v6 |
| Supabase SSR | 0.9.x | `@supabase/ssr` |
| Vitest | 3.x | `environment: 'node'` (no jsdom) |
| pnpm | 10.x | Single package (not a monorepo) |

---

## Next.js 16 breaking changes you must know

**`proxy.ts` replaces `middleware.ts`**
- File must be at the project root: `proxy.ts`
- Named export must be `proxy` (not `middleware`)
- `config` matcher must be defined DIRECTLY in `proxy.ts` — Next.js cannot statically analyze a re-export

```typescript
// proxy.ts — correct
export { proxy } from '@/features/auth/providers/clerk/proxy'
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }

// WRONG — will silently fail
export { proxy, config } from '@/features/auth/providers/clerk/proxy'
```

**`cookies()` from `next/headers` must be awaited**
```typescript
// WRONG (sync, removed in Next.js 16)
const cookieStore = cookies()

// Correct
const cookieStore = await cookies()
```

**All pages that call auth or use Clerk components must be force-dynamic**
```typescript
export const dynamic = 'force-dynamic'
```
Without this, Next.js attempts static prerendering and Clerk's `useSession` throws because there is no `ClerkProvider` at build time.

---

## React 19 breaking changes you must know

**`React.FormEvent` is removed**
```typescript
// WRONG
function handler(e: React.FormEvent) { ... }

// Correct — use structural type
function handler(e: { preventDefault(): void }) { ... }
```

---

## Auth conventions (runtime provider dispatch)

- `src/proxy.ts` is the root middleware. It dispatches to the active provider at runtime based on `process.env.AUTH_PROVIDER`.
- `src/features/auth/index.ts` exports both server ops (`getUser`, `requireUser`, `signOut`, `authProxy`, `publicPaths`) and UI components (`SignInForm`, `SignUpForm`) — all runtime-dispatched from `AUTH_PROVIDER`. **No code edits are required to switch between Clerk and Supabase.** Just change `AUTH_PROVIDER` in `.env.local` and restart the dev server.
- Every provider must **no-op gracefully when its API keys are missing** — proxy returns `NextResponse.next()`, `server.getUser()` returns `null`, and the sign-in/sign-up components render a `MissingKeysNotice` with instructions. This keeps `pnpm dev` usable on a fresh scaffold before the user has configured `.env.local`.
- Env-var guards must be **call-time arrow functions** (`const hasClerkKeys = () => ...`), never module-scope constants. Module-scope captures env at import time, which breaks Vitest — see "Known gotchas" below.
- If you add a new provider, mirror the `hasXxxKeys` guard pattern in all three files (`proxy.ts`, `server.ts`, `components.tsx`) and register it in the `serverProviders` / `componentProviders` maps in `src/features/auth/index.ts`.

---

## Project architecture

```
src/
  config/index.ts          # Typed config — parses env with zod once at load
  lib/
    utils.ts               # cn() utility (clsx + tailwind-merge)
    design/                # Design system (tokens + theme presets)
      tokens/              # CSS custom property names (var(--*) only — no hex values)
        colors.ts
        typography.ts
        spacing.ts
        radius.ts
        shadows.ts
        index.ts           # barrel
      themes/
        neutral.ts         # Hex values mapped to CSS var names
        vivid.ts
        index.ts           # getTheme(preset) → Record<string, string>
      index.ts             # tokens + themes barrel
  components/
    ui/                    # shadcn-style primitives (shadcn CLI drops new components here)
      button.tsx
      card.tsx
      badge.tsx
      input.tsx
      label.tsx
      index.ts             # barrel for convenient imports
  features/
    auth/                  # Auth feature — provider-agnostic public API
      types.ts             # User, SignInInput, SignUpInput, AuthResult
      interface.ts         # AuthServerOps, AuthComponentOps, AuthProxy
      index.ts             # PUBLIC API — import from here only
      proxy.ts             # Proxy-only entry (src/proxy.ts imports from here)
      providers/
        clerk/
          server.ts        # Implements AuthServerOps
          components.tsx   # SignInForm, SignUpForm using Clerk's hosted components
          proxy.ts         # clerkMiddleware export + config
        supabase/
          server.ts        # Implements AuthServerOps
          components.tsx   # SignInForm, SignUpForm with email/password forms
          proxy.ts         # session refresh logic (Supabase uses server-side cookie logic)
        firebase/
          server.ts        # STUB — throws "not implemented"
          components.tsx   # STUB — renders "not configured" notice
          proxy.ts         # STUB — no-op
        custom/
          server.ts        # STUB — throws "not implemented"
          components.tsx   # STUB
          proxy.ts         # STUB — no-op
  app/
    layout.tsx             # Injects theme CSS vars into :root; wraps with ClerkProvider if key present
    page.tsx               # Landing — calls getUser(), force-dynamic
    global-error.tsx       # Catastrophic root-layout error boundary
    not-found.tsx          # 404 page
    (auth)/
      loading.tsx                       # Suspense skeleton for sign-in/sign-up (MUST stay inside the group; see gotcha #9)
      sign-in/[[...rest]]/page.tsx      # Catch-all — Clerk's <SignIn /> probes sub-routes
      sign-up/[[...rest]]/page.tsx      # Catch-all — Clerk's <SignUp /> probes sub-routes
    (protected)/
      dashboard/page.tsx   # Calls requireUser(), force-dynamic
proxy.ts                   # Root middleware (Next.js 16) — imports authProxy from @/features/auth/proxy
```

---

## Auth module contract

**Public API** (`src/features/auth/index.ts`):
```typescript
getUser(): Promise<User | null>          // null = not authenticated
requireUser(): Promise<User>             // redirects to /sign-in if not authed
signOut(): Promise<void>                 // clears session, redirects to /sign-in
SignInForm: React.ComponentType          // provider-specific sign-in UI
SignUpForm: React.ComponentType          // provider-specific sign-up UI
```

**User type**:
```typescript
type User = { id: string; email: string; name?: string }
```

**Rule**: Screens NEVER import from providers directly. Always import from `@/features/auth`.

---

## UI + design system

**Component primitives** live at `src/components/ui/*` (shadcn-native location). Import via the barrel:
```typescript
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Label } from '@/components/ui'
```
To add a new shadcn component: `pnpm dlx shadcn@latest add <name>` drops it here automatically (per `components.json` aliases).

**Design tokens + theme presets** live at `src/lib/design/*`:
```typescript
import { getTheme, neutralTheme, vividTheme, colors, radius, spacing } from '@/lib/design'
```

**How theming works**:
1. Token files (`src/lib/design/tokens/*.ts`) define CSS var names as TypeScript constants
2. Theme preset files (`neutral.ts`, `vivid.ts`) map those var names to actual hex/value strings
3. `layout.tsx` calls `getTheme(preset)` and injects a `<style>:root { ... }</style>` block
4. Components use `var(--color-*)`, `var(--radius)`, etc. — never hardcoded values

**Adding a theme**:
1. Copy `src/lib/design/themes/neutral.ts` → `src/lib/design/themes/yourtheme.ts`
2. Change the hex values
3. Register it in `src/lib/design/themes/index.ts`
4. Add the name to `ThemePresetName` in `src/config/index.ts`

**Adding a component**:
1. Create `src/components/ui/yourcomponent.tsx`
2. Use only `var(--*)` CSS tokens — no hardcoded colors or sizes
3. Export from `src/components/ui/index.ts`

---

## Switching auth providers

To activate a different provider:

1. Set `AUTH_PROVIDER=<name>` in `.env.local` (`clerk` | `supabase` | `firebase` | `custom`)
2. Provide the provider's env vars (see `.env.example`)
3. Restart the dev server

That's it. Both the server ops and the UI components are runtime-dispatched from `AUTH_PROVIDER` via the `serverProviders` / `componentProviders` maps in `src/features/auth/index.ts`. **No code edits are required.**

**Implementing a stub provider** (Firebase or Custom):
- Implement `AuthServerOps` in `src/features/auth/providers/{firebase,custom}/server.ts`
- Create a `components.tsx` with `SignInForm` and `SignUpForm`
- The routing and session protection work automatically once the interface is satisfied

---

## Adding a protected page

```typescript
// src/app/(protected)/your-page/page.tsx
import { requireUser } from '@/features/auth'

export const dynamic = 'force-dynamic'

export default async function YourPage() {
  const user = await requireUser()  // redirects to /sign-in if not authenticated
  return <div>Hello {user.email}</div>
}
```

---

## Adding a public page

No special setup needed. Just don't call `requireUser()`. If the page uses auth state:
```typescript
export const dynamic = 'force-dynamic'

export default async function YourPage() {
  const user = await getUser()  // returns null if not authenticated
  return <div>{user ? `Hi ${user.email}` : 'Not logged in'}</div>
}
```

---

## Testing

- Framework: Vitest 3, `environment: 'node'`
- No jsdom — components are not unit tested, only server logic
- Each provider has tests in `server.test.ts`
- UI token and theme tests enforce CSS var invariants

Run tests: `pnpm test`

Test files:
```
src/config/index.test.ts
src/lib/utils.test.ts
src/features/auth/index.test.ts
src/features/auth/providers/clerk/server.test.ts
src/features/auth/providers/supabase/server.test.ts
src/features/auth/providers/firebase/server.test.ts
src/features/auth/providers/custom/server.test.ts
src/lib/design/tokens/tokens.test.ts
src/lib/design/themes/themes.test.ts
```

---

## Environment variables

```env
# Auth — pick one provider
AUTH_PROVIDER=clerk              # clerk | supabase | firebase | custom (default: clerk)

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Theme
THEME_PRESET=neutral             # neutral | vivid (default: neutral)
```

---

## Commands

```bash
pnpm dev        # dev server (Turbopack)
pnpm build      # production build
pnpm test       # vitest run
pnpm lint       # eslint
```

---

## Known gotchas

1. **Static prerendering + Clerk**: Any page that calls `getUser()`, `requireUser()`, or renders Clerk components (`<SignIn />`, `<SignUp />`) must export `export const dynamic = 'force-dynamic'`. Missing this causes a build-time crash: "useSession can only be used within ClerkProvider."

2. **ClerkProvider is conditional**: `layout.tsx` only wraps with `<ClerkProvider>` when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set. Builds without Clerk keys are valid (for Supabase/Firebase/Custom usage).

3. **`proxy.ts` config cannot be re-exported**: Next.js statically analyzes the `config` export in `proxy.ts`. It must be defined inline — not imported or re-exported from another module.

4. **`cookies()` is async**: In Next.js 16, `cookies()` from `next/headers` returns a Promise. Always `await` it.

5. **Supabase `signUp` session**: `supabase.auth.signUp()` returns `data.session = null` when email confirmation is required. Check before redirecting.

6. **Clerk `currentUser()` fields**: Clerk v6 uses `firstName`/`lastName` (not `fullName`). Name is `[firstName, lastName].filter(Boolean).join(' ') || undefined`.

7. **`proxy.ts` export name**: The named export must be `proxy`, not `middleware`. The internal `AuthServerOps.middleware()` method keeps the old name for clarity, but the file-level export is `proxy`.

8. **Module-scope `process.env` captures at test import time**: `hasClerkKeys` and `hasSupabaseKeys` guards must be call-time arrow functions. A module-scope `const hasClerkKeys = Boolean(...)` freezes the env-check result at import, which means Vitest tests (which don't have `.env.local` loaded) always see `false` and short-circuit before reaching the mocked API call. Tests must also use `vi.stubEnv` / `vi.unstubAllEnvs` per-case. This bit the project on v0.1.2 and was fixed in v0.1.3.

9. **Root `app/loading.tsx` silently breaks server-side redirects**: a root-level `loading.tsx` wraps every route in a Suspense boundary. When a Server Component throws `NEXT_REDIRECT` (from `requireUser()` etc.) inside that boundary, Next.js responds with **200 + streaming body containing the redirect in the RSC payload** instead of a clean 307. Non-JS clients (curl, SEO crawlers, health probes) see 200 and the redirect never fires. Put `loading.tsx` **inside** route groups (`(auth)/loading.tsx`, `(protected)/loading.tsx`) so it doesn't wrap the redirect-throwing segment. Bit the project on v0.1.4 and was fixed in v0.1.7.

10. **Clerk's `<SignIn />` / `<SignUp />` require catch-all routes**: Clerk's hosted components probe sub-routes at runtime (e.g. `/sign-up/SignUp_clerk_catchall_check_<timestamp>`) for their internal state machine. If those pages are regular routes (`sign-up/page.tsx`), Next.js 404s on the probes and Clerk throws: *"The `<SignUp/>` component is not configured correctly... is not a catch-all route."* Use `sign-in/[[...rest]]/page.tsx` and `sign-up/[[...rest]]/page.tsx`. Our `clerk/proxy.ts` already matches `/sign-in(.*)` and `/sign-up(.*)` as public, so the catch-all children aren't blocked by auth. Bit the project when running against live Clerk dev keys; fixed in v0.1.9.
