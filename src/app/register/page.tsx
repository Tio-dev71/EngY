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
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { TrackType } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
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
  const [googleLoading, setGoogleLoading] = useState(false)

  // 1-Click Google OAuth Sign-Up via Supabase
  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true)
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?track=${track}`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google OAuth sign-up error:', error)
        toast.error(
          language === 'vi'
            ? `Lỗi kết nối Google: ${error.message}. Hãy kiểm tra Provider Google trên Supabase!`
            : `Google OAuth error: ${error.message}`
        )
        setGoogleLoading(false)
      }
    } catch (err: any) {
      console.error('Google OAuth sign-up exception:', err)
      toast.error(err?.message || 'Có lỗi xảy ra khi kết nối Google!')
      setGoogleLoading(false)
    }
  }

  // Standard Email/Password Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
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

    // Attempt Supabase signUp if configured
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            track_type: track,
          },
        },
      })

      if (!error && data?.user) {
        login(email, fullName, track)
        setTrack(track)
        toast.success(
          language === 'vi'
            ? '🎉 Đăng ký thành công! Bạn nhận được 7 ngày trải nghiệm Pro miễn phí.'
            : '🎉 Registered successfully! You received a 7-day free Pro trial.'
        )
        router.push('/dashboard')
        return
      }
    } catch {
      // Local fallback
    }

    // Local state fallback
    login(email, fullName, track)
    setTrack(track)
    toast.success(
      language === 'vi'
        ? '🎉 Đăng ký thành công! Bạn nhận được 7 ngày trải nghiệm Pro miễn phí.'
        : '🎉 Registered successfully! You received a 7-day free Pro trial.'
    )
    router.push('/dashboard')
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

          {/* Choose Track */}
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

          {/* ─── Google OAuth Fast Sign-Up Button ────────────── */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-2xs hover:border-gray-300 hover:shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-emerald-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {googleLoading
                ? language === 'vi'
                  ? 'Đang chuyển hướng sang Google...'
                  : 'Redirecting to Google...'
                : language === 'vi'
                ? 'Đăng ký nhanh với Google'
                : 'Sign up with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
              {language === 'vi' ? 'Hoặc tạo tài khoản bằng email' : 'Or register with email'}
            </span>
            <div className="border-t border-gray-200 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
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
