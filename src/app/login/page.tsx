'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Stethoscope,
  ArrowRight,
  Lock,
  Mail,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { TrackType } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login, setTrack } = useAppStore()
  const { language, t } = useLanguageStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [track, setSelectedTrack] = useState<TrackType>('toeic')
  const [loading, setLoading] = useState(false)

  // Email & Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error(language === 'vi' ? 'Vui lòng nhập email!' : 'Please enter your email!')
      return
    }
    if (!password) {
      toast.error(language === 'vi' ? 'Vui lòng nhập mật khẩu!' : 'Please enter your password!')
      return
    }

    setLoading(true)

    // Attempt Supabase sign in if configured
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data?.user) {
        setTrack(track)
        toast.success(
          language === 'vi'
            ? 'Đăng nhập thành công! Chào mừng bạn quay lại.'
            : 'Logged in successfully! Welcome back.'
        )
        router.push('/dashboard')
        return
      }
    } catch {
      // Fallback to local session
    }

    // Local state fallback
    login(email, '', track)
    setTrack(track)
    toast.success(
      language === 'vi'
        ? 'Đăng nhập thành công! Chào mừng bạn quay lại.'
        : 'Logged in successfully! Welcome back.'
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
              {t('login')} EngY
            </h1>
            <p className="text-xs text-gray-500">
              {language === 'vi'
                ? 'Tiếp tục hành trình chinh phục tiếng Anh TOEIC & Y khoa'
                : 'Continue your TOEIC & Medical English journey'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Choose Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">{t('chooseTrack')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTrack('toeic')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    track === 'toeic'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>TOEIC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTrack('medical')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    track === 'medical'
                      ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-purple-600" />
                  <span>Medical Y</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">{t('email')}</label>
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
              <label className="text-xs font-bold text-gray-700">{t('password')}</label>
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
              disabled={loading}
              className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? t('loading') : t('login')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer link */}
          <div className="text-center text-xs text-gray-500">
            <span>{t('noAccount')} </span>
            <Link href="/register" className="font-bold text-emerald-600 hover:underline">
              {language === 'vi' ? 'Đăng ký nhận 7 ngày Pro' : 'Register for 7-day Pro trial'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
