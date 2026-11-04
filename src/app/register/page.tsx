'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Stethoscope,
  ArrowRight,
  Crown,
  User,
  Mail,
  Lock,
  CheckCircle2,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { TrackType } from '@/types/database'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { login, setTrack } = useAppStore()
  const { language, t } = useLanguageStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [track, setSelectedTrack] = useState<TrackType>('toeic')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error(language === 'vi' ? 'Vui lòng nhập email!' : 'Please enter your email!')
      return
    }
    if (!password || password.length < 6) {
      toast.error(
        language === 'vi'
          ? 'Mật khẩu phải có ít nhất 6 ký tự!'
          : 'Password must be at least 6 characters!'
      )
      return
    }

    setLoading(true)
    setTimeout(() => {
      login(email, fullName, track)
      setTrack(track)
      toast.success(
        language === 'vi'
          ? '🎉 Đăng ký thành công! Bạn nhận được 7 ngày trải nghiệm Pro miễn phí.'
          : '🎉 Registered successfully! You received a 7-day free Pro trial.'
      )
      router.push('/dashboard')
    }, 450)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-emerald-50/40 via-purple-50/20 to-[#fafdf9]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block group mb-1" title="EngY Home">
              <Image
                src="/EngYlogo.png"
                alt="EngY Logo"
                width={84}
                height={56}
                style={{ height: '56px', width: 'auto' }}
                className="h-14 w-auto object-contain mx-auto group-hover:scale-105 transition-transform"
                priority
              />
            </Link>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {language === 'vi' ? 'Tạo Tài Khoản EngY' : 'Create Your EngY Account'}
            </h1>
            <p className="text-xs text-gray-500">
              {language === 'vi'
                ? 'Học tiếng Anh chuyên biệt theo đúng lộ trình của bạn'
                : 'Master specialized English tailored to your exact track'}
            </p>
          </div>

          {/* 7-Day Pro Trial Alert */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div className="text-xs text-amber-900">
              <span className="font-bold">
                {language === 'vi' ? 'Quà tặng tân học viên:' : 'New Learner Gift:'}
              </span>{' '}
              {language === 'vi' ? (
                <>
                  Tự động kích hoạt{' '}
                  <strong className="text-orange-700">7 ngày trải nghiệm gói Pro</strong> đầy đủ tính
                  năng ngay sau khi đăng ký!
                </>
              ) : (
                <>
                  Automatically unlocked{' '}
                  <strong className="text-orange-700">7 days of full Pro access</strong> right upon
                  registration!
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Choose Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                1. {t('chooseTrack')} <span className="text-emerald-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrack('toeic')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    track === 'toeic'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>TOEIC Track</span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">
                    {language === 'vi' ? 'Từ vựng công sở, 4 kỹ năng' : '4 skills & business vocab'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTrack('medical')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    track === 'medical'
                      ? 'border-purple-500 bg-purple-50/70 text-purple-900 shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                    <span>Medical Track</span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">
                    {language === 'vi' ? 'Thuật ngữ y khoa, lâm sàng' : 'Clinical & anatomy terms'}
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">2. {t('fullName')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                  className="w-full !pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">3. {t('email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full !pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">4. {t('password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full !pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {loading
                  ? t('loading')
                  : language === 'vi'
                  ? 'Đăng Ký & Nhận 7 Ngày Pro'
                  : 'Register & Claim 7-Day Pro'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer link */}
          <div className="text-center text-xs text-gray-500">
            <span>{t('hasAccount')} </span>
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
