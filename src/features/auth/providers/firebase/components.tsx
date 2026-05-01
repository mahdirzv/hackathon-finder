'use client'

// Firebase provider UI stub — parallel to firebase/server.ts which also stubs.
// When you implement firebase auth, replace these with real Firebase forms.

function NotConfigured({ title }: { title: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] p-6 bg-[var(--color-surface)] text-left w-full max-w-sm">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
        {title} — Firebase provider not configured
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        AUTH_PROVIDER=firebase is set but no implementation ships with this starter. Either switch to <code>clerk</code> or <code>supabase</code> in <code>.env.local</code>, or implement the firebase provider in <code>src/features/auth/providers/firebase/</code>.
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
