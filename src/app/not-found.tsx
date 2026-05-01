import Link from 'next/link'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-background)]">
      <div className="w-full max-w-md flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Page not found
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          The URL you requested doesn&apos;t exist or has moved.
        </p>
        <div className="flex justify-center">
          <Link href="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
