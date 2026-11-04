'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  FileCheck2,
  Briefcase,
  Stethoscope,
  Sparkles,
  Trophy,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Search,
  Volume2,
  VolumeX,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import { allExercises, type ExerciseItem } from '@/data/exercises'
import type { DifficultyLevel, TrackType } from '@/types/database'
import { playAudioText } from '@/lib/audio'
import {
  playCorrectSound,
  playWrongSound,
  playCardClickSound,
  playVictorySound,
  fireConfetti,
  isSoundEffectsEnabled,
  toggleSoundEffects,
} from '@/lib/soundEffects'
import { toast } from 'sonner'

type Mode = 'practice' | 'exam'

export default function ExercisesPage() {
  const { activeTrack, setTrack, addXP, voiceEngine } = useAppStore()
  const { language } = useLanguageStore()

  // Mode: Practice (instant feedback) vs Exam (timed & scored)
  const [mode, setMode] = useState<Mode>('practice')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | DifficultyLevel>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Sound sync
  useEffect(() => {
    setSoundEnabled(isSoundEffectsEnabled())
    const handleSoundToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>
      setSoundEnabled(customEvent.detail.enabled)
    }
    window.addEventListener('engy-sound-toggle', handleSoundToggle)
    return () => window.removeEventListener('engy-sound-toggle', handleSoundToggle)
  }, [])

  const handleToggleSound = () => {
    const next = toggleSoundEffects()
    setSoundEnabled(next)
    toast(
      next
        ? language === 'vi'
          ? '🔊 Đã bật âm thanh hiệu ứng'
          : '🔊 Sound FX enabled'
        : language === 'vi'
        ? '🔇 Đã tắt âm thanh hiệu ứng'
        : '🔇 Sound FX muted'
    )
  }

  // Filter exercises by current track, difficulty, category, search
  const trackExercises = useMemo(() => {
    return allExercises.filter((e) => e.track_type === activeTrack)
  }, [activeTrack])

  const categories = useMemo(() => {
    const set = new Set<string>()
    trackExercises.forEach((e) => set.add(e.category))
    return Array.from(set)
  }, [trackExercises])

  const filteredExercises = useMemo(() => {
    return trackExercises
      .filter((e) => (selectedDifficulty === 'all' ? true : e.difficulty === selectedDifficulty))
      .filter((e) => (selectedCategory === 'all' ? true : e.category === selectedCategory))
      .filter((e) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          e.title.toLowerCase().includes(q) ||
          e.question_text.toLowerCase().includes(q) ||
          e.explanation_vi.toLowerCase().includes(q) ||
          e.grammar_or_vocab_tag.toLowerCase().includes(q)
        )
      })
  }, [trackExercises, selectedDifficulty, selectedCategory, searchQuery])

  // Practice Mode state: map of exerciseId -> selected option
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({})

  // Exam Mode state
  const [examStarted, setExamStarted] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [examIndex, setExamIndex] = useState(0)
  const [examAnswers, setExamAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})
  const [examSecondsLeft, setExamSecondsLeft] = useState(600) // 10 minutes

  // Audio state
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Timer effect for exam mode
  useEffect(() => {
    if (!examStarted || examSubmitted) return
    const interval = setInterval(() => {
      setExamSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleFinishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [examStarted, examSubmitted])

  // TTS playback
  const playExerciseAudio = (id: string, text: string) => {
    setPlayingId(id)
    playAudioText(text, {
      voiceEngine,
      onStart: () => setPlayingId(id),
      onEnd: () => setPlayingId(null),
      onError: () => setPlayingId(null),
    })
  }

  // Handle Practice Answer Click
  const handlePracticeSelect = (
    exercise: ExerciseItem,
    optionKey: 'A' | 'B' | 'C' | 'D'
  ) => {
    if (revealedAnswers[exercise.id]) return

    playCardClickSound()
    setUserAnswers((prev) => ({ ...prev, [exercise.id]: optionKey }))
    setRevealedAnswers((prev) => ({ ...prev, [exercise.id]: true }))

    const isCorrect = optionKey === exercise.correct_answer
    if (isCorrect) {
      playCorrectSound()
      addXP(15)
      toast.success(
        language === 'vi' ? '🎉 Chính xác! +15 XP' : '🎉 Correct! +15 XP'
      )
    } else {
      playWrongSound()
      toast.error(
        language === 'vi'
          ? `Chưa đúng! Đáp án đúng là: ${exercise.correct_answer}`
          : `Incorrect! Correct answer is: ${exercise.correct_answer}`
      )
    }
  }

  // Exam handlers
  const handleStartExam = () => {
    if (filteredExercises.length === 0) {
      toast.error('Không có câu hỏi nào để bắt đầu bài thi!')
      return
    }
    setExamStarted(true)
    setExamSubmitted(false)
    setExamIndex(0)
    setExamAnswers({})
    setExamSecondsLeft(filteredExercises.length * 75) // 75s per question
    playCardClickSound()
  }

  const handleSelectExamOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    const currentQ = filteredExercises[examIndex]
    if (!currentQ) return
    playCardClickSound()
    setExamAnswers((prev) => ({ ...prev, [currentQ.id]: optionKey }))
  }

  const handleFinishExam = () => {
    setExamSubmitted(true)
    setExamStarted(false)

    // Calculate score
    let correctCount = 0
    filteredExercises.forEach((q) => {
      if (examAnswers[q.id] === q.correct_answer) {
        correctCount++
      }
    })

    const earnedXP = correctCount * 20 + 40
    addXP(earnedXP)
    playVictorySound()
    fireConfetti()

    toast.success(
      language === 'vi'
        ? `🏆 Hoàn thành bài thi: ${correctCount}/${filteredExercises.length} câu đúng (+${earnedXP} XP)!`
        : `🏆 Exam Completed: ${correctCount}/${filteredExercises.length} correct (+${earnedXP} XP)!`
    )
  }

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* ─── Header & Track Switcher ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                activeTrack === 'medical'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {activeTrack === 'medical' ? '🩺 Y Khoa (Medical English)' : '💼 Luyện Thi TOEIC'}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">Exercises & Drills</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {language === 'vi' ? 'Kho Bài Tập & Luyện Đề Chuyên Sâu' : 'Specialized Exercise Drills'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {language === 'vi'
              ? 'Rèn luyện ngữ pháp, cấu trúc câu, từ vựng và thuật ngữ chuyên ngành với giải thích chi tiết'
              : 'Master grammar points, collocations, sentence patterns, and vocabulary with in-depth explanations'}
          </p>
        </div>

        {/* Controls: Sound Toggle & Track Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all shadow-2xs ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
            }`}
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'vi' ? 'Âm thanh: Bật' : 'Sound: On'}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                <span>{language === 'vi' ? 'Âm thanh: Tắt' : 'Sound: Off'}</span>
              </>
            )}
          </button>

          {/* Track switch buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-gray-200 shadow-2xs">
            <button
              onClick={() => {
                setTrack('toeic')
                setSelectedCategory('all')
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTrack === 'toeic'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Track TOEIC</span>
            </button>
            <button
              onClick={() => {
                setTrack('medical')
                setSelectedCategory('all')
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTrack === 'medical'
                  ? 'bg-purple-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Track Y Khoa</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mode Selector (Practice vs Timed Exam) ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setMode('practice')
            setExamStarted(false)
          }}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 ${
            mode === 'practice'
              ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 shadow-md ring-2 ring-emerald-200'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              mode === 'practice'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base">
                {language === 'vi' ? '1. Chế Độ Luyện Tập (Practice)' : '1. Practice Mode'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Phản hồi tức thì
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {language === 'vi'
                ? 'Kiểm tra đáp án ngay sau mỗi câu, xem giải thích chi tiết, mẹo làm bài và nghe phát âm AI.'
                : 'Check answers immediately after each question with comprehensive explanations and AI audio.'}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setMode('exam')
          }}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 ${
            mode === 'exam'
              ? 'bg-purple-50/70 border-purple-400 text-purple-950 shadow-md ring-2 ring-purple-200'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              mode === 'exam'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base">
                {language === 'vi' ? '2. Chế Độ Thi Bấm Giờ (Timed Exam)' : '2. Timed Exam Mode'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Tính điểm & Thưởng XP
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {language === 'vi'
                ? 'Làm bài trong khung thời gian đếm ngược, tổng kết thang điểm và cộng dồn điểm XP xếp hạng.'
                : 'Answer under time pressure, evaluate overall performance, and accumulate leaderboard XP.'}
            </p>
          </div>
        </button>
      </div>

      {/* ─── Medical Organ Systems Specialized Navigator ───────── */}
      {activeTrack === 'medical' && (!examStarted || mode === 'practice') && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-white border border-purple-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🫀</span>
              <h3 className="font-black text-sm text-purple-950">
                {language === 'vi' ? 'Chuyên Đề Ôn Luyện Theo Từng Hệ Cơ Quan' : 'Organ System Clinical Modules'}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              {language === 'vi' ? 'Giải phẫu & Lâm sàng' : 'Anatomy & Clinical'}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === 'vi'
              ? 'Lộ trình bài tập tiếng Anh y khoa chuyên sâu từ đường hô hấp trên xuống phế nang phổi, tuần hoàn tim mạch, tiêu hóa, thần kinh và thận tiết niệu:'
              : 'Targeted clinical English exercises covering upper-to-lower respiratory, cardiovascular, digestive, nervous, and renal systems:'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { id: 'all', label: 'Tất Cả Hệ', icon: '🩺', count: trackExercises.length },
              { id: 'Hệ Hô Hấp (Respiratory System)', label: 'Hệ Hô Hấp (Mũi→Phổi)', icon: '🫁' },
              { id: 'Hệ Tim Mạch (Cardiovascular System)', label: 'Hệ Tim Mạch', icon: '🫀' },
              { id: 'Hệ Tiêu Hóa (Gastrointestinal System)', label: 'Hệ Tiêu Hóa & Gan', icon: '🥗' },
              { id: 'Hệ Thần Kinh (Nervous System)', label: 'Hệ Thần Kinh', icon: '🧠' },
              { id: 'Hệ Tiết Niệu & Thận (Urinary & Renal)', label: 'Tiết Niệu & Thận', icon: '💧' },
              { id: 'Hệ Cơ Xương Khớp (Musculoskeletal)', label: 'Cơ Xương Khớp', icon: '🦴' },
              { id: 'Hệ Nội Tiết & Chuyển Hóa (Endocrine)', label: 'Nội Tiết & Chuyển Hóa', icon: '🧪' },
              { id: 'Hệ Miễn Dịch & Huyết Học (Immune & Hematology)', label: 'Miễn Dịch & Máu', icon: '🩸' },
            ].map((system) => {
              const isSelected = selectedCategory === system.id
              const count =
                system.id === 'all'
                  ? trackExercises.length
                  : trackExercises.filter((e) => e.category === system.id).length

              return (
                <button
                  key={system.id}
                  type="button"
                  onClick={() => setSelectedCategory(system.id)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all min-h-[46px] ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-200'
                      : 'bg-white border-purple-100 hover:border-purple-300 text-gray-700 hover:bg-purple-50/50'
                  }`}
                >
                  <span className="text-xl shrink-0">{system.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black truncate leading-tight">
                      {system.label}
                    </div>
                    <div
                      className={`text-[9px] font-semibold mt-0.5 ${
                        isSelected ? 'text-purple-100' : 'text-gray-400'
                      }`}
                    >
                      {count} câu hỏi
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Search & Filters Bar (Only in Practice Mode or before Exam start) ─── */}
      {(!examStarted || mode === 'practice') && (
        <div className="p-4 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi, cấu trúc ngữ pháp..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-emerald-400 focus:bg-white transition-all"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => {
                const labelMap = {
                  all: 'Tất cả cấp độ',
                  beginner: 'Cơ bản',
                  intermediate: 'Trung cấp',
                  advanced: 'Nâng cao',
                }
                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-emerald-500 text-white font-bold shadow-xs'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {labelMap[diff]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category Chips for TOEIC or secondary filtering */}
          {activeTrack === 'toeic' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
              <span className="text-gray-400 font-bold shrink-0 text-[11px]">Chủ đề:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả ({trackExercises.length})
              </button>
              {categories.map((cat) => {
                const count = trackExercises.filter((e) => e.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. PRACTICE MODE UI (List of questions with instant reveal)
         ───────────────────────────────────────────────────────────── */}
      {mode === 'practice' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500">
              Hiển thị <span className="text-gray-900 font-black">{filteredExercises.length}</span>{' '}
              câu hỏi phù hợp
            </div>
            <button
              onClick={() => {
                setUserAnswers({})
                setRevealedAnswers({})
                toast('Đã làm mới tất cả câu trả lời.')
              }}
              className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại từ đầu</span>
            </button>
          </div>

          {filteredExercises.length === 0 && (
            <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center text-gray-400">
              <FileCheck2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-base font-bold text-gray-700">Không tìm thấy câu hỏi phù hợp!</p>
              <p className="text-xs text-gray-500 mt-1">
                Hãy thử chọn cấp độ hoặc chủ đề khác trong bộ lọc phía trên.
              </p>
            </div>
          )}

          {filteredExercises.map((exercise, index) => {
            const isRevealed = revealedAnswers[exercise.id]
            const selectedOpt = userAnswers[exercise.id]
            const isPlayingAudio = playingId === exercise.id

            const diffBadge = {
              beginner: 'bg-emerald-100 text-emerald-800',
              intermediate: 'bg-amber-100 text-amber-800',
              advanced: 'bg-purple-100 text-purple-800',
            }[exercise.difficulty]

            return (
              <div
                key={exercise.id}
                className="p-4 sm:p-7 rounded-3xl bg-white border border-gray-200 hover:border-emerald-300 shadow-xs transition-all space-y-4"
              >
                {/* Header: Number, Category, Difficulty, TTS button */}
                <div className="flex items-start justify-between gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-900 text-white text-[11px] sm:text-xs font-black flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 px-2 sm:px-2.5 py-1 rounded-lg truncate max-w-[200px] sm:max-w-none">
                      {exercise.category}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${diffBadge}`}>
                      {exercise.difficulty}
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {exercise.grammar_or_vocab_tag}
                    </span>
                  </div>

                  <button
                    onClick={() => playExerciseAudio(exercise.id, exercise.question_text)}
                    className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0 ${
                      isPlayingAudio
                        ? 'bg-emerald-500 text-white scale-105'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title="Nghe AI đọc câu hỏi"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Phát âm AI</span>
                  </button>
                </div>

                {/* Title & Question */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 mb-1">{exercise.title}</h3>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 leading-relaxed">
                    {exercise.question_text}
                  </p>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                  {exercise.options.map((option) => {
                    const isSelected = selectedOpt === option.key
                    const isCorrectAnswer = exercise.correct_answer === option.key

                    let btnStyle = 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-white hover:border-emerald-300'

                    if (isRevealed) {
                      if (isCorrectAnswer) {
                        btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md font-bold'
                      } else if (isSelected && !isCorrectAnswer) {
                        btnStyle = 'bg-red-500 text-white border-red-600 shadow-md font-bold'
                      } else {
                        btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                      }
                    }

                    return (
                      <button
                        key={option.key}
                        onClick={() => handlePracticeSelect(exercise, option.key)}
                        disabled={isRevealed}
                        className={`p-3 sm:p-4 rounded-2xl border text-xs sm:text-sm text-left flex items-center gap-2.5 sm:gap-3 transition-all min-h-[48px] ${btnStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                            isRevealed && isCorrectAnswer
                              ? 'bg-white text-emerald-600'
                              : isRevealed && isSelected
                              ? 'bg-white text-red-600'
                              : 'bg-white border border-gray-300 text-gray-700'
                          }`}
                        >
                          {option.key}
                        </span>
                        <span className="font-semibold break-words">{option.text}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Detailed Explanation Drawer (shown upon reveal) */}
                {isRevealed && (
                  <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                      {selectedOpt === exercise.correct_answer ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Chính xác! Đáp án đúng là {exercise.correct_answer}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-700">
                            Chưa chính xác! Đáp án đúng phải là {exercise.correct_answer}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {exercise.explanation_vi}
                    </p>

                    {exercise.tip && (
                      <div className="pt-2 border-t border-emerald-200/60 flex items-start gap-2 text-xs text-amber-900 font-semibold">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{exercise.tip}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. TIMED EXAM MODE UI (Countdown, single question view, score)
         ───────────────────────────────────────────────────────────── */}
      {mode === 'exam' && !examStarted && !examSubmitted && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-purple-200 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-200">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              {language === 'vi' ? 'Sẵn Sàng Thử Sức Với Bài Thi Bấm Giờ?' : 'Ready for the Timed Exam?'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              {language === 'vi'
                ? `Bài thi gồm ${filteredExercises.length} câu hỏi ngẫu nhiên trong Track ${
                    activeTrack === 'medical' ? 'Y Khoa' : 'TOEIC'
                  }. Hoàn thành trước khi hết giờ để nhận thưởng điểm XP tối đa!`
                : `Test includes ${filteredExercises.length} questions from ${
                    activeTrack === 'medical' ? 'Medical' : 'TOEIC'
                  } Track. Complete on time to maximize your XP points!`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center gap-6 text-xs font-bold text-purple-900">
            <div>
              <span className="text-gray-400 block text-[10px]">SỐ CÂU:</span>
              <span className="text-base font-black">{filteredExercises.length}</span>
            </div>
            <div className="h-8 w-px bg-purple-200" />
            <div>
              <span className="text-gray-400 block text-[10px]">THỜI GIAN:</span>
              <span className="text-base font-black">
                {Math.ceil((filteredExercises.length * 75) / 60)} phút
              </span>
            </div>
            <div className="h-8 w-px bg-purple-200" />
            <div>
              <span className="text-gray-400 block text-[10px]">PHẦN THƯỞNG:</span>
              <span className="text-base font-black text-emerald-600">
                +{filteredExercises.length * 20 + 40} XP
              </span>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-sm shadow-xl shadow-purple-200 hover:scale-105 transition-all"
          >
            Bắt Đầu Làm Bài Thi Ngay 🚀
          </button>
        </div>
      )}

      {/* Exam In Progress */}
      {mode === 'exam' && examStarted && !examSubmitted && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-200 shadow-xl space-y-6 max-w-3xl mx-auto">
          {/* Top Timer & Progress bar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400 font-bold">CÂU HỎI</span>
              <div className="text-lg font-black text-gray-900">
                {examIndex + 1}{' '}
                <span className="text-xs font-medium text-gray-400">/ {filteredExercises.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-mono font-bold text-sm">
              <Clock className="w-4 h-4 animate-pulse text-purple-600" />
              <span>{formatTime(examSecondsLeft)}</span>
            </div>

            <button
              onClick={handleFinishExam}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-colors"
            >
              Nộp bài sớm
            </button>
          </div>

          {/* Current Exam Question */}
          {filteredExercises[examIndex] && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                  {filteredExercises[examIndex].category}
                </span>
                <span className="text-xs text-gray-400 font-semibold">
                  {filteredExercises[examIndex].title}
                </span>
              </div>

              <p className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed">
                {filteredExercises[examIndex].question_text}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {filteredExercises[examIndex].options.map((opt) => {
                  const isSelected =
                    examAnswers[filteredExercises[examIndex].id] === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectExamOption(opt.key)}
                      className={`p-4 rounded-2xl border text-xs sm:text-sm text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-700 shadow-md font-bold ring-2 ring-purple-300'
                          : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-white hover:border-purple-300'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white text-purple-700'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bottom Nav: Prev / Next */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setExamIndex((i) => Math.max(0, i - 1))}
              disabled={examIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              Câu trước
            </button>

            {examIndex + 1 < filteredExercises.length ? (
              <button
                onClick={() => setExamIndex((i) => i + 1)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishExam}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-md"
              >
                Nộp bài thi & Xem kết quả 🏁
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exam Result Review */}
      {mode === 'exam' && examSubmitted && (
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-200 shadow-xl space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Kết Quả Bài Thi Của Bạn
            </h2>
            <p className="text-xs text-gray-500">
              Xem lại từng câu, kiểm tra đáp án đúng và phần giải thích chi tiết
            </p>
          </div>

          {/* Score Summary Box */}
          {(() => {
            let correct = 0
            filteredExercises.forEach((q) => {
              if (examAnswers[q.id] === q.correct_answer) correct++
            })
            const total = filteredExercises.length
            const pct = Math.round((correct / total) * 100)

            return (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
                <div>
                  <div className="text-xs font-bold text-gray-400">SỐ CÂU ĐÚNG</div>
                  <div className="text-3xl font-black text-emerald-700">
                    {correct} / {total}
                  </div>
                </div>
                <div className="h-10 w-px bg-emerald-200 hidden sm:block" />
                <div>
                  <div className="text-xs font-bold text-gray-400">TỶ LỆ CHÍNH XÁC</div>
                  <div className="text-3xl font-black text-indigo-700">{pct}%</div>
                </div>
                <div className="h-10 w-px bg-emerald-200 hidden sm:block" />
                <div>
                  <div className="text-xs font-bold text-gray-400">XP THƯỞNG</div>
                  <div className="text-3xl font-black text-amber-600">
                    +{correct * 20 + 40} XP
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setExamStarted(false)
                setExamSubmitted(false)
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Làm lại đề thi
            </button>
            <button
              onClick={() => {
                setMode('practice')
                setExamSubmitted(false)
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-sm"
            >
              Xem giải thích ở chế độ Luyện tập
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

