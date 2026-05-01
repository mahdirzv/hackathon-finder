# HackathonFinder

> Scaffolded from [base-next-starter](https://github.com/mahdirzv/base-next-starter). See [`AGENTS.md`](./AGENTS.md) for architecture, module contracts, and gotchas.

## Quick start

```bash
cp .env.example .env.local   # then fill in your keys
pnpm install
pnpm dev
```

Active auth provider: `clerk` (switch via `AUTH_PROVIDER` in `.env.local`).
Active theme: `neutral` (switch via `THEME_PRESET`).

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint |

## Learn more

- [`AGENTS.md`](./AGENTS.md) — full architecture, auth module contract, design system, known gotchas. Send this to an AI agent working on the codebase.
- Starter source: https://github.com/mahdirzv/base-next-starter
