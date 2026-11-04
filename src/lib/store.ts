import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language, TranslationKey } from '@/lib/i18n/translations'
import { translations } from '@/lib/i18n/translations'
import type {
  Profile,
  Subscription,
  TrackType,
  Lesson,
  Vocabulary,
  Note,
  GameScore,
  UserVocabMastery,
  GameType,
  Collocation,
  GrammarPoint,
  SentencePattern,
  ToeicExamTest,
} from '@/types/database'
import { calculateNextReview } from '@/lib/utils'
import { allLessons, allVocabularies } from '@/data/seed'
import {
  allCollocations,
  allGrammarPoints,
  allSentencePatterns,
  allToeicExams,
} from '@/data/curriculum'
import type { VoiceEngine } from '@/lib/audio'
import { isUserAdmin } from '@/lib/auth'

// ─── Language Store ──────────────────────────────────
interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  tArray: (key: 'freeFeatures' | 'proFeatures') => readonly string[]
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'vi',
      setLanguage: (language) => set({ language }),
      t: (key) => {
        const val = translations[get().language][key]
        return typeof val === 'string' ? val : (val as readonly string[]).join(', ')
      },
      tArray: (key) => translations[get().language][key] as readonly string[],
    }),
    { name: 'engy-language' }
  )
)

// ─── App Store (Auth, Progress, Notes, SRS, Games) ───
interface LessonProgress {
  completed: boolean
  score: number
  completedAt?: string
}

interface AppState {
  // Auth & Profile
  user: Profile | null
  subscription: Subscription | null
  activeTrack: TrackType
  voiceEngine: VoiceEngine
  isLoading: boolean

  // Learning Progress
  lessonProgress: Record<string, LessonProgress>
  notes: Note[]
  vocabMastery: Record<string, UserVocabMastery>
  gameScores: GameScore[]

  // Auth actions
  login: (email: string, fullName: string, track: TrackType) => void
  loginDemo: (track: TrackType) => void
  logout: () => void
  setTrack: (track: TrackType) => void
  setVoiceEngine: (engine: VoiceEngine) => void
  setUser: (user: Profile | null) => void
  setSubscription: (sub: Subscription | null) => void

  // Progress actions
  completeLesson: (lessonId: string, score: number, xpBonus?: number) => void
  addXP: (amount: number) => void

  // Notes actions
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Note
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void

  // SRS Review actions
  submitReview: (vocabId: string, confidence: 'again' | 'hard' | 'good' | 'easy') => void
  getDueReviewVocabs: () => Vocabulary[]

  // Game actions
  recordGameScore: (
    lessonId: string,
    gameType: GameType,
    score: number,
    maxScore: number,
    xpEarned: number
  ) => void

  // Pro subscription
  upgradeToPro: () => void
  isPro: () => boolean
  isTrialActive: () => boolean
  getTrialDaysRemaining: () => number

  // ─── Custom Curriculum & Admin Management ───
  customLessons: Lesson[]
  customVocabularies: Vocabulary[]
  customCollocations: Collocation[]
  customGrammarPoints: GrammarPoint[]
  customSentencePatterns: SentencePattern[]
  customToeicExams: ToeicExamTest[]

  getAllLessons: () => Lesson[]
  getAllVocabularies: () => Vocabulary[]
  getAllCollocations: () => Collocation[]
  getAllGrammarPoints: () => GrammarPoint[]
  getAllSentencePatterns: () => SentencePattern[]
  getAllToeicExams: () => ToeicExamTest[]

  addCustomLesson: (lesson: Lesson) => void
  addCustomVocabulary: (vocab: Vocabulary) => void
  addCustomCollocation: (collocation: Collocation) => void
  addCustomGrammarPoint: (grammarPoint: GrammarPoint) => void
  addCustomSentencePattern: (pattern: SentencePattern) => void
  addCustomToeicExam: (exam: ToeicExamTest) => void
  deleteCustomItem: (
    type: 'lesson' | 'vocab' | 'collocation' | 'grammar' | 'pattern' | 'exam',
    id: string
  ) => void
}

// Initial 7-day Pro trial helper
const createInitialSubscription = (userId: string): Subscription => {
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 7)
  return {
    id: 'sub-' + Math.random().toString(36).substring(2, 9),
    user_id: userId,
    tier: 'free',
    trial_ends_at: trialEnd.toISOString(),
    expires_at: null,
    created_at: new Date().toISOString(),
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      subscription: null,
      activeTrack: 'toeic',
      voiceEngine: 'edge_jenny',
      isLoading: false,
      lessonProgress: {
        'toeic-01': { completed: true, score: 95, completedAt: new Date().toISOString() },
      },
      notes: [
        {
          id: 'note-sample-1',
          user_id: 'default',
          lesson_id: 'toeic-01',
          vocabulary_id: null,
          content: 'Lưu ý từ Agenda hay xuất hiện trong Part 3 & 4 đoạn đối thoại cuộc họp!',
          color: '#bbf7d4', // mint
          pinned: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'note-sample-2',
          user_id: 'default',
          lesson_id: 'med-01',
          vocabulary_id: null,
          content: 'Hậu tố -cardial liên quan đến tim, ví dụ Myocardial infarction (nhồi máu cơ tim).',
          color: '#e9d5ff', // purple
          pinned: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      vocabMastery: {},
      gameScores: [],

      // Custom Admin content
      customLessons: [],
      customVocabularies: [],
      customCollocations: [],
      customGrammarPoints: [],
      customSentencePatterns: [],
      customToeicExams: [],

      getAllLessons: () => [...allLessons, ...(get().customLessons || [])],
      getAllVocabularies: () => [...allVocabularies, ...(get().customVocabularies || [])],
      getAllCollocations: () => [...allCollocations, ...(get().customCollocations || [])],
      getAllGrammarPoints: () => [...allGrammarPoints, ...(get().customGrammarPoints || [])],
      getAllSentencePatterns: () => [...allSentencePatterns, ...(get().customSentencePatterns || [])],
      getAllToeicExams: () => [...allToeicExams, ...(get().customToeicExams || [])],

      addCustomLesson: (lesson) =>
        set((state) => ({ customLessons: [lesson, ...(state.customLessons || [])] })),
      addCustomVocabulary: (vocab) =>
        set((state) => ({ customVocabularies: [vocab, ...(state.customVocabularies || [])] })),
      addCustomCollocation: (collocation) =>
        set((state) => ({ customCollocations: [collocation, ...(state.customCollocations || [])] })),
      addCustomGrammarPoint: (grammarPoint) =>
        set((state) => ({ customGrammarPoints: [grammarPoint, ...(state.customGrammarPoints || [])] })),
      addCustomSentencePattern: (pattern) =>
        set((state) => ({ customSentencePatterns: [pattern, ...(state.customSentencePatterns || [])] })),
      addCustomToeicExam: (exam) =>
        set((state) => ({ customToeicExams: [exam, ...(state.customToeicExams || [])] })),

      deleteCustomItem: (type, id) => {
        set((state) => {
          switch (type) {
            case 'lesson':
              return { customLessons: (state.customLessons || []).filter((i) => i.id !== id) }
            case 'vocab':
              return { customVocabularies: (state.customVocabularies || []).filter((i) => i.id !== id) }
            case 'collocation':
              return { customCollocations: (state.customCollocations || []).filter((i) => i.id !== id) }
            case 'grammar':
              return { customGrammarPoints: (state.customGrammarPoints || []).filter((i) => i.id !== id) }
            case 'pattern':
              return { customSentencePatterns: (state.customSentencePatterns || []).filter((i) => i.id !== id) }
            case 'exam':
              return { customToeicExams: (state.customToeicExams || []).filter((i) => i.id !== id) }
            default:
              return state
          }
        })
      },

      login: (email, fullName, track) => {
        const userId = 'usr-' + Math.random().toString(36).substring(2, 9)
        const isAdmin = isUserAdmin({ email } as Profile)
        const profile: Profile = {
          id: userId,
          email,
          full_name: fullName || email.split('@')[0],
          avatar_url: null,
          track_type: track,
          level: 'beginner',
          role: isAdmin ? 'admin' : 'user',
          is_admin: isAdmin,
          xp_total: 120,
          streak_days: 1,
          last_active_at: new Date().toISOString(),
          preferred_language: 'vi',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        const subscription = createInitialSubscription(userId)
        set({ user: profile, subscription, activeTrack: track })
      },

      loginDemo: (_track: TrackType) => {
        // Disabled: EngY now uses real user authentication to prevent overwriting user session
      },

      logout: () => {
        set({ user: null, subscription: null })
      },

      setTrack: (track: TrackType) => {
        set((state) => ({
          activeTrack: track,
          user: state.user ? { ...state.user, track_type: track } : null,
        }))
      },

      setVoiceEngine: (voiceEngine) => set({ voiceEngine }),

      setUser: (user) => set({ user }),
      setSubscription: (subscription) => set({ subscription }),

      completeLesson: (lessonId, score, xpBonus = 50) => {
        set((state) => {
          const newProgress = {
            ...state.lessonProgress,
            [lessonId]: { completed: true, score, completedAt: new Date().toISOString() },
          }
          const updatedUser = state.user
            ? { ...state.user, xp_total: state.user.xp_total + xpBonus }
            : null
          return { lessonProgress: newProgress, user: updatedUser }
        })
      },

      addXP: (amount) => {
        set((state) => {
          if (!state.user) return {}
          return {
            user: { ...state.user, xp_total: state.user.xp_total + amount },
          }
        })
      },

      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          user_id: get().user?.id || 'guest',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set((state) => ({ notes: [newNote, ...state.notes] }))
        return newNote
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }))
      },

      submitReview: (vocabId, confidence) => {
        const qualityMap = { again: 0, hard: 2, good: 4, easy: 5 }
        const quality = qualityMap[confidence]
        const state = get()
        const currentMastery = state.vocabMastery[vocabId] || {
          id: 'vm-' + vocabId,
          user_id: state.user?.id || 'guest',
          vocabulary_id: vocabId,
          mastery_level: 0,
          correct_count: 0,
          incorrect_count: 0,
          next_review_at: new Date().toISOString(),
          last_reviewed_at: null,
          ease_factor: 2.5,
          interval_days: 0,
          created_at: new Date().toISOString(),
        }

        const { newInterval, newEaseFactor } = calculateNextReview(
          quality,
          currentMastery.ease_factor,
          currentMastery.interval_days
        )

        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + newInterval)

        const updatedMastery: UserVocabMastery = {
          ...currentMastery,
          ease_factor: Number(newEaseFactor.toFixed(2)),
          interval_days: newInterval,
          mastery_level: Math.min(5, Math.max(0, currentMastery.mastery_level + (quality >= 3 ? 1 : -1))),
          correct_count: currentMastery.correct_count + (quality >= 3 ? 1 : 0),
          incorrect_count: currentMastery.incorrect_count + (quality < 3 ? 1 : 0),
          last_reviewed_at: new Date().toISOString(),
          next_review_at: nextDate.toISOString(),
        }

        const xpGained = quality >= 3 ? 10 : 3
        set((s) => ({
          vocabMastery: { ...s.vocabMastery, [vocabId]: updatedMastery },
          user: s.user ? { ...s.user, xp_total: s.user.xp_total + xpGained } : null,
        }))
      },

      getDueReviewVocabs: () => {
        const state = get()
        const track = state.activeTrack
        const trackVocabs = allVocabularies.filter((v) => v.track_type === track)
        const now = new Date()

        // Return vocabs whose mastery is due or not reviewed yet
        return trackVocabs.filter((vocab) => {
          // generate pseudo uuid for matching seed
          const pseudoId = `${vocab.lesson_id}-${vocab.word}`
          const mastery = state.vocabMastery[pseudoId]
          if (!mastery) return true // new word to review
          return new Date(mastery.next_review_at) <= now
        })
      },

      recordGameScore: (lessonId, gameType, score, maxScore, xpEarned) => {
        const newScore: GameScore = {
          id: 'gs-' + Date.now(),
          user_id: get().user?.id || 'guest',
          lesson_id: lessonId,
          game_type: gameType,
          score,
          max_score: maxScore,
          time_spent_seconds: 60,
          xp_earned: xpEarned,
          played_at: new Date().toISOString(),
        }

        set((state) => ({
          gameScores: [newScore, ...state.gameScores],
          user: state.user ? { ...state.user, xp_total: state.user.xp_total + xpEarned } : null,
        }))
      },

      upgradeToPro: () => {
        const nextYear = new Date()
        nextYear.setFullYear(nextYear.getFullYear() + 1)
        set((state) => ({
          subscription: {
            id: 'sub-pro-' + Date.now(),
            user_id: state.user?.id || 'guest',
            tier: 'pro',
            trial_ends_at: null,
            expires_at: nextYear.toISOString(),
            created_at: new Date().toISOString(),
          },
        }))
      },

      isPro: () => {
        const { subscription } = get()
        if (!subscription) return false
        if (subscription.tier === 'pro') {
          if (subscription.expires_at) {
            return new Date(subscription.expires_at) > new Date()
          }
          return true
        }
        if (subscription.trial_ends_at) {
          return new Date(subscription.trial_ends_at) > new Date()
        }
        return false
      },

      isTrialActive: () => {
        const { subscription } = get()
        if (!subscription) return false
        if (subscription.tier === 'free' && subscription.trial_ends_at) {
          return new Date(subscription.trial_ends_at) > new Date()
        }
        return false
      },

      getTrialDaysRemaining: () => {
        const { subscription } = get()
        if (!subscription?.trial_ends_at) return 0
        const end = new Date(subscription.trial_ends_at).getTime()
        const now = new Date().getTime()
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
        return Math.max(0, diff)
      },
    }),
    {
      name: 'engy-app-storage',
      partialize: (state) => ({
        user: state.user,
        subscription: state.subscription,
        activeTrack: state.activeTrack,
        voiceEngine: state.voiceEngine,
        lessonProgress: state.lessonProgress,
        notes: state.notes,
        vocabMastery: state.vocabMastery,
        gameScores: state.gameScores,
        customLessons: state.customLessons,
        customVocabularies: state.customVocabularies,
        customCollocations: state.customCollocations,
        customGrammarPoints: state.customGrammarPoints,
        customSentencePatterns: state.customSentencePatterns,
        customToeicExams: state.customToeicExams,
      }),
    }
  )
)

// Legacy compatibility hook aliases
export const useAuthStore = useAppStore
