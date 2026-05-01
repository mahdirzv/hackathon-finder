// AuthProviderName is owned by @/config (single source of truth for env-driven names).
// Re-exported here for convenience so the auth module can be read standalone.
export type { AuthProviderName } from '@/config'

export type User = {
  id: string
  email: string
  name?: string
}
