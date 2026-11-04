'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Sparkles,
  Flame,
  Globe,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Crown,
  BookOpen,
  Gamepad2,
  StickyNote,
  Repeat,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Settings,
  ShieldCheck,
  Check,
  FileCheck2,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { TrackType } from '@/types/database'
import VoiceSelector from './VoiceSelector'

export default function Navbar() {
  const pathname = usePathname()
  const { user, activeTrack, setTrack, logout, isPro, isTrialActive, getTrialDaysRemaining } =
    useAppStore()
  const { language, setLanguage, t } = useLanguageStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [trackDropdownOpen, setTrackDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const trackDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (trackDropdownRef.current && !trackDropdownRef.current.contains(target)) {
        setTrackDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const trialDays = mounted ? getTrialDaysRemaining() : 7
  const proActive = mounted ? isPro() : false
  const trialActive = mounted ? isTrialActive() : false

  // Navigation Links adapt based on auth state
  const navLinks = user
    ? [
        { href: '/dashboard', label: t('dashboard'), icon: BookOpen },
        { href: '/lessons', label: t('lessons'), icon: GraduationCap },
        { href: '/exercises', label: t('exercises'), icon: FileCheck2 },
        { href: '/games', label: t('games'), icon: Gamepad2 },
        { href: '/review', label: t('review'), icon: Repeat },
        { href: '/notes', label: t('notes'), icon: StickyNote },
      ]
    : [
        { href: '/lessons', label: t('lessons'), icon: GraduationCap },
        { href: '/exercises', label: t('exercises'), icon: FileCheck2 },
        { href: '/games', label: t('games'), icon: Gamepad2 },
        { href: '/pricing', label: t('pricing'), icon: Crown },
      ]

  const handleTrackChange = (newTrack: TrackType) => {
    setTrack(newTrack)
    setTrackDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100/60 shadow-xs">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* ─── Left Section: Logo & Track Switcher ─── */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {/* Logo */}
            <Link href="/" className="flex items-center group shrink-0 py-1" title="EngY Home">
              <Image
                src="/EngYlogo.png"
                alt="EngY Logo"
                width={57}
                height={38}
                style={{ height: '38px', width: 'auto' }}
                className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform shrink-0"
                priority
              />
            </Link>

            {/* Track Switcher (Desktop) */}
            <div className="relative shrink-0" ref={trackDropdownRef}>
              <button
                onClick={() => setTrackDropdownOpen(!trackDropdownOpen)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                  activeTrack === 'medical'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
                title="Đổi lộ trình học (TOEIC hoặc Tiếng Anh Y Khoa)"
              >
                {activeTrack === 'medical' ? (
                  <>
                    <Stethoscope className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>{language === 'vi' ? 'Y Khoa' : 'Medical Track'}</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{language === 'vi' ? 'TOEIC' : 'TOEIC Track'}</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {trackDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                    {t('chooseTrack')}
                  </div>
                  <button
                    onClick={() => handleTrackChange('toeic')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                      activeTrack === 'toeic'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">TOEIC Track</div>
                        <div className="text-[10px] text-gray-400 font-normal">
                          {language === 'vi' ? '4 kỹ năng & công sở' : '4 skills & business'}
                        </div>
                      </div>
                    </div>
                    {activeTrack === 'toeic' && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleTrackChange('medical')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors mt-1 ${
                      activeTrack === 'medical'
                        ? 'bg-purple-50 text-purple-800'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Medical Track</div>
                        <div className="text-[10px] text-gray-400 font-normal">
                          {language === 'vi' ? 'Y khoa & giải phẫu' : 'Clinical & Anatomy'}
                        </div>
                      </div>
                    </div>
                    {activeTrack === 'medical' && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Center Section: Navigation Links ─── */}
          <nav className="hidden lg:flex items-center gap-1 shrink min-w-0">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-2xs font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* ─── Right Section: User Controls & Stats ─── */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Pro Trial / Pro Badge */}
            {trialActive && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-2xs hover:scale-105 transition-transform whitespace-nowrap shrink-0"
                title={`${trialDays} ${t('trialDaysLeft')}`}
              >
                <Crown className="w-3 h-3 shrink-0" />
                <span>Pro ({trialDays}d)</span>
              </Link>
            )}

            {proActive && !trialActive && (
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xs whitespace-nowrap shrink-0"
              >
                <Crown className="w-3 h-3 shrink-0" />
                <span>PRO</span>
              </Link>
            )}

            {/* Streak & XP (Logged-in compact badges) */}
            {user && (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200/60 whitespace-nowrap shrink-0"
                  title={`${user.streak_days} ngày học liên tiếp`}
                >
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" />
                  <span>{user.streak_days}</span>
                </div>
                <div
                  className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200/60 whitespace-nowrap shrink-0"
                  title={`${user.xp_total} XP tích luỹ`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{user.xp_total} XP</span>
                </div>
              </div>
            )}

            {/* AI Voice Selector (Edge Neural / Google TTS) */}
            <VoiceSelector />

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0"
              title={t('switchLanguage')}
            >
              <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Admin Portal Quick Link */}
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
              title="Trung tâm Quản trị Admin (Thêm bài học & Đề thi TOEIC)"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </Link>

            {/* User Profile Dropdown or Login/Register Buttons */}
            {user ? (
              <div className="relative shrink-0" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-purple-400 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden xl:inline text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                    {user.full_name?.split(' ')?.[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                </button>

                {/* User Popover Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-2">
                      <div className="font-bold text-xs text-gray-900 truncate">
                        {user.full_name}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                      <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-gray-200/60">
                        <span className="font-semibold text-gray-600">
                          {activeTrack === 'medical' ? '🩺 Y Khoa' : '💼 TOEIC'}
                        </span>
                        <span className="font-bold text-emerald-600">{user.xp_total} XP</span>
                      </div>
                    </div>

                    {/* Quick Profile Nav Links */}
                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t('dashboard')}</span>
                      </Link>

                      <Link
                        href="/notes"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <StickyNote className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t('notes')}</span>
                      </Link>

                      <Link
                        href="/pricing"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <Crown className="w-3.5 h-3.5 text-purple-500" />
                        <span>{t('pricing')} (Pro)</span>
                      </Link>

                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Quản Trị Admin</span>
                      </Link>
                    </div>

                    <div className="my-1.5 border-t border-gray-100" />

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-xs !py-1.5 !px-3.5 shadow-xs whitespace-nowrap shrink-0"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Mobile Track Selector */}
          <div className="bg-gray-50 p-2.5 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">{t('chooseTrack')}:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTrackChange('toeic')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeTrack === 'toeic'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white text-gray-600 border'
                }`}
              >
                TOEIC
              </button>
              <button
                onClick={() => handleTrackChange('medical')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeTrack === 'medical'
                    ? 'bg-purple-500 text-white shadow-xs'
                    : 'bg-white text-gray-600 border'
                }`}
              >
                Medical Y
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200/70 hover:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Quản Trị Admin (Thêm Bài Học & Đề Thi)</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-indigo-400" />
            </Link>
          </div>

          {/* If Not Logged In, Mobile Login & Register Actions */}
          {!user && (
            <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl border border-gray-200 text-center font-bold text-xs text-gray-700 hover:bg-gray-50"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary !py-2.5 !px-3 text-center text-xs font-bold shadow-xs"
              >
                {t('register')}
              </Link>
            </div>
          )}

          {/* If Logged In, Mobile Stats */}
          {user && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <span>{user.streak_days} ngày</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{user.xp_total} XP</span>
                </span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  logout()
                }}
                className="text-red-500 font-bold hover:underline flex items-center gap-1 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
