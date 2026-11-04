'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Volume2, Check, Play, Sparkles, ChevronDown } from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import { playAudioText, type VoiceEngine } from '@/lib/audio'
import { toast } from 'sonner'

interface VoiceOption {
  id: VoiceEngine
  labelVi: string
  labelEn: string
  genderVi: string
  genderEn: string
  shortLabelVi: string
  shortLabelEn: string
  provider: 'Microsoft Edge' | 'Google' | 'Browser'
  badgeVi: string
  badgeEn: string
  badgeColor: string
  sampleVi: string
  sampleEn: string
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'edge_jenny',
    labelVi: 'Edge Jenny (Nữ)',
    labelEn: 'Edge Jenny (Female)',
    genderVi: 'Nữ • Mỹ',
    genderEn: 'Female • US',
    shortLabelVi: 'Jenny (Nữ)',
    shortLabelEn: 'Jenny (Female)',
    provider: 'Microsoft Edge',
    badgeVi: 'Khuyên dùng • Tự nhiên',
    badgeEn: 'Recommended • Natural',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sampleVi: 'Chào mừng bạn đến với EngY! Học từ vựng TOEIC và Y khoa với giọng phát âm tự nhiên.',
    sampleEn: 'Welcome to EngY! Master TOEIC and Medical English with natural pronunciation.',
  },
  {
    id: 'edge_guy',
    labelVi: 'Edge Guy (Nam)',
    labelEn: 'Edge Guy (Male)',
    genderVi: 'Nam • Mỹ',
    genderEn: 'Male • US',
    shortLabelVi: 'Guy (Nam)',
    shortLabelEn: 'Guy (Male)',
    provider: 'Microsoft Edge',
    badgeVi: 'Chuẩn bản xứ',
    badgeEn: 'Native US Accent',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    sampleVi: 'Chào mừng bạn đến với EngY! Học từ vựng TOEIC và Y khoa với giọng phát âm tự nhiên.',
    sampleEn: 'Welcome to EngY! Master TOEIC and Medical English with natural pronunciation.',
  },
  {
    id: 'google',
    labelVi: 'Google TTS',
    labelEn: 'Google TTS',
    genderVi: 'Chuẩn quốc tế',
    genderEn: 'International US',
    shortLabelVi: 'Google',
    shortLabelEn: 'Google',
    provider: 'Google',
    badgeVi: 'Miễn phí • Rõ ràng',
    badgeEn: 'Free • Clear',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    sampleVi: 'Chào mừng bạn đến với EngY! Học từ vựng TOEIC và Y khoa với giọng phát âm tự nhiên.',
    sampleEn: 'Welcome to EngY! Master TOEIC and Medical English with natural pronunciation.',
  },
  {
    id: 'native',
    labelVi: 'Giọng Thiết Bị',
    labelEn: 'Device Native',
    genderVi: 'Web Speech',
    genderEn: 'Web Speech',
    shortLabelVi: 'Thiết bị',
    shortLabelEn: 'Browser',
    provider: 'Browser',
    badgeVi: 'Hỗ trợ Offline',
    badgeEn: 'Offline Support',
    badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
    sampleVi: 'Chào mừng bạn đến với EngY! Học từ vựng TOEIC và Y khoa với giọng phát âm tự nhiên.',
    sampleEn: 'Welcome to EngY! Master TOEIC and Medical English with natural pronunciation.',
  },
]

export default function VoiceSelector() {
  const { voiceEngine, setVoiceEngine } = useAppStore()
  const { language } = useLanguageStore()
  const [isOpen, setIsOpen] = useState(false)
  const [previewingId, setPreviewingId] = useState<VoiceEngine | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentOption = VOICE_OPTIONS.find((v) => v.id === voiceEngine) || VOICE_OPTIONS[0]
  const currentLabel = language === 'vi' ? currentOption.labelVi : currentOption.labelEn
  const currentShort = language === 'vi' ? currentOption.shortLabelVi : currentOption.shortLabelEn

  const handleSelect = (engine: VoiceEngine) => {
    setVoiceEngine(engine)
    const selected = VOICE_OPTIONS.find((v) => v.id === engine)
    const label = selected
      ? language === 'vi'
        ? selected.labelVi
        : selected.labelEn
      : engine
    const msg =
      language === 'vi'
        ? `Đã chuyển sang giọng đọc: ${label}`
        : `Switched voice to: ${label}`
    toast.success(msg)
  }

  const handlePreview = (e: React.MouseEvent, option: VoiceOption) => {
    e.stopPropagation()
    setPreviewingId(option.id)
    const sampleText = language === 'vi' ? option.sampleVi : option.sampleEn
    playAudioText(sampleText, {
      voiceEngine: option.id,
      onStart: () => setPreviewingId(option.id),
      onEnd: () => setPreviewingId(null),
      onError: () => setPreviewingId(null),
    })
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-purple-200/80 bg-purple-50/70 hover:bg-purple-100/70 text-purple-700 text-xs font-semibold transition-all shadow-2xs hover:scale-[1.02] whitespace-nowrap shrink-0"
        title={
          language === 'vi'
            ? 'Chọn giọng đọc phát âm (Edge Neural / Google TTS miễn phí)'
            : 'Select pronunciation voice (Free Edge Neural / Google TTS)'
        }
      >
        <Volume2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span className="hidden xl:inline">{currentLabel}</span>
        <span className="hidden sm:inline xl:hidden">{currentShort}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 backdrop-blur-xl border border-purple-100 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1.5 mb-2 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{language === 'vi' ? 'Cài đặt giọng phát âm AI' : 'AI Voice Settings'}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {language === 'vi' ? '100% Miễn Phí' : '100% Free'}
            </span>
          </div>

          <p className="px-2 text-[11px] text-gray-500 mb-2 leading-tight">
            {language === 'vi'
              ? 'Sử dụng công nghệ AI Neural TTS miễn phí từ Microsoft Edge & Google mang đến phát âm tự nhiên nhất:'
              : 'Powered by free AI Neural TTS from Microsoft Edge & Google for lifelike pronunciation:'}
          </p>

          <div className="space-y-1.5">
            {VOICE_OPTIONS.map((option) => {
              const isSelected = voiceEngine === option.id
              const isPlaying = previewingId === option.id
              const label = language === 'vi' ? option.labelVi : option.labelEn
              const badge = language === 'vi' ? option.badgeVi : option.badgeEn
              const gender = language === 'vi' ? option.genderVi : option.genderEn

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-purple-50/80 border-purple-300 shadow-2xs'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {label}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${option.badgeColor}`}
                        >
                          {badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {gender} • {option.provider}
                      </div>
                    </div>
                  </div>

                  {/* Preview Play Button */}
                  <button
                    onClick={(e) => handlePreview(e, option)}
                    className={`p-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 shrink-0 transition-all ${
                      isPlaying
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-105'
                        : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                    title={language === 'vi' ? 'Nghe thử giọng này' : 'Preview this voice'}
                  >
                    <Play className={`w-3 h-3 ${isPlaying ? 'fill-white' : ''}`} />
                    <span className="text-[10px]">{language === 'vi' ? 'Thử' : 'Test'}</span>
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 px-2 flex items-center justify-between text-[10px] text-gray-400">
            <span>
              {language === 'vi' ? '✨ Không tốn phí API key' : '✨ 100% Free, no API key needed'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-600 hover:text-purple-700 font-bold"
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
