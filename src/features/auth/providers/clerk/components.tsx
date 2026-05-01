'use client'

import { SignIn, SignUp } from '@clerk/nextjs'

// Call-time check — see server.ts for rationale.
const hasClerkKey = () => Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

function MissingKeysNotice({ title }: { title: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] p-6 bg-[var(--color-surface)] text-left">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
        {title} is not configured yet
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">
        Set the following in <code>.env.local</code> to enable Clerk auth, then restart the dev server:
      </p>
      <pre className="text-xs bg-[var(--color-background)] rounded p-3 mt-3 overflow-x-auto border border-[var(--color-border)]">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}
      </pre>
      <p className="text-xs text-[var(--color-text-muted)] mt-3">
        Get keys from <a className="underline" href="https://dashboard.clerk.com" target="_blank" rel="noreferrer">dashboard.clerk.com</a>.
      </p>
    </div>
  )
}

export function SignInForm() {
  if (!hasClerkKey()) return <MissingKeysNotice title="Sign-in" />
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'shadow-none border border-[var(--color-border)] rounded-[var(--radius)]',
        },
      }}
    />
  )
}

export function SignUpForm() {
  if (!hasClerkKey()) return <MissingKeysNotice title="Sign-up" />
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'shadow-none border border-[var(--color-border)] rounded-[var(--radius)]',
        },
      }}
    />
  )
}
