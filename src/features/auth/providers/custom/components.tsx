'use client'

// Custom provider UI stub — parallel to custom/server.ts which also stubs.
// When you implement your own auth, replace these with your real forms.

function NotConfigured({ title }: { title: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] p-6 bg-[var(--color-surface)] text-left w-full max-w-sm">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
        {title} — Custom provider not implemented
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        AUTH_PROVIDER=custom is set but no implementation ships with this starter. Implement <code>src/features/auth/providers/custom/&#123;server,components,proxy&#125;.ts</code> with your own auth logic.
      </p>
    </div>
  )
}

export function SignInForm() {
  return <NotConfigured title="Sign-in" />
}

export function SignUpForm() {
  return <NotConfigured title="Sign-up" />
}
