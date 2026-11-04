import type { Profile } from '@/types/database'

/**
 * Checks whether a user account has admin access.
 *
 * Supported admin validation rules:
 * 1. user.role === 'admin'
 * 2. user.is_admin === true
 * 3. Matching an email configured in NEXT_PUBLIC_ADMIN_EMAILS (defaults to project owner: kevinkhanh1984@gmail.com)
 */
export function isUserAdmin(user: Profile | null | undefined): boolean {
  if (!user || !user.email) return false

  // 1. Explicit role flag (set via Supabase metadata or DB profile)
  if (user.role === 'admin' || user.is_admin === true) {
    return true
  }

  // 2. Allowed admin emails list
  const configuredEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'kevinkhanh1984@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (configuredEmails.includes(user.email.toLowerCase())) {
    return true
  }

  return false
}
