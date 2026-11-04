'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Stethoscope, Briefcase } from 'lucide-react'
import { useLanguageStore } from '@/lib/store'

export default function Footer() {
  const { language, t } = useLanguageStore()

  return (
    <footer className="bg-white border-t border-emerald-100/60 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-block group" title="EngY Home">
              <Image
                src="/EngYlogo.png"
                alt="EngY Logo"
                width={63}
                height={42}
                style={{ height: '42px', width: 'auto' }}
                className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              {language === 'vi'
                ? 'Nền tảng học tiếng Anh chuyên biệt cho người luyện thi TOEIC và sinh viên ngành Y khoa. Học thông minh qua minigames, ghi nhớ lâu bằng Spaced Repetition.'
                : 'Specialized English learning platform for TOEIC test-takers and Medical students. Learn through minigames and retain long-term with Spaced Repetition.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                <Briefcase className="w-3 h-3" /> TOEIC Track
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">
                <Stethoscope className="w-3 h-3" /> Medical Track
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              {language === 'vi' ? 'Tính Năng Chính' : 'Core Features'}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/lessons" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi' ? 'Khóa học TOEIC & Y khoa' : 'TOEIC & Medical Lessons'}
                </Link>
              </li>
              <li>
                <Link href="/exercises" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi' ? 'Kho bài tập & Luyện đề' : 'Exercises & Exam Drills'}
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi' ? 'Minigames củng cố kiến thức' : 'Reinforcement Minigames'}
                </Link>
              </li>
              <li>
                <Link href="/review" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi'
                    ? 'Ôn tập Spaced Repetition (SRS)'
                    : 'Spaced Repetition Review (SRS)'}
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi' ? 'Takenote & Sổ tay từ vựng' : 'Takenotes & Vocabulary Board'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscription info */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              {language === 'vi' ? 'Gói Học Tập' : 'Membership Plans'}
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/pricing" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi' ? 'Trải nghiệm Pro 7 ngày miễn phí' : 'Free 7-Day Pro Trial'}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi' ? 'Gói Free vĩnh viễn' : 'Free Forever Tier'}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-600 transition-colors">
                  {language === 'vi' ? 'Gói Pro trọn gói' : 'EngY Pro All-Access'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <p>© 2026 EngY Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for
            students & medical learners
          </p>
        </div>
      </div>
    </footer>
  )
}
