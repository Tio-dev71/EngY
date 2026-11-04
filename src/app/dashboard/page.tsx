'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Flame,
  Crown,
  BookOpen,
  Gamepad2,
  Repeat,
  StickyNote,
  GraduationCap,
  Briefcase,
  Stethoscope,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Zap,
  FileCheck2,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import { allLessons, allVocabularies } from '@/data/seed'
import type { TrackType } from '@/types/database'
import { toast } from 'sonner'

export default function DashboardPage() {
  const {
    user,
    activeTrack,
    setTrack,
    lessonProgress,
    notes,
    addNote,
    isPro,
    isTrialActive,
    getTrialDaysRemaining,
    getDueReviewVocabs,
    getAllLessons,
  } = useAppStore()
  const { language, t } = useLanguageStore()

  const allLessonsList = getAllLessons()
  // Filter lessons by track
  const currentLessons = allLessonsList.filter((l) => l.track_type === activeTrack)
  const completedCount = currentLessons.filter((l) => lessonProgress[l.id]?.completed).length
  const progressPercent = Math.round((completedCount / currentLessons.length) * 100) || 0

  // Quick note modal/input state
  const [quickNoteContent, setQuickNoteContent] = useState('')
  const [quickNoteColor, setQuickNoteColor] = useState('#bbf7d4')
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const dueVocabs = mounted ? getDueReviewVocabs() : []
  const trialDays = mounted ? getTrialDaysRemaining() : 7
  const proStatus = mounted ? isPro() : false
  const trialActive = mounted ? isTrialActive() : false

  const handleQuickAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickNoteContent.trim()) return
    addNote({
      lesson_id: currentLessons[0]?.id || null,
      vocabulary_id: null,
      content: quickNoteContent.trim(),
      color: quickNoteColor,
      pinned: true,
    })
    setQuickNoteContent('')
    toast.success('Đã lưu ghi chú mới vào sổ tay!')
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* ─── 7-Day Pro Trial Active Banner ────────────── */}
      {trialActive && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white shadow-lg shadow-amber-200/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">Gói Pro Dùng Thử 7 Ngày Đang Hoạt Động</span>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase">
                  Còn {trialDays} ngày
                </span>
              </div>
              <p className="text-xs text-white/90">
                Bạn đang được sử dụng trọn bộ bài học nâng cao, không giới hạn minigames và Spaced Repetition thông minh.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition-all shrink-0 shadow-xs"
          >
            Quản Lý Gói
          </Link>
        </div>
      )}

      {/* ─── Welcome Header & Track Pill ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {language === 'vi' ? 'Bảng Điều Khiển Học Tập' : 'Learning Dashboard'}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-500">
              {activeTrack === 'medical' ? '🩺 Y Khoa (Medical English)' : '💼 Luyện Thi TOEIC'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Chào mừng trở lại, {user?.full_name || 'Học viên'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Hôm nay bạn đã sẵn sàng nạp thêm từ vựng mới và chiến minigame chưa?
          </p>
        </div>

        {/* Track Switcher Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-gray-200 shadow-xs self-start md:self-auto">
          <button
            onClick={() => setTrack('toeic')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTrack === 'toeic'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Track TOEIC</span>
          </button>
          <button
            onClick={() => setTrack('medical')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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

      {/* ─── Metric Stat Cards ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total XP */}
        <div className="p-5 rounded-3xl bg-white border border-emerald-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">{t('totalXP')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {user?.xp_total || 120} <span className="text-xs font-bold text-emerald-600">XP</span>
          </div>
          <p className="text-[11px] text-gray-400">Kiếm thêm XP qua minigame</p>
        </div>

        {/* Stat 2: Streak */}
        <div className="p-5 rounded-3xl bg-white border border-orange-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">{t('streak')}</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {user?.streak_days || 1} <span className="text-xs font-bold text-orange-600">Ngày</span>
          </div>
          <p className="text-[11px] text-gray-400">Duy trì học đều mỗi ngày</p>
        </div>

        {/* Stat 3: Lessons Progress */}
        <div className="p-5 rounded-3xl bg-white border border-teal-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">{t('lessonsCompleted')}</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {completedCount}/{currentLessons.length}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stat 4: Words due for review (SRS) */}
        <div className="p-5 rounded-3xl bg-white border border-purple-100/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">{t('dueToday')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900">
            {dueVocabs.length}{' '}
            <span className="text-xs font-bold text-purple-600">từ</span>
          </div>
          <Link
            href="/review"
            className="text-[11px] font-bold text-purple-600 hover:underline inline-block"
          >
            Ôn tập ngay →
          </Link>
        </div>
      </div>

      {/* ─── Main Content Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Lessons & Minigames */}
        <div className="lg:col-span-2 space-y-8">
          {/* Lessons Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Danh Sách Bài Học' : 'Lessons'} (
                  {activeTrack === 'medical' ? 'Y Khoa' : 'TOEIC'})
                </h2>
              </div>
              <Link
                href="/lessons"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentLessons.map((lesson) => {
                const isCompleted = lessonProgress[lesson.id]?.completed
                const isLocked = lesson.is_pro && !proStatus

                return (
                  <div
                    key={lesson.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xl shadow-2xs">
                        {lesson.icon}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {lesson.is_pro && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            PRO
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã học
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-gray-900 mb-1">
                      {language === 'vi' ? lesson.title_vi : lesson.title_en}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {language === 'vi' ? lesson.description_vi : lesson.description_en}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {lesson.estimated_minutes} phút
                      </span>
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                          isLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-2xs'
                        }`}
                      >
                        <span>{isCompleted ? 'Ôn lại' : 'Học ngay'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Minigames Shortcuts */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50/40 to-white border border-purple-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-extrabold text-gray-900">
                  {language === 'vi' ? 'Minigames Luyện Tập' : 'Practice Games'}
                </h2>
              </div>
              <Link
                href="/games"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>Vào phòng game</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              Chọn minigame để củng cố từ vựng vừa học và tích lũy XP lên cấp:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/games?type=flashcard_match"
                className="p-3.5 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all text-center space-y-2 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🃏</div>
                <div className="text-xs font-bold text-gray-800">Ghép Flashcard</div>
                <div className="text-[10px] text-gray-400">+50 XP</div>
              </Link>

              <Link
                href="/games?type=multiple_choice"
                className="p-3.5 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all text-center space-y-2 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🎯</div>
                <div className="text-xs font-bold text-gray-800">Trắc Nghiệm</div>
                <div className="text-[10px] text-gray-400">+60 XP</div>
              </Link>

              <Link
                href="/games?type=fill_blank"
                className="p-3.5 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all text-center space-y-2 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">✍️</div>
                <div className="text-xs font-bold text-gray-800">Điền Khuyết</div>
                <div className="text-[10px] text-gray-400">+70 XP</div>
              </Link>

              <Link
                href="/games?type=word_scramble"
                className="p-3.5 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all text-center space-y-2 group"
              >
                <div className="text-2xl group-hover:scale-110 transition-transform">🔤</div>
                <div className="text-xs font-bold text-gray-800">Xếp Chữ Cái</div>
                <div className="text-[10px] text-gray-400">+80 XP</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Takenote Board & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Note Box */}
          <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-gray-900">Ghi Chú Nhanh (Takenote)</h3>
              </div>
              <Link href="/notes" className="text-[11px] font-bold text-emerald-600 hover:underline">
                Xem tất cả ({notes.length})
              </Link>
            </div>

            <form onSubmit={handleQuickAddNote} className="space-y-2.5">
              <textarea
                value={quickNoteContent}
                onChange={(e) => setQuickNoteContent(e.target.value)}
                placeholder="Ghi chú lại mẹo nhớ từ, công thức ngữ pháp hoặc lưu ý lâm sàng..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-emerald-400 focus:bg-white transition-all resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {['#bbf7d4', '#e9d5ff', '#ffe4e6', '#fef08a', '#bae6fd'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setQuickNoteColor(color)}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        quickNoteColor === color ? 'scale-125 border-gray-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lưu Note</span>
                </button>
              </div>
            </form>

            {/* Recent Notes Preview */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {notes.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-2xl text-xs text-gray-800 border border-black/5 shadow-2xs leading-relaxed"
                  style={{ backgroundColor: note.color }}
                >
                  <p className="line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spaced Repetition SRS Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Ôn Tập Thông Minh</h3>
                <p className="text-[11px] text-gray-500">Spaced Repetition System</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Bạn có <strong className="text-teal-700">{dueVocabs.length} từ vựng</strong> đang đến
              chu kỳ cần ôn tập để đưa vào trí nhớ dài hạn.
            </p>

            <Link
              href="/review"
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Bắt Đầu Phiên Ôn Tập</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Specialized Exercises Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Bài Tập & Luyện Đề</h3>
                <p className="text-[11px] text-gray-500">Practice & Timed Exam</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Luyện tập chuyên sâu ngữ pháp, đảo ngữ, cấu trúc câu và từ vựng chuyên ngành có giải thích chi tiết.
            </p>

            <Link
              href="/exercises"
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Vào Làm Bài Tập Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
