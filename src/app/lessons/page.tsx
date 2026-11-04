'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Briefcase,
  Stethoscope,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Filter,
  Search,
  Layers,
  FileText,
  FileCheck2,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { DifficultyLevel, TrackType } from '@/types/database'

export default function LessonsPage() {
  const {
    activeTrack,
    setTrack,
    lessonProgress,
    isPro,
    getAllLessons,
    getAllVocabularies,
    getAllCollocations,
    getAllGrammarPoints,
    getAllToeicExams,
  } = useAppStore()
  const { language, t } = useLanguageStore()

  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | DifficultyLevel>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const proStatus = isPro()
  const allLessonsList = getAllLessons()
  const allVocabs = getAllVocabularies()
  const allCollocs = getAllCollocations()
  const allGrammar = getAllGrammarPoints()
  const toeicExams = getAllToeicExams()

  // Filter lessons
  const filteredLessons = allLessonsList
    .filter((l) => l.track_type === activeTrack)
    .filter((l) => (selectedDifficulty === 'all' ? true : l.difficulty === selectedDifficulty))
    .filter((l) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        l.title_vi.toLowerCase().includes(q) ||
        l.title_en.toLowerCase().includes(q) ||
        l.description_vi.toLowerCase().includes(q) ||
        l.description_en.toLowerCase().includes(q)
      )
    })

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* ─── Header & Track Switcher ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {activeTrack === 'medical' ? '🩺 Y Khoa (Medical English)' : '💼 Luyện Thi TOEIC'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {language === 'vi' ? 'Kho Bài Học Chuyên Ngành' : 'Specialized Lessons'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Chọn bài học để nạp từ vựng, luyện phát âm và làm minigame củng cố kiến thức
          </p>
        </div>

        {/* Track toggle */}
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

      {/* ─── Filter & Search Bar ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học, chủ đề..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 outline-none focus:border-emerald-400 focus:bg-white transition-all"
          />
        </div>

        {/* Difficulty filter buttons */}
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
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {labelMap[diff]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Lessons Cards Grid ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const isCompleted = lessonProgress[lesson.id]?.completed
          const isLocked = lesson.is_pro && !proStatus

          const difficultyBadge = {
            beginner: 'bg-emerald-100 text-emerald-700',
            intermediate: 'bg-amber-100 text-amber-700',
            advanced: 'bg-purple-100 text-purple-700',
          }[lesson.difficulty]

          return (
            <div
              key={lesson.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-lg'
              }`}
            >
              <div>
                {/* Header row with icon & badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100/80 to-purple-100/80 flex items-center justify-center text-2xl shadow-xs">
                    {lesson.icon}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${difficultyBadge}`}>
                      {lesson.difficulty.toUpperCase()}
                    </span>

                    {lesson.is_pro && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        PRO
                      </span>
                    )}

                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã học
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-extrabold text-base text-gray-900 mb-1.5">
                  {language === 'vi' ? lesson.title_vi : lesson.title_en}
                </h3>
                {/* Curriculum breakdown tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    {allVocabs.filter((v) => v.lesson_id === lesson.id).length || 5} từ vựng
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                    Cụm từ Collocations
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                    Ngữ pháp & Cấu trúc
                  </span>
                </div>
              </div>

              {/* Footer info & Action button */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {lesson.estimated_minutes}p
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> +{lesson.xp_reward} XP
                  </span>
                </div>

                {isLocked ? (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 font-bold text-xs flex items-center gap-1 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mở khóa Pro</span>
                  </Link>
                ) : (
                  <Link
                    href={`/lessons/${lesson.id}`}
                    className="btn-primary !py-2 !px-4 text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <span>{isCompleted ? 'Học lại' : 'Bắt đầu học'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── TOEIC Practice Exams & Admin Add Banner ─── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Kho Đề Thi TOEIC & Trung Tâm Admin</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Luyện Thi Thử TOEIC Format Chuẩn ETS & Soạn Thêm Đề Mới
          </h3>
          <p className="text-xs sm:text-sm text-purple-100 max-w-2xl">
            Hệ thống hỗ trợ đầy đủ các dạng câu hỏi Part 5, Part 6, Part 7, câu hỏi ngữ pháp,
            cụm từ, cấu trúc câu với giải thích chi tiết. Admin có thể thêm mới tài liệu và đề thi bất cứ lúc nào!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin#toeic-exams"
            className="px-5 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>Làm Đề Thi Thử TOEIC ({toeicExams.length})</span>
          </Link>
          <Link
            href="/admin"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/30 backdrop-blur-md transition-all flex items-center gap-2"
          >
            <span>Quản Trị Admin</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
