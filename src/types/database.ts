export type TrackType = 'toeic' | 'medical'
export type SubscriptionTier = 'free' | 'pro'
export type GameType = 'flashcard_match' | 'multiple_choice' | 'fill_blank' | 'word_scramble'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type ReviewConfidence = 'again' | 'hard' | 'good' | 'easy'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          track_type: TrackType
          level: DifficultyLevel
          xp_total: number
          streak_days: number
          last_active_at: string
          preferred_language: 'vi' | 'en'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'xp_total' | 'streak_days'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: SubscriptionTier
          trial_ends_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>
      }
      lessons: {
        Row: {
          id: string
          track_type: TrackType
          title_vi: string
          title_en: string
          description_vi: string
          description_en: string
          difficulty: DifficultyLevel
          order_index: number
          is_pro: boolean
          xp_reward: number
          estimated_minutes: number
          icon: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lessons']['Row']>
      }
      vocabularies: {
        Row: {
          id: string
          lesson_id: string
          word: string
          phonetic: string
          meaning_vi: string
          meaning_en: string
          example_sentence: string
          example_translation: string
          part_of_speech: string
          audio_url: string | null
          image_url: string | null
          difficulty: DifficultyLevel
          track_type: TrackType
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vocabularies']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vocabularies']['Row']>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          score: number
          time_spent_seconds: number
          completed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_progress']['Row']>
      }
      user_vocab_mastery: {
        Row: {
          id: string
          user_id: string
          vocabulary_id: string
          mastery_level: number
          correct_count: number
          incorrect_count: number
          next_review_at: string
          last_reviewed_at: string | null
          ease_factor: number
          interval_days: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_vocab_mastery']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_vocab_mastery']['Row']>
      }
      notes: {
        Row: {
          id: string
          user_id: string
          lesson_id: string | null
          vocabulary_id: string | null
          content: string
          color: string
          pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Row']>
      }
      game_scores: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          game_type: GameType
          score: number
          max_score: number
          time_spent_seconds: number
          xp_earned: number
          played_at: string
        }
        Insert: Omit<Database['public']['Tables']['game_scores']['Row'], 'id' | 'played_at'>
        Update: Partial<Database['public']['Tables']['game_scores']['Row']>
      }
      achievements: {
        Row: {
          id: string
          name_vi: string
          name_en: string
          description_vi: string
          description_en: string
          icon: string
          xp_reward: number
          condition_type: string
          condition_value: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['achievements']['Row']>
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_achievements']['Row'], 'id' | 'unlocked_at'>
        Update: Partial<Database['public']['Tables']['user_achievements']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      track_type: TrackType
      subscription_tier: SubscriptionTier
      game_type: GameType
      difficulty_level: DifficultyLevel
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Vocabulary = Database['public']['Tables']['vocabularies']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type UserVocabMastery = Database['public']['Tables']['user_vocab_mastery']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type GameScore = Database['public']['Tables']['game_scores']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

// ─── Comprehensive Learning Types (Collocations, Grammar, Sentence Patterns, TOEIC Exams) ───
export type CollocationType = 'noun_phrase' | 'adjective_phrase' | 'verb_phrase' | 'prepositional_phrase'

export interface Collocation {
  id: string
  lesson_id: string
  phrase: string
  type: CollocationType
  meaning_vi: string
  meaning_en: string
  example_sentence: string
  example_translation: string
  usage_tip?: string
  difficulty: DifficultyLevel
  track_type: TrackType
  created_at?: string
}

export interface GrammarPoint {
  id: string
  lesson_id: string
  title_vi: string
  title_en: string
  rule_summary_vi: string
  formula: string
  explanation_vi: string
  examples: {
    sentence: string
    translation: string
    highlight?: string
  }[]
  common_mistakes?: string
  toeic_tip?: string
  difficulty: DifficultyLevel
  track_type: TrackType
  created_at?: string
}

export interface SentencePattern {
  id: string
  lesson_id: string
  pattern: string
  meaning_vi: string
  context: string
  examples: {
    en: string
    vi: string
    audio_url?: string
  }[]
  difficulty: DifficultyLevel
  track_type: TrackType
  created_at?: string
}

export interface ToeicQuestion {
  id: string
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7
  question_text: string
  passage?: string
  audio_text?: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation_vi: string
  grammar_or_vocab_tag: string
}

export interface ToeicExamTest {
  id: string
  title: string
  description_vi: string
  target_score: string
  year_edition: string
  total_questions: number
  time_limit_minutes: number
  parts_included: number[]
  questions: ToeicQuestion[]
  created_at: string
}

