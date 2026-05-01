'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

export function NewsletterBanner() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const dest = email
      ? `/sign-up?email=${encodeURIComponent(email)}`
      : '/sign-up'
    router.push(dest)
  }

  return (
    <aside
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      aria-label="Newsletter signup"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          Get a weekly hackathon digest
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          New events, registration deadlines, and prize updates — straight to your inbox.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm w-full sm:w-52"
          aria-label="Email address"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Subscribe
        </Button>
      </form>
    </aside>
  )
}
