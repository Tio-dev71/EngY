'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Repeat,
  Sparkles,
  Volume2,
  CheckCircle2,
  RotateCcw,
  GraduationCap,
  ArrowRight,
  Flame,
  HelpCircle,
  Eye,
  Star,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { ReviewConfidence } from '@/types/database'
import { toast } from 'sonner'
import { playAudioText } from '@/lib/audio'
import {
  playCorrectSound,
  playWrongSound,
  playCardClickSound,
  playVictorySound,
  fireConfetti,
} from '@/lib/soundEffects'

export default function ReviewPage() {
  const { getDueReviewVocabs, submitReview, activeTrack, voiceEngine } = useAppStore()
  const { language, t } = useLanguageStore()
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const dueVocabs = mounted ? getDueReviewVocabs() : []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const currentVocab = dueVocabs[currentIndex]

  // Audio speech pronunciation using Edge Neural / Google TTS
  const playAudio = (text: string) => {
    playAudioText(text, { voiceEngine })
  }

  const handleRating = (confidence: ReviewConfidence) => {
    if (!currentVocab) return

    submitReview(currentVocab.id, confidence)
    setIsFlipped(false)
    setReviewedCount((prev) => prev + 1)

    if (confidence === 'again') {
      playWrongSound()
    } else if (confidence === 'hard') {
      playCardClickSound()
    } else {
      playCorrectSound()
    }

    const labelMap = {
      again: 'Sẽ ôn lại sớm!',
      hard: 'Đã ghi nhớ!',
      good: 'Rất tốt! (+10 XP)',
      easy: 'Thành thạo xuất sắc! (+15 XP)',
    }
    toast.success(labelMap[confidence])

    if (currentIndex + 1 < dueVocabs.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      playVictorySound()
      fireConfetti()
      setSessionCompleted(true)
    }
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/60">
          <Repeat className="w-3.5 h-3.5" />
          <span>Spaced Repetition System (SRS)</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Ôn Tập Nhắc Lại Kiến Thức
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Thuật toán nhắc nhở thông minh dựa trên độ quên để đưa từ vựng vào trí nhớ vĩnh viễn.
        </p>
      </div>

      {/* ─── Session Completed Victory State ─────────── */}
      {(sessionCompleted || dueVocabs.length === 0) && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-teal-100 shadow-xl text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-300 via-emerald-400 to-teal-500 text-white shadow-lg text-4xl">
            🎉
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Tuyệt Vời! Đã Hoàn Thành Phiên Ôn Tập
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
              Không còn từ nào trong danh sách cần ôn tập lúc này. Hãy quay lại vào ngày mai nhé!
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-600">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-800">
              Đã ôn tập: <span className="text-lg font-black">{reviewedCount}</span> từ
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-800">
              Điểm XP: <span className="text-lg font-black">+{reviewedCount * 10}</span> XP
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/lessons"
              className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-xs"
            >
              Học Bài Mới Tiếp Theo
            </Link>
            <Link
              href="/games"
              className="px-6 py-3 rounded-2xl bg-white text-gray-700 font-bold text-xs border border-gray-200 hover:bg-gray-50"
            >
              Chơi Minigame Thử Thách
            </Link>
          </div>
        </div>
      )}

      {/* ─── Active SRS Card ─────────────────────────── */}
      {!sessionCompleted && currentVocab && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
              <span>
                Từ {currentIndex + 1} / {dueVocabs.length}
              </span>
              <span>Đã hoàn thành {reviewedCount} từ</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / dueVocabs.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => {
              playCardClickSound()
              setIsFlipped(!isFlipped)
            }}
            className="cursor-pointer min-h-[320px] p-8 sm:p-10 rounded-3xl bg-white border-2 border-teal-100/80 shadow-lg hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between text-center relative group"
          >
            {/* Card top badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                {currentVocab.part_of_speech}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(currentVocab.word)
                }}
                className="p-2.5 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors shadow-2xs"
                title="Nghe phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Front & Back Content */}
            {!isFlipped ? (
              // FRONT OF FLASHCARD
              <div className="py-8 space-y-3">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {currentVocab.word}
                </h2>
                <p className="text-base font-mono text-purple-600 font-bold">
                  {currentVocab.phonetic}
                </p>
                <div className="pt-6">
                  <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-bold bg-teal-50 px-3 py-1.5 rounded-full">
                    <Eye className="w-3.5 h-3.5" /> Chạm để lật xem nghĩa
                  </span>
                </div>
              </div>
            ) : (
              // BACK OF FLASHCARD
              <div className="py-6 space-y-4 animate-fade-in-up">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-700">
                    {currentVocab.meaning_vi}
                  </h3>
                  <p className="text-xs text-gray-500 italic mt-0.5">{currentVocab.meaning_en}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Ví dụ:</div>
                  <div className="text-xs font-semibold text-gray-800">
                    &ldquo;{currentVocab.example_sentence}&rdquo;
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    {currentVocab.example_translation}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom hint */}
            <div className="text-[11px] text-gray-400">
              {isFlipped
                ? 'Đánh giá mức độ nhớ của bạn bên dưới:'
                : 'Hãy nhớ lại nghĩa của từ trước khi lật thẻ'}
            </div>
          </div>

          {/* SRS Confidence Buttons (Only visible after flip) */}
          {isFlipped && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fade-in-up">
              <button
                onClick={() => handleRating('again')}
                className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <span>🔴 Quên (Again)</span>
                <span className="text-[10px] font-normal opacity-80">Ôn lại ngay</span>
              </button>

              <button
                onClick={() => handleRating('hard')}
                className="p-3.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <span>🟡 Khó (Hard)</span>
                <span className="text-[10px] font-normal opacity-80">1 ngày nữa</span>
              </button>

              <button
                onClick={() => handleRating('good')}
                className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <span>🟢 Nhớ Tốt (Good)</span>
                <span className="text-[10px] font-normal opacity-80">3 ngày nữa</span>
              </button>

              <button
                onClick={() => handleRating('easy')}
                className="p-3.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <span>🔵 Dễ Quá (Easy)</span>
                <span className="text-[10px] font-normal opacity-80">7 ngày nữa</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
