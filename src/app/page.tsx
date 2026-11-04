'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Stethoscope,
  Briefcase,
  Sparkles,
  Gamepad2,
  Repeat,
  StickyNote,
  Crown,
  Volume2,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { TrackType } from '@/types/database'
import { playAudioText } from '@/lib/audio'

export default function HomePage() {
  const router = useRouter()
  const { user, activeTrack, setTrack, voiceEngine } = useAppStore()
  const { language, t } = useLanguageStore()
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Interactive sample card audio pronunciation using Edge Neural & Google TTS
  const playSampleAudio = (text: string) => {
    setIsPlayingAudio(true)
    playAudioText(text, {
      voiceEngine,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    })
  }

  const handleStartLearning = (track: TrackType) => {
    setTrack(track)
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/lessons')
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-emerald-50/60 via-purple-50/30 to-[#fafdf9]">
        {/* Subtle decorative circles */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-6">
            {/* Cute Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200 shadow-xs text-xs font-semibold text-emerald-800">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('freeTrialBanner')}</span>
            </div>

            {/* Main Headline (Strictly 2 lines on tablet & desktop) */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.15] max-w-4xl lg:max-w-5xl mx-auto">
              <span className="block sm:whitespace-nowrap">
                {t('heroTitleLead')}{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 bg-clip-text text-transparent">
                  {t('heroTitleFocus')}
                </span>
              </span>
              <span className="block mt-1 sm:mt-2">
                {t('heroTitleSub')}
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* Track Switch Tabs on Hero */}
            <div className="pt-2 pb-1">
              <div className="inline-flex p-1.5 rounded-2xl bg-white shadow-md border border-gray-100 gap-1.5 max-w-full mx-auto">
                <button
                  onClick={() => setTrack('toeic')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    activeTrack === 'toeic'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{t('btnToeicTrack')}</span>
                </button>
                <button
                  onClick={() => setTrack('medical')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    activeTrack === 'medical'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{t('btnMedicalTrack')}</span>
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleStartLearning(activeTrack)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {user
                    ? language === 'vi'
                      ? 'Tiếp tục học'
                      : 'Continue Learning'
                    : language === 'vi'
                    ? 'Bắt đầu học ngay'
                    : 'Start Learning Now'}{' '}
                  (
                  {activeTrack === 'medical'
                    ? language === 'vi'
                      ? 'Track Y Khoa'
                      : 'Medical Track'
                    : language === 'vi'
                    ? 'Track TOEIC'
                    : 'TOEIC Track'}
                  )
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-gray-800 font-bold text-sm border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{t('btnCreateAccountTrial')}</span>
              </Link>
            </div>

            {/* Quick stats badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('stat1000Words')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('stat4Games')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t('statNativeVoice')}</span>
              </div>
            </div>
          </div>

          {/* ─── Interactive Vocabulary Card Preview ───────────────────────── */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-300 via-teal-200 to-purple-300 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
              <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        activeTrack === 'medical'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {activeTrack === 'medical' ? t('sampleMedBadge') : t('sampleToeicBadge')}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {language === 'vi' ? 'Bài 01 • Cơ bản' : 'Lesson 01 • Basic'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+10 XP</span>
                  </div>
                </div>

                {/* Word Content */}
                <div className="py-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {activeTrack === 'medical' ? 'Cardiovascular' : 'Agenda'}
                      </h3>
                      <p className="text-sm font-mono text-purple-600 font-semibold pt-1">
                        {activeTrack === 'medical' ? '/ˌkɑːrdioʊˈvæskjələr/' : '/əˈdʒendə/'}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        playSampleAudio(activeTrack === 'medical' ? 'Cardiovascular' : 'Agenda')
                      }
                      className={`p-3 rounded-2xl transition-all shadow-xs ${
                        isPlayingAudio
                          ? 'bg-emerald-500 text-white scale-110'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                      title={t('sampleAudioHint')}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
                    <div className="text-sm font-semibold text-gray-800">
                      {t('meaning')}:{' '}
                      <span className="text-emerald-700 font-bold">
                        {activeTrack === 'medical'
                          ? t('sampleMedMeaning')
                          : t('sampleToeicMeaning')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 italic">
                      {t('example')}:{' '}
                      {activeTrack === 'medical'
                        ? t('sampleMedExample')
                        : t('sampleToeicExample')}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
                  <span className="text-gray-400">{t('sampleAudioHint')}</span>
                  <button
                    onClick={() => handleStartLearning(activeTrack)}
                    className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group/btn"
                  >
                    <span>{t('sampleViewAll')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 Core Pillars Section ───────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              {language === 'vi' ? 'Phương Pháp Toàn Diện' : 'Modern Learning System'}
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('whyTitle')}
            </h3>
            <p className="text-sm sm:text-base text-gray-500">{t('whySubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Tracks */}
            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-5 shadow-md shadow-emerald-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{t('feature1Title')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('feature1Desc')}</p>
            </div>

            {/* Feature 2: Minigames */}
            <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-5 shadow-md shadow-purple-200">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{t('feature2Title')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('feature2Desc')}</p>
            </div>

            {/* Feature 3: Spaced Repetition */}
            <div className="p-6 rounded-3xl bg-teal-50/50 border border-teal-100 hover:shadow-lg hover:shadow-teal-100/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center mb-5 shadow-md shadow-teal-200">
                <Repeat className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{t('feature3Title')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('feature3Desc')}</p>
            </div>

            {/* Feature 4: In-lesson Takenotes */}
            <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100 hover:shadow-lg hover:shadow-rose-100/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-400 text-white flex items-center justify-center mb-5 shadow-md shadow-rose-200">
                <StickyNote className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{t('feature4Title')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('feature4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Track Breakdown Showcase ─────────────────── */}
      <section className="py-16 md:py-20 bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* TOEIC Card */}
            <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{t('targetToeicHead')}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">
                  {language === 'vi'
                    ? 'Lộ Trình Luyện Thi TOEIC Mục Tiêu 850+'
                    : 'Targeted TOEIC 850+ Mastery Track'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('targetToeicDesc')}</p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? 'Bộ từ vựng 600 Essential Words for TOEIC'
                        : '600 Essential Words for TOEIC collection'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? 'Ngữ cảnh hội thoại văn phòng thực tế'
                        : 'Authentic workplace & business dialogue contexts'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? 'Phản xạ từ đồng nghĩa và bẫy đề thi'
                        : 'Exam traps and synonym reflex practice'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleStartLearning('toeic')}
                  className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>
                    {language === 'vi' ? 'Khám Phá Track TOEIC' : 'Explore TOEIC Track'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Medical Card */}
            <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{t('targetMedHead')}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">
                  {language === 'vi'
                    ? 'Tiếng Anh Y Khoa & Thuật Ngữ Lâm Sàng'
                    : 'Clinical Medical English & Terminology'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('targetMedDesc')}</p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? 'Giải phẫu học & Thuật ngữ Latin/Hy Lạp'
                        : 'Anatomy, Latin & Greek root words'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? 'Giao tiếp bác sĩ - bệnh nhân quốc tế'
                        : 'International doctor-patient communications'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>
                      {language === 'vi'
                        ? 'Đọc hiểu bệnh án & tài liệu y khoa Pubmed'
                        : 'Clinical records & PubMed research paper reading'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleStartLearning('medical')}
                  className="w-full py-3 rounded-2xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>
                    {language === 'vi' ? 'Khám Phá Track Y Khoa' : 'Explore Medical Track'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7-Day Pro Trial Banner ───────────────────── */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
            <Crown className="w-4 h-4 text-amber-300" />
            <span>{language === 'vi' ? 'Ưu Đãi Tân Học Viên' : 'New Learner Privilege'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{t('ctaHeading')}</h2>
          <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
            {t('ctaSubheading')}
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-emerald-800 font-extrabold text-sm shadow-xl hover:bg-gray-50 hover:scale-105 transition-all"
            >
              <span>{t('ctaButton')} (7 Days Pro)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
