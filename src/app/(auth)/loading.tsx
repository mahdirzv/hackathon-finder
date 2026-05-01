/**
 * Root loading UI. Shown during Suspense boundaries while route segments
 * stream in. Keep it minimal — a product app would replace this with a
 * skeleton matching the dominant page layout.
 */
export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-background)]">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]"
      >
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin"
        />
        Loading…
      </div>
    </main>
  )
}
