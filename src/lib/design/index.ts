/**
 * DESIGN SYSTEM — tokens + theme presets
 * ─────────────────────────────────────────────────────────────────────────────
 * Semantic CSS-var tokens (`colors`, `radius`, `spacing`, `typography`, `shadows`)
 * and theme presets (`neutralTheme`, `vividTheme`) that map those vars to
 * actual values. The active preset is controlled by `THEME_PRESET` env var
 * and injected at `:root` by `app/layout.tsx` via `getTheme(preset)`.
 *
 * UI components live under `@/components/ui` — shadcn-style primitives that
 * reference these var names, never hex literals.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export * from './tokens'
export { getTheme, neutralTheme, vividTheme } from './themes'
