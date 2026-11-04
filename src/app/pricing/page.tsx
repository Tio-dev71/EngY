'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Crown,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import { toast } from 'sonner'

export default function PricingPage() {
  const { isPro, isTrialActive, getTrialDaysRemaining, upgradeToPro } = useAppStore()
  const { language, t } = useLanguageStore()
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const proStatus = mounted ? isPro() : false
  const trialActive = mounted ? isTrialActive() : false
  const trialDays = mounted ? getTrialDaysRemaining() : 7

  const handleUpgrade = () => {
    upgradeToPro()
    toast.success(
      language === 'vi'
        ? '🎉 Chúc mừng bạn đã nâng cấp thành công lên Gói Pro 1 năm!'
        : '🎉 Congratulations! You have successfully upgraded to 1-Year Pro Plan!'
    )
  }

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-12">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold border border-purple-200">
          <Crown className="w-3.5 h-3.5 text-purple-600" />
          <span>{language === 'vi' ? 'Gói Học Phù Hợp Mọi Nhu Cầu' : 'Flexible Learning Plans'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {language === 'vi'
            ? 'Nâng Tầm Tiếng Anh Với Gói EngY Pro'
            : 'Supercharge Your English with EngY Pro'}
        </h1>
        <p className="text-xs sm:text-base text-gray-500 leading-relaxed">
          {language === 'vi'
            ? 'Mở khóa toàn bộ kho từ vựng y khoa và TOEIC nâng cao, minigames không giới hạn và thuật toán ôn tập Spaced Repetition thông minh.'
            : 'Unlock the entire medical & TOEIC vocabulary bank, unlimited minigames, and smart Spaced Repetition algorithms.'}
        </p>
      </div>

      {/* ─── Active Trial Alert Banner ────────────────── */}
      {trialActive && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white shadow-lg shadow-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base">
                  {language === 'vi'
                    ? 'Gói Pro Dùng Thử 7 Ngày Đang Hoạt Động!'
                    : '7-Day Pro Trial is Currently Active!'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-orange-600 text-xs font-black">
                  {trialDays} {t('trialDaysLeft')}
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                {language === 'vi'
                  ? 'Bạn đang được sử dụng miễn phí toàn bộ tính năng Pro. Hãy tận dụng tối đa để học từ vựng nhé!'
                  : 'You have full access to all Pro features for free. Make the most of your learning journey!'}
              </p>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            className="px-5 py-2.5 rounded-xl bg-white text-orange-600 font-extrabold text-xs hover:bg-orange-50 transition-all shrink-0 shadow-xs"
          >
            {language === 'vi' ? 'Gia Hạn Pro Vĩnh Viễn' : 'Renew Pro 1 Year'}
          </button>
        </div>
      )}

      {/* ─── Plans Comparison Cards ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* FREE PLAN */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {language === 'vi' ? 'Cơ Bản' : 'Basic Tier'}
              </span>
              <h3 className="text-2xl font-black text-gray-900">{t('freePlan')}</h3>
              <p className="text-xs text-gray-500">
                {language === 'vi'
                  ? 'Dành cho người mới bắt đầu làm quen với phương pháp EngY'
                  : 'For learners starting out with the EngY method'}
              </p>
            </div>

            <div className="py-2">
              <span className="text-4xl font-black text-gray-900">0đ</span>
              <span className="text-xs text-gray-400 font-medium">
                {' '}
                / {language === 'vi' ? 'trọn đời' : 'forever'}
              </span>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Truy cập các bài học cơ bản miễn phí'
                    : 'Access to basic free lessons'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {language === 'vi'
                    ? '4 thể loại minigames thực hành'
                    : '4 interactive minigames'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Ghi chú Takenote tối đa 10 ghi chú'
                    : 'Limited to 10 takenotes'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <XCircle className="w-4 h-4 text-gray-300 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Không bao gồm bài học chuyên sâu Pro'
                    : 'No advanced Pro lessons'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400">
                <XCircle className="w-4 h-4 text-gray-300 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Không có thuật toán nhắc nhở Spaced Repetition thông minh'
                    : 'No smart Spaced Repetition scheduling'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <span className="block text-center text-xs font-bold text-gray-400 py-3 rounded-2xl bg-gray-50 border border-gray-100">
              {language === 'vi' ? 'Gói Mặc Định Của Bạn' : 'Your Default Plan'}
            </span>
          </div>
        </div>

        {/* PRO PLAN */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-50/60 via-pink-50/30 to-white border-2 border-purple-400 shadow-xl flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'KHUYÊN DÙNG' : 'RECOMMENDED'}</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                {language === 'vi' ? 'Cao Cấp (VIP)' : 'All-Access (VIP)'}
              </span>
              <h3 className="text-2xl font-black text-gray-900">{t('proPlan')}</h3>
              <p className="text-xs text-gray-500">
                {language === 'vi'
                  ? 'Tất cả tính năng cao cấp cho sinh viên Y và người thi TOEIC mục tiêu cao'
                  : 'All premium features for ambitious TOEIC and Medical learners'}
              </p>
            </div>

            <div className="py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-purple-900">39,000đ</span>
                <span className="text-xs text-gray-400 font-medium">
                  {' '}
                  / {language === 'vi' ? 'tháng' : 'month'}
                </span>
                <span className="text-[11px] font-extrabold text-purple-600 bg-purple-100/90 px-2 py-0.5 rounded-full border border-purple-200">
                  39k
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">
                ✨{' '}
                {language === 'vi'
                  ? 'Mới tạo tài khoản được tặng 7 ngày Pro dùng thử miễn phí'
                  : 'New accounts get 7 days of Pro trial for free'}
              </span>
            </div>

            <div className="space-y-3 pt-2 border-t border-purple-100 text-xs text-gray-700">
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Mở khóa 100% kho bài học TOEIC & Y khoa nâng cao'
                    : '100% unlock all advanced TOEIC & Medical lessons'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Không giới hạn số lượt chơi Minigames & nhân đôi XP'
                    : 'Unlimited minigame plays & 2x XP boost'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Thuật toán Spaced Repetition (SRS) nhắc nhở thông minh'
                    : 'Smart Spaced Repetition (SRS) automatic reminders'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Sổ tay Takenote không giới hạn, phân màu trực quan'
                    : 'Unlimited colorful sticky takenotes'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Phát âm audio chuẩn giọng bản xứ tốc độ cao'
                    : 'High-quality native AI audio pronunciation'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  {language === 'vi'
                    ? 'Hỗ trợ ưu tiên giải đáp thắc mắc chuyên ngành'
                    : 'Priority support for terminology questions'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {proStatus && !trialActive ? (
              <div className="text-center text-xs font-black text-emerald-700 py-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                ✓ {language === 'vi' ? 'Bạn Đang Là Thành Viên Pro' : 'You Are an Active Pro Member'}
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-black text-xs hover:shadow-lg hover:shadow-purple-200 hover:scale-102 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {trialActive
                    ? language === 'vi'
                      ? 'Nâng Cấp Gói Pro (Gia Hạn 1 Năm)'
                      : 'Upgrade to 1-Year Pro'
                    : t('upgradeToPro')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Trial Policy FAQ ─────────────────────────── */}
      <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-6">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          <span>
            {language === 'vi'
              ? 'Chính Sách Dùng Thử 7 Ngày Của EngY'
              : 'EngY 7-Day Pro Trial Policy & FAQ'}
          </span>
        </h3>

        <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-1">
              {language === 'vi'
                ? 'Làm thế nào để nhận 7 ngày dùng thử Pro?'
                : 'How do I claim my 7-day Pro trial?'}
            </h4>
            <p>
              {language === 'vi'
                ? 'Rất đơn giản! Bất kỳ tài khoản mới nào khi đăng ký thành công trên EngY đều được tự động kích hoạt 7 ngày trải nghiệm gói Pro mà không cần nhập thẻ thanh toán hay thực hiện thủ tục phức tạp nào.'
                : 'Simple! Every new account created on EngY automatically receives 7 days of full Pro access with no credit card or payment setup required.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-1">
              {language === 'vi'
                ? 'Sau 7 ngày hết hạn dùng thử thì sao?'
                : 'What happens after the 7-day trial expires?'}
            </h4>
            <p>
              {language === 'vi'
                ? 'Sau 7 ngày, tài khoản của bạn sẽ tự động chuyển về Gói Miễn Phí (Free). Toàn bộ dữ liệu ghi chú, điểm số minigame và tiến độ học tập đã đạt được của bạn vẫn được lưu giữ an toàn vĩnh viễn!'
                : 'After 7 days, your account seamlessly transitions to the Free tier. All your notes, game scores, and learning progress remain safely preserved forever!'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-1">
              {language === 'vi'
                ? 'Tôi có thể chuyển đổi giữa track TOEIC và Y khoa trong gói Pro không?'
                : 'Can I switch between TOEIC and Medical tracks on Pro?'}
            </h4>
            <p>
              {language === 'vi'
                ? 'Hoàn toàn được! Bạn có thể chuyển đổi qua lại giữa TOEIC và Tiếng Anh Y Khoa bất cứ lúc nào trên thanh điều hướng chỉ bằng 1 cú nhấp chuột.'
                : 'Absolutely! You can toggle between TOEIC and Medical English tracks anytime from the top navigation bar with a single click.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
