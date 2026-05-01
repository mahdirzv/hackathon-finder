'use client'

/**
 * Catastrophic error boundary for the root layout only.
 *
 * Why `global-error.tsx` instead of `error.tsx` at the root?
 * ----------------------------------------------------------
 * A root `app/error.tsx` catches every throw from Server Components under it
 * — including the `NEXT_REDIRECT` sentinel that `redirect()` throws inside
 * `requireUser()`. When that happens, Next.js's server renderer writes
 * `error.tsx`'s UI into the response body BEFORE the framework's sentinel
 * check can emit the 307. Result: protected pages return 200 with the
 * error UI instead of redirecting to /sign-in.
 *
 * `global-error.tsx` only activates when the root layout itself throws, so
 * it doesn't sit in the path of route-group pages. Errors thrown inside
 * `(auth)` or `(protected)` propagate straight to Next.js's framework
 * handler, which correctly 307s redirects and renders `not-found.tsx` for
 * `notFound()` calls.
 *
 * To add a branded error screen for a specific route group, drop an
 * `error.tsx` INSIDE that group — e.g. `app/(protected)/error.tsx`.
 *
 * `global-error.tsx` must define its own <html> and <body> because it
 * replaces the root layout when triggered.
 */
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: forward to Sentry / your logger of choice.
    console.error('[global error]', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
            {error.message || 'The application failed to load.'}
            {error.digest && (
              <>
                <br />
                <code style={{ fontSize: '0.75rem' }}>Digest: {error.digest}</code>
              </>
            )}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1rem',
              background: '#0369a1',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
