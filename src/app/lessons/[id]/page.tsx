'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  Gamepad2,
  StickyNote,
  CheckCircle2,
  BookOpen,
  Layers,
  GraduationCap,
  Clock,
  Lightbulb,
  AlertTriangle,
  FileText,
  MessageSquare,
  HelpCircle,
  FileCheck2,
  ChevronRight,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { Vocabulary, Collocation, GrammarPoint, SentencePattern } from '@/types/database'
import { playAudioText } from '@/lib/audio'
import { toast } from 'sonner'

type LessonTab = 'vocab' | 'collocations' | 'grammar' | 'patterns'

/* ─── Tab config for rendering ──────────────────── */
const TAB_CONFIG: {
  key: LessonTab
  label: string
  icon: React.ReactNode
  color: string
  activeBg: string
  activeText: string
  badgeBg: string
  badgeText: string
}[] = [
  {
    key: 'vocab',
    label: '1. Từ Vựng Cốt Lõi',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'emerald',
    activeBg: 'bg-emerald-500',
    activeText: 'text-white',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  {
    key: 'collocations',
    label: '2. Cụm Từ & Collocations',
    icon: <Layers className="w-4 h-4" />,
    color: 'purple',
    activeBg: 'bg-purple-500',
    activeText: 'text-white',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
  },
  {
    key: 'grammar',
    label: '3. Ngữ Pháp & Công Thức',
    icon: <FileText className="w-4 h-4" />,
    color: 'blue',
    activeBg: 'bg-blue-500',
    activeText: 'text-white',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
  },
  {
    key: 'patterns',
    label: '4. Mẫu Câu Thực Tế',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'amber',
    activeBg: 'bg-amber-500',
    activeText: 'text-white',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
  },
]

function LessonDetailContent() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params?.id as string

  const {
    lessonProgress,
    completeLesson,
    addNote,
    voiceEngine,
    getAllLessons,
    getAllVocabularies,
    getAllCollocations,
    getAllGrammarPoints,
    getAllSentencePatterns,
  } = useAppStore()
  const { language, t } = useLanguageStore()

  const [activeTab, setActiveTab] = useState<LessonTab>('vocab')

  const allLessonsList = getAllLessons()
  const lesson = allLessonsList.find((l) => l.id === lessonId)

  // Filter items by current lesson_id, or fallback to track items if lesson is specific
  const allVocabs = getAllVocabularies()
  const vocabularies = allVocabs.filter((v) => v.lesson_id === lessonId)

  const allCollocs = getAllCollocations()
  const lessonCollocations = allCollocs.filter(
    (c) => c.lesson_id === lessonId || (lesson && c.track_type === lesson.track_type)
  )

  const allGrammar = getAllGrammarPoints()
  const lessonGrammar = allGrammar.filter(
    (g) => g.lesson_id === lessonId || (lesson && g.track_type === lesson.track_type)
  )

  const allPatterns = getAllSentencePatterns()
  const lessonPatterns = allPatterns.filter(
    (p) => p.lesson_id === lessonId || (lesson && p.track_type === lesson.track_type)
  )

  // Audio pronunciation state
  const [playingText, setPlayingText] = useState<string | null>(null)

  // Inline note per item
  const [activeNoteVocabId, setActiveNoteVocabId] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [noteColor, setNoteColor] = useState('#bbf7d4')

  const isCompleted = lessonProgress[lessonId]?.completed

  // Tab item counts
  const tabCounts: Record<LessonTab, number> = {
    vocab: vocabularies.length,
    collocations: lessonCollocations.length,
    grammar: lessonGrammar.length,
    patterns: lessonPatterns.length,
  }

  if (!lesson) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy bài học!</h2>
        <p className="text-sm text-gray-500 mb-4">Bài học này có thể đã bị xoá hoặc không tồn tại.</p>
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách bài học
        </Link>
      </div>
    )
  }

  // Audio Speech Synthesis function using Edge Neural / Google TTS
  const playAudio = (text: string) => {
    setPlayingText(text)
    playAudioText(text, {
      voiceEngine,
      onStart: () => setPlayingText(text),
      onEnd: () => setPlayingText(null),
      onError: () => setPlayingText(null),
    })
  }

  const handleSaveInlineNote = (title: string, vocabId?: string) => {
    if (!noteContent.trim()) return
    addNote({
      lesson_id: lesson.id,
      vocabulary_id: vocabId || null,
      content: `[${title}]: ${noteContent.trim()}`,
      color: noteColor,
      pinned: false,
    })
    setNoteContent('')
    setActiveNoteVocabId(null)
    toast.success(`Đã lưu ghi chú cho "${title}"!`)
  }

  const handleFinishLesson = () => {
    completeLesson(lesson.id, 100, lesson.xp_reward)
    toast.success(`🎉 Chúc mừng bạn đã hoàn thành bài học và nhận +${lesson.xp_reward} XP!`)
  }

  return (
    <div className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* ─── Breadcrumb & Navigation Header ──────────── */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'vi' ? 'Quay lại bài học' : 'Back to Lessons'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              lesson.track_type === 'medical'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {lesson.track_type === 'medical' ? '🩺 Y Khoa' : '💼 TOEIC'}
          </span>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> +{lesson.xp_reward} XP
          </span>
        </div>
      </div>

      {/* ─── Lesson Banner ────────────────────────────── */}
      <div
        className="p-6 sm:p-8 rounded-3xl border border-emerald-200 mb-6"
        style={{
          background: 'linear-gradient(135deg, #f0fdf7 0%, #f0f4ff 50%, #faf5ff 100%)',
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            {lesson.icon}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
              {language === 'vi' ? lesson.title_vi : lesson.title_en}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              {language === 'vi' ? lesson.description_vi : lesson.description_en}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {lesson.estimated_minutes} phút
          </span>
          <span className="font-bold text-emerald-700">{vocabularies.length} từ vựng</span>
          <span className="font-bold text-purple-700">{lessonCollocations.length} cụm từ</span>
          <span className="font-bold text-blue-700">{lessonGrammar.length} điểm ngữ pháp</span>
          <span className="font-bold text-amber-700">{lessonPatterns.length} mẫu câu</span>
          <span className="capitalize text-gray-400">{lesson.difficulty}</span>
        </div>
      </div>

      {/* ─── Multi-Dimension Learning Tab Selector ───── */}
      <div
        className="mb-6 p-1.5 rounded-2xl border border-gray-200 overflow-x-auto scrollbar-none"
        style={{ background: '#f5f5f5', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center gap-1.5 min-w-max">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key
            const count = tabCounts[tab.key]
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? `${tab.activeBg} ${tab.activeText} shadow-md`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
                style={isActive ? { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' } : {}}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/30 text-white' : `${tab.badgeBg} ${tab.badgeText}`
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── TAB 1: VOCABULARY CARDS ─────────────────── */}
      {activeTab === 'vocab' && (
        <div className="animate-fade-in" key="tab-vocab">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-200">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Từ Vựng Trong Bài</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {vocabularies.length} từ
              </span>
            </h2>
            <span className="text-xs text-gray-400 hidden sm:inline">Nhấn 🔊 để nghe phát âm</span>
          </div>

          <div className="space-y-5">
            {vocabularies.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Chưa có từ vựng nào trong bài học này.</p>
                <p className="text-xs mt-1">Admin có thể thêm từ vựng tại trang <Link href="/admin" className="text-emerald-600 underline">Quản trị</Link>.</p>
              </div>
            )}
            {vocabularies.map((vocab, index) => {
              const isAudioPlaying = playingText === vocab.word
              const isNoteOpen = activeNoteVocabId === vocab.id

              return (
                <div
                  key={vocab.id || index}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 transition-all"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  {/* Word header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900">{vocab.word}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {vocab.part_of_speech}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-purple-600 font-semibold mt-1">
                        {vocab.phonetic}
                      </p>
                    </div>

                    {/* Audio & Note Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => playAudio(vocab.word)}
                        className={`p-3 rounded-xl transition-all ${
                          isAudioPlaying
                            ? 'bg-emerald-500 text-white scale-110'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                        style={{ boxShadow: isAudioPlaying ? '0 4px 12px rgba(34,197,94,0.3)' : 'none' }}
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setActiveNoteVocabId(isNoteOpen ? null : vocab.id)}
                        className={`p-3 rounded-xl transition-colors ${
                          isNoteOpen
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Ghi chú từ này"
                      >
                        <StickyNote className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Meaning & Example */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
                        Ý nghĩa:
                      </div>
                      <div className="text-sm font-bold text-gray-900">{vocab.meaning_vi}</div>
                      <div className="text-xs text-gray-600 mt-1 italic">{vocab.meaning_en}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Câu ví dụ:
                      </div>
                      <div className="text-xs font-medium text-gray-800">
                        &ldquo;{vocab.example_sentence}&rdquo;
                      </div>
                      <div className="text-xs text-gray-500 mt-1 italic">
                        {vocab.example_translation}
                      </div>
                    </div>
                  </div>

                  {/* Inline Takenote Drawer */}
                  {isNoteOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                        <span>Thêm ghi chú cho từ &ldquo;{vocab.word}&rdquo;:</span>
                        <div className="flex items-center gap-1">
                          {['#bbf7d4', '#e9d5ff', '#ffe4e6', '#fef08a', '#bae6fd'].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNoteColor(color)}
                              className="w-5 h-5 rounded-full border-2 transition-transform"
                              style={{
                                backgroundColor: color,
                                borderColor: noteColor === color ? '#374151' : 'transparent',
                                transform: noteColor === color ? 'scale(1.2)' : 'scale(1)',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Mẹo nhớ, tiền tố, collocation hay gặp..."
                          className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-emerald-400 transition-colors"
                          style={{ background: '#fafafa' }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineNote(vocab.word, vocab.id)}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveInlineNote(vocab.word, vocab.id)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shrink-0"
                        >
                          Lưu Note
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: COLLOCATIONS & NOUN/ADJ PHRASES ──── */}
      {activeTab === 'collocations' && (
        <div className="animate-fade-in" key="tab-collocations">
          <div className="pb-3 mb-5 border-b border-gray-200">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Cụm Danh Từ, Cụm Tính Từ & Collocations</span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                {lessonCollocations.length} cụm từ
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Các cụm từ cố định thường gặp trong bài thi TOEIC và hồ sơ bệnh án y khoa
            </p>
          </div>

          <div className="space-y-5">
            {lessonCollocations.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Chưa có cụm từ nào cho bài học này.</p>
              </div>
            )}
            {lessonCollocations.map((item, index) => {
              const isAudioPlaying = playingText === item.phrase
              const typeLabel =
                item.type === 'noun_phrase'
                  ? 'Cụm Danh Từ'
                  : item.type === 'adjective_phrase'
                  ? 'Cụm Tính Từ'
                  : item.type === 'verb_phrase'
                  ? 'Cụm Động Từ'
                  : 'Cụm Giới Từ'

              return (
                <div
                  key={item.id || index}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 transition-all"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                        <h3 className="text-lg sm:text-xl font-black text-purple-950">
                          {item.phrase}
                        </h3>
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100"
                        >
                          {typeLabel}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-emerald-700 mt-1.5">{item.meaning_vi}</p>
                      <p className="text-xs text-gray-500 italic mt-0.5">{item.meaning_en}</p>
                    </div>

                    <button
                      onClick={() => playAudio(item.phrase)}
                      className={`p-3 rounded-xl transition-all shrink-0 ${
                        isAudioPlaying
                          ? 'bg-purple-600 text-white scale-110'
                          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }`}
                      style={{ boxShadow: isAudioPlaying ? '0 4px 12px rgba(147,51,234,0.3)' : 'none' }}
                      title="Nghe phát âm cụm từ"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Example */}
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Ngữ cảnh thực tế:
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      &ldquo;{item.example_sentence}&rdquo;
                    </div>
                    <div className="text-xs text-gray-500 italic mt-1">{item.example_translation}</div>
                  </div>

                  {/* Usage Tip */}
                  {item.usage_tip && (
                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 leading-relaxed">
                        <strong className="font-bold">Mẹo thực tế / Bẫy đề thi:</strong>{' '}
                        {item.usage_tip}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: GRAMMAR & FORMULAS ───────────────── */}
      {activeTab === 'grammar' && (
        <div className="animate-fade-in" key="tab-grammar">
          <div className="pb-3 mb-5 border-b border-gray-200">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Ngữ Pháp Trọng Điểm & Cấu Trúc</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {lessonGrammar.length} chủ điểm
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Các quy tắc ngữ pháp, công thức cốt lõi và mẹo giải nhanh
            </p>
          </div>

          <div className="space-y-6">
            {lessonGrammar.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Chưa có điểm ngữ pháp nào cho bài học này.</p>
              </div>
            )}
            {lessonGrammar.map((item, index) => (
              <div
                key={item.id || index}
                className="p-5 sm:p-7 rounded-2xl bg-white border border-blue-100 hover:border-blue-300 transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Chủ điểm #{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 capitalize">
                      {item.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                    {item.title_vi}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">{item.title_en}</p>
                </div>

                {/* Formula Highlight Box */}
                <div
                  className="p-4 rounded-xl border border-blue-200 mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #f0fdfa 100%)',
                  }}
                >
                  <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cấu Trúc / Công Thức Trọng Tâm:</span>
                  </div>
                  <div
                    className="text-sm sm:text-base font-mono font-extrabold text-blue-950 px-3 py-2 rounded-lg border border-blue-100 w-full"
                    style={{ background: 'rgba(255,255,255,0.8)' }}
                  >
                    {item.formula}
                  </div>
                </div>

                {/* Explanation */}
                <div className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
                  <p className="font-semibold text-gray-900 mb-1">{item.rule_summary_vi}</p>
                  <p className="text-gray-600">{item.explanation_vi}</p>
                </div>

                {/* Examples with highlight */}
                <div className="mb-4">
                  <div className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Ví dụ minh họa:
                  </div>
                  <div className="space-y-2.5">
                    {item.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="text-xs sm:text-sm font-semibold text-gray-900">
                          &bull; {ex.sentence}
                        </div>
                        <div className="text-xs text-gray-500 italic mt-0.5">{ex.translation}</div>
                        {ex.highlight && (
                          <div
                            className="text-[11px] font-bold text-indigo-700 px-2.5 py-1 rounded-lg inline-block mt-1.5"
                            style={{ background: 'rgba(238,242,255,0.8)' }}
                          >
                            👉 Lưu ý: {ex.highlight}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings / Common mistakes & Exam Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.common_mistakes && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-red-900">
                        <strong className="font-bold">Lỗi sai phổ biến:</strong>{' '}
                        {item.common_mistakes}
                      </div>
                    </div>
                  )}

                  {item.toeic_tip && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-900">
                        <strong className="font-bold">Mẹo bẫy / Mẹo phòng thi:</strong>{' '}
                        {item.toeic_tip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: SENTENCE PATTERNS ────────────────── */}
      {activeTab === 'patterns' && (
        <div className="animate-fade-in" key="tab-patterns">
          <div className="pb-3 mb-5 border-b border-gray-200">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <span>Cấu Trúc & Mẫu Câu Thực Tế</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {lessonPatterns.length} mẫu câu
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Các mẫu câu đối thoại, viết email và giao tiếp chuyên nghiệp
            </p>
          </div>

          <div className="space-y-5">
            {lessonPatterns.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Chưa có mẫu câu nào cho bài học này.</p>
              </div>
            )}
            {lessonPatterns.map((item, index) => (
              <div
                key={item.id || index}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="mb-3">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    Ngữ cảnh: {item.context}
                  </span>
                  <h3
                    className="text-base sm:text-lg font-mono font-black text-gray-900 mt-2 p-3 rounded-xl border border-amber-100"
                    style={{ background: 'rgba(255,251,235,0.5)' }}
                  >
                    {item.pattern}
                  </h3>
                  <p className="text-sm font-bold text-emerald-700 mt-2">{item.meaning_vi}</p>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Các câu ứng dụng thực tế:
                  </div>
                  <div className="space-y-2.5">
                    {item.examples.map((ex, i) => {
                      const isAudioPlaying = playingText === ex.en
                      return (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-gray-900">
                              &ldquo;{ex.en}&rdquo;
                            </div>
                            <div className="text-xs text-gray-500 italic mt-0.5">{ex.vi}</div>
                          </div>

                          <button
                            onClick={() => playAudio(ex.en)}
                            className={`p-2.5 rounded-lg transition-all shrink-0 ${
                              isAudioPlaying
                                ? 'bg-amber-500 text-white scale-110'
                                : 'bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200'
                            }`}
                            title="Nghe câu này"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Bottom Actions & Minigame Launcher ───────── */}
      <div
        className="mt-8 p-6 sm:p-8 rounded-2xl border-2 border-emerald-200"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf7 40%, #faf5ff 100%)',
          boxShadow: '0 4px 16px rgba(34,197,94,0.08)',
        }}
      >
        <div className="text-center mb-5">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">
            🎯 Bạn Đã Nắm Rõ Toàn Bộ Kiến Thức Của Bài Này?
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mt-2">
            Gồm từ vựng, cụm từ collocations, ngữ pháp trọng điểm và mẫu câu. Hãy hoàn thành bài học
            để nhận XP và thử sức với các Minigame củng cố phản xạ!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleFinishLesson}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
            style={!isCompleted ? { boxShadow: '0 4px 12px rgba(34,197,94,0.3)' } : {}}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Đã Ghi Nhận Hoàn Thành' : 'Đánh Dấu Hoàn Thành (+XP)'}</span>
          </button>

          <Link
            href={`/games?lesson=${lesson.id}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all text-white"
            style={{
              background: 'linear-gradient(135deg, #9333ea, #6366f1)',
              boxShadow: '0 4px 12px rgba(147,51,234,0.3)',
            }}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Chơi Minigames Ôn Luyện Bài Này</span>
          </Link>

          {lesson.track_type === 'toeic' && (
            <Link
              href="/admin#toeic-exams"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-purple-200 text-purple-700 font-bold text-sm hover:bg-purple-50 flex items-center justify-center gap-2 transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-purple-600" />
              <span>Kho Đề Thi TOEIC Mẫu</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LessonDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Đang tải bài học...</div>}>
      <LessonDetailContent />
    </Suspense>
  )
}
