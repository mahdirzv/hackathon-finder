import { SignInForm } from '@/features/auth'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-background)]">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Sign in to your account
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  )
}
