'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import type { Profile, TrackType } from '@/types/database'

export default function AuthSync() {
  const { user, setUser, activeTrack, setTrack } = useAppStore()

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const syncSupabaseUser = (sbUser: any) => {
      if (!sbUser || !mounted) return

      const email = sbUser.email || ''
      const metadata = sbUser.user_metadata || {}
      const fullName =
        metadata.full_name ||
        metadata.name ||
        metadata.user_name ||
        (email ? email.split('@')[0] : 'Học viên')
      const avatarUrl = metadata.avatar_url || metadata.picture || null

      const currentStoreUser = useAppStore.getState().user
      const currentTrack = useAppStore.getState().activeTrack

      // Only update if no user is logged in, or ID matches Supabase user but info is outdated
      if (!currentStoreUser || currentStoreUser.id !== sbUser.id) {
        const profile: Profile = {
          id: sbUser.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          track_type: currentTrack || 'toeic',
          level: 'beginner',
          xp_total: currentStoreUser?.xp_total || 120,
          streak_days: currentStoreUser?.streak_days || 1,
          last_active_at: new Date().toISOString(),
          preferred_language: 'vi',
          created_at: sbUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setUser(profile)

        // Ensure 7-day Pro trial is active for this user
        const currentSub = useAppStore.getState().subscription
        if (!currentSub || currentSub.user_id !== sbUser.id) {
          const trialEnds = new Date()
          trialEnds.setDate(trialEnds.getDate() + 7)
          useAppStore.getState().setSubscription({
            id: 'sub-' + sbUser.id,
            user_id: sbUser.id,
            tier: 'free',
            trial_ends_at: trialEnds.toISOString(),
            expires_at: null,
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    // 1. Initial check on mount
    supabase.auth
      .getUser()
      .then(({ data: { user: sbUser } }) => {
        if (sbUser) {
          syncSupabaseUser(sbUser)
        }
      })
      .catch((err) => {
        // Supabase not reachable or offline - keep local state
        console.warn('Supabase auth check:', err?.message)
      })

    // 2. Real-time auth listener (OAuth sign-in, token refresh, sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') &&
        session?.user
      ) {
        syncSupabaseUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        const currentStoreUser = useAppStore.getState().user
        // If current logged-in user came from Supabase, log them out
        if (currentStoreUser && currentStoreUser.id.length > 20) {
          useAppStore.getState().logout()
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser])

  return null
}

