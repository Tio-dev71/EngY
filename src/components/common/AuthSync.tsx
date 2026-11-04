'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store'
import type { Profile, TrackType } from '@/types/database'
import { isUserAdmin } from '@/lib/auth'

export default function AuthSync() {
  const { user, setUser, activeTrack, setTrack } = useAppStore()

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    // Clean up any lingering demo accounts from older sessions
    const existingUser = useAppStore.getState().user
    if (
      existingUser &&
      (existingUser.id?.startsWith('demo-user-') ||
        existingUser.email === 'doctor.y@engy.edu' ||
        existingUser.email === 'toeic.master@engy.edu')
    ) {
      useAppStore.getState().logout()
    }

    const syncSupabaseUser = async (sbUser: any) => {
      if (!sbUser || !mounted) return

      const email = sbUser.email || ''
      const metadata = sbUser.user_metadata || {}
      const appMetadata = sbUser.app_metadata || {}
      const fullName =
        metadata.full_name ||
        metadata.name ||
        metadata.user_name ||
        (email ? email.split('@')[0] : 'Học viên')
      const avatarUrl = metadata.avatar_url || metadata.picture || null

      let isAdmin =
        metadata.role === 'admin' ||
        metadata.is_admin === true ||
        appMetadata.role === 'admin' ||
        isUserAdmin({ email } as Profile)

      // Query profiles table in Supabase if role/stats are set there
      let userXp = 0
      let userStreak = 0
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('role, is_admin, xp_total, streak_days')
          .eq('id', sbUser.id)
          .maybeSingle()

        const profileData = dbProfile as any
        if (profileData?.role === 'admin' || profileData?.is_admin === true) {
          isAdmin = true
        }
        if (typeof profileData?.xp_total === 'number') {
          userXp = profileData.xp_total
        }
        if (typeof profileData?.streak_days === 'number') {
          userStreak = profileData.streak_days
        }
      } catch {
        // Table or columns may not exist yet, fallback to metadata/email check
      }

      const currentStoreUser = useAppStore.getState().user
      const currentTrack = useAppStore.getState().activeTrack
      const isNewUser = !currentStoreUser || currentStoreUser.id !== sbUser.id

      // Clean up mock sample data if lingering in localStorage from earlier versions
      const storeNotes = useAppStore.getState().notes
      const hasMockNotes = storeNotes.some((n) => n.id.startsWith('note-sample-'))
      const hasMockLesson =
        useAppStore.getState().lessonProgress['toeic-01']?.score === 95 ||
        (isNewUser && Object.keys(useAppStore.getState().lessonProgress).length > 0)

      if (isNewUser || hasMockNotes || hasMockLesson || currentStoreUser?.xp_total === 120) {
        useAppStore.setState((s) => ({
          notes: s.notes.filter((n) => !n.id.startsWith('note-sample-')),
          lessonProgress: isNewUser || hasMockLesson ? {} : s.lessonProgress,
          vocabMastery: isNewUser ? {} : s.vocabMastery,
          gameScores: isNewUser ? [] : s.gameScores,
        }))
      }

      // Only update if no user is logged in, or ID matches Supabase user but info is outdated
      if (
        isNewUser ||
        currentStoreUser.is_admin !== isAdmin ||
        currentStoreUser.xp_total === 120
      ) {
        const profile: Profile = {
          id: sbUser.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          track_type: currentTrack || 'toeic',
          level: 'beginner',
          role: isAdmin ? 'admin' : 'user',
          is_admin: isAdmin,
          xp_total:
            isNewUser || currentStoreUser?.xp_total === 120
              ? userXp
              : currentStoreUser?.xp_total ?? 0,
          streak_days:
            isNewUser || currentStoreUser?.streak_days === 1
              ? userStreak
              : currentStoreUser?.streak_days ?? 0,
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

