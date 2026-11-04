import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const track = requestUrl.searchParams.get('track') || 'toeic'
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const origin = requestUrl.origin

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data?.session) {
        // Successful login with Supabase (Google OAuth or email confirmation)
        const redirectUrl = new URL(next, origin)
        redirectUrl.searchParams.set('track', track)
        redirectUrl.searchParams.set('login_provider', 'google')
        return NextResponse.redirect(redirectUrl.toString())
      }

      if (error) {
        console.error('Supabase exchangeCodeForSession error:', error.message)
      }
    } catch (err) {
      console.error('Auth callback exception:', err)
    }
  }

  // Fallback to login with error state
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}

