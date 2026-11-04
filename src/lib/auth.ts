import type { Profile } from '@/types/database'

/**
 * Checks whether a user account has admin access.
 *
 * Supported admin validation rules:
 * 1. user.role === 'admin'
 * 2. user.is_admin === true
 * 3. Matching an email explicitly configured in NEXT_PUBLIC_ADMIN_EMAILS
 */
export function isUserAdmin(user: Profile | null | undefined): boolean {
  if (!user) return false

  // 1. Explicit role flag (set via Supabase user_metadata, app_metadata or DB profile)
  if (user.role === 'admin' || user.is_admin === true) {
    return true
  }

  // 2. Allowed admin emails list configured via environment variable (if provided)
  const envAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  if (envAdminEmails && user.email) {
    const configuredEmails = envAdminEmails
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    if (configuredEmails.includes(user.email.toLowerCase())) {
      return true
    }
  }

  return false
}

