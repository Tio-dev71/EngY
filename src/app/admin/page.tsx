'use client'

import React, { useState, useId } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Plus,
  BookOpen,
  Layers,
  FileText,
  MessageSquare,
  FileCheck2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Filter,
  Eye,
  Settings,
  ArrowLeft,
  X,
  Play,
  RotateCcw,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type {
  TrackType,
  DifficultyLevel,
  CollocationType,
  Lesson,
  Vocabulary,
  Collocation,
  GrammarPoint,
  SentencePattern,
  ToeicExamTest,
  ToeicQuestion,
} from '@/types/database'
import { toast } from 'sonner'
import { playCorrectSound, playWrongSound, playVictorySound, fireConfetti } from '@/lib/soundEffects'

type AdminTab = 'overview' | 'add_content' | 'manage_lessons' | 'toeic_exams'
type ContentType = 'vocab' | 'collocation' | 'grammar' | 'pattern'

export default function AdminPage() {
  const {
    getAllLessons,
    getAllVocabularies,
    getAllCollocations,
    getAllGrammarPoints,
    getAllSentencePatterns,
    getAllToeicExams,
    addCustomLesson,
    addCustomVocabulary,
    addCustomCollocation,
    addCustomGrammarPoint,
    addCustomSentencePattern,
    addCustomToeicExam,
    deleteCustomItem,
    customLessons,
    customVocabularies,
    customCollocations,
    customGrammarPoints,
    customSentencePatterns,
    customToeicExams,
    activeTrack,
    setTrack,
  } = useAppStore()

  const { language, t } = useLanguageStore()
  const [adminTab, setAdminTab] = useState<AdminTab>('overview')

  const lessons = getAllLessons()
  const vocabularies = getAllVocabularies()
  const collocations = getAllCollocations()
  const grammarPoints = getAllGrammarPoints()
  const sentencePatterns = getAllSentencePatterns()
  const toeicExams = getAllToeicExams()

  // ─── Add Content Form State ─────────────────────────
  const [contentType, setContentType] = useState<ContentType>('vocab')
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || 'toeic-01')
  const [targetTrack, setTargetTrack] = useState<TrackType>('toeic')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate')

  // Vocabulary fields
  const [word, setWord] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('noun')
  const [meaningVi, setMeaningVi] = useState('')
  const [meaningEn, setMeaningEn] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')
  const [exampleTranslation, setExampleTranslation] = useState('')

  // Collocation fields
  const [phrase, setPhrase] = useState('')
  const [collocationType, setCollocationType] = useState<CollocationType>('noun_phrase')
  const [usageTip, setUsageTip] = useState('')

  // Grammar fields
  const [grammarTitleVi, setGrammarTitleVi] = useState('')
  const [grammarTitleEn, setGrammarTitleEn] = useState('')
  const [formula, setFormula] = useState('')
  const [ruleSummary, setRuleSummary] = useState('')
  const [explanationVi, setExplanationVi] = useState('')
  const [grammarExampleEn, setGrammarExampleEn] = useState('')
  const [grammarExampleVi, setGrammarExampleVi] = useState('')
  const [commonMistake, setCommonMistake] = useState('')
  const [examTip, setExamTip] = useState('')

  // Sentence Pattern fields
  const [pattern, setPattern] = useState('')
  const [patternContext, setPatternContext] = useState('Email công sở')
  const [patternExEn, setPatternExEn] = useState('')
  const [patternExVi, setPatternExVi] = useState('')

  // ─── Add Lesson Form State ──────────────────────────
  const [showAddLessonModal, setShowAddLessonModal] = useState(false)
  const [newLessonTitleVi, setNewLessonTitleVi] = useState('')
  const [newLessonTitleEn, setNewLessonTitleEn] = useState('')
  const [newLessonDescVi, setNewLessonDescVi] = useState('')
  const [newLessonDescEn, setNewLessonDescEn] = useState('')
  const [newLessonIcon, setNewLessonIcon] = useState('📚')
  const [newLessonMin, setNewLessonMin] = useState(15)
  const [newLessonXP, setNewLessonXP] = useState(75)

  // ─── Add TOEIC Exam Form State ──────────────────────
  const [showAddExamModal, setShowAddExamModal] = useState(false)
  const [examTitle, setExamTitle] = useState('')
  const [examDesc, setExamDesc] = useState('')
  const [examTargetScore, setExamTargetScore] = useState('750+')
  const [examEdition, setExamEdition] = useState('ETS TOEIC 2024')
  const [examTimeLimit, setExamTimeLimit] = useState(15)

  // ─── Add Question to Exam Modal State ───────────────
  const [activeExamForQuestion, setActiveExamForQuestion] = useState<ToeicExamTest | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [questionPart, setQuestionPart] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(5)
  const [optA, setOptA] = useState('')
  const [optB, setOptB] = useState('')
  const [optC, setOptC] = useState('')
  const [optD, setOptD] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A')
  const [explanation, setExplanation] = useState('')
  const [grammarTag, setGrammarTag] = useState('')

  // ─── Exam Testing Runner State ──────────────────────
  const [activeTestExam, setActiveTestExam] = useState<ToeicExamTest | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})
  const [isTestSubmitted, setIsTestSubmitted] = useState(false)

  // Submit Content Form
  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault()

    if (contentType === 'vocab') {
      if (!word || !meaningVi) {
        toast.error('Vui lòng nhập từ vựng và nghĩa tiếng Việt!')
        return
      }
      const newVocab: Vocabulary = {
        id: 'custom-vocab-' + Date.now(),
        lesson_id: selectedLessonId,
        word: word.trim(),
        phonetic: phonetic.trim() || '/.../',
        meaning_vi: meaningVi.trim(),
        meaning_en: meaningEn.trim() || meaningVi.trim(),
        example_sentence: exampleSentence.trim() || `Example sentence for ${word}.`,
        example_translation: exampleTranslation.trim() || `Bản dịch cho ${word}.`,
        part_of_speech: partOfSpeech,
        audio_url: null,
        image_url: null,
        difficulty,
        track_type: targetTrack,
        created_at: new Date().toISOString(),
      }
      addCustomVocabulary(newVocab)
      toast.success(`Đã thêm từ vựng "${word}" thành công!`)
      setWord('')
      setPhonetic('')
      setMeaningVi('')
      setMeaningEn('')
      setExampleSentence('')
      setExampleTranslation('')
    } else if (contentType === 'collocation') {
      if (!phrase || !meaningVi) {
        toast.error('Vui lòng nhập cụm từ và nghĩa!')
        return
      }
      const newColloc: Collocation = {
        id: 'custom-colloc-' + Date.now(),
        lesson_id: selectedLessonId,
        phrase: phrase.trim(),
        type: collocationType,
        meaning_vi: meaningVi.trim(),
        meaning_en: meaningEn.trim() || meaningVi.trim(),
        example_sentence: exampleSentence.trim() || `Context for ${phrase}.`,
        example_translation: exampleTranslation.trim() || `Bản dịch cho ${phrase}.`,
        usage_tip: usageTip.trim() || undefined,
        difficulty,
        track_type: targetTrack,
        created_at: new Date().toISOString(),
      }
      addCustomCollocation(newColloc)
      toast.success(`Đã thêm cụm từ "${phrase}" thành công!`)
      setPhrase('')
      setMeaningVi('')
      setMeaningEn('')
      setExampleSentence('')
      setExampleTranslation('')
      setUsageTip('')
    } else if (contentType === 'grammar') {
      if (!grammarTitleVi || !formula) {
        toast.error('Vui lòng nhập tiêu đề ngữ pháp và công thức!')
        return
      }
      const newGrammar: GrammarPoint = {
        id: 'custom-gram-' + Date.now(),
        lesson_id: selectedLessonId,
        title_vi: grammarTitleVi.trim(),
        title_en: grammarTitleEn.trim() || grammarTitleVi.trim(),
        rule_summary_vi: ruleSummary.trim() || grammarTitleVi.trim(),
        formula: formula.trim(),
        explanation_vi: explanationVi.trim() || ruleSummary.trim(),
        examples: [
          {
            sentence: grammarExampleEn.trim() || 'Example sentence demonstrating this rule.',
            translation: grammarExampleVi.trim() || 'Câu ví dụ minh họa quy tắc.',
            highlight: 'Quy tắc áp dụng',
          },
        ],
        common_mistakes: commonMistake.trim() || undefined,
        toeic_tip: examTip.trim() || undefined,
        difficulty,
        track_type: targetTrack,
        created_at: new Date().toISOString(),
      }
      addCustomGrammarPoint(newGrammar)
      toast.success(`Đã thêm chủ điểm ngữ pháp "${grammarTitleVi}" thành công!`)
      setGrammarTitleVi('')
      setGrammarTitleEn('')
      setFormula('')
      setRuleSummary('')
      setExplanationVi('')
      setGrammarExampleEn('')
      setGrammarExampleVi('')
      setCommonMistake('')
      setExamTip('')
    } else if (contentType === 'pattern') {
      if (!pattern || !meaningVi) {
        toast.error('Vui lòng nhập mẫu câu và nghĩa!')
        return
      }
      const newPattern: SentencePattern = {
        id: 'custom-pat-' + Date.now(),
        lesson_id: selectedLessonId,
        pattern: pattern.trim(),
        meaning_vi: meaningVi.trim(),
        context: patternContext.trim(),
        examples: [
          {
            en: patternExEn.trim() || pattern.trim(),
            vi: patternExVi.trim() || meaningVi.trim(),
          },
        ],
        difficulty,
        track_type: targetTrack,
        created_at: new Date().toISOString(),
      }
      addCustomSentencePattern(newPattern)
      toast.success(`Đã thêm mẫu câu "${pattern}" thành công!`)
      setPattern('')
      setMeaningVi('')
      setPatternExEn('')
      setPatternExVi('')
    }
  }

  // Create New Lesson
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLessonTitleVi) {
      toast.error('Vui lòng nhập tiêu đề bài học!')
      return
    }

    const newLesson: Lesson = {
      id: `${targetTrack}-custom-${Date.now()}`,
      track_type: targetTrack,
      title_vi: newLessonTitleVi.trim(),
      title_en: newLessonTitleEn.trim() || newLessonTitleVi.trim(),
      description_vi: newLessonDescVi.trim() || 'Tài liệu học tập bổ sung',
      description_en: newLessonDescEn.trim() || 'Supplementary learning material',
      difficulty,
      order_index: lessons.length + 1,
      is_pro: false,
      xp_reward: Number(newLessonXP) || 75,
      estimated_minutes: Number(newLessonMin) || 15,
      icon: newLessonIcon || '📚',
      created_at: new Date().toISOString(),
    }

    addCustomLesson(newLesson)
    toast.success(`Đã tạo bài học mới "${newLessonTitleVi}"!`)
    setShowAddLessonModal(false)
    setNewLessonTitleVi('')
    setNewLessonTitleEn('')
    setNewLessonDescVi('')
    setNewLessonDescEn('')
  }

  // Create New TOEIC Exam
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!examTitle) {
      toast.error('Vui lòng nhập tên đề thi!')
      return
    }

    const newExam: ToeicExamTest = {
      id: 'toeic-exam-' + Date.now(),
      title: examTitle.trim(),
      description_vi: examDesc.trim() || 'Đề thi thử TOEIC chuẩn format',
      target_score: examTargetScore,
      year_edition: examEdition,
      total_questions: 0,
      time_limit_minutes: Number(examTimeLimit) || 15,
      parts_included: [5],
      questions: [],
      created_at: new Date().toISOString(),
    }

    addCustomToeicExam(newExam)
    toast.success(`Đã tạo bộ đề thi "${examTitle}"! Bạn có thể thêm câu hỏi ngay.`)
    setShowAddExamModal(false)
    setExamTitle('')
    setExamDesc('')
  }

  // Add Question to active exam
  const handleAddQuestionToExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeExamForQuestion) return
    if (!questionText || !optA || !optB || !optC || !optD) {
      toast.error('Vui lòng nhập đủ câu hỏi và 4 đáp án A, B, C, D!')
      return
    }

    const newQuestion: ToeicQuestion = {
      id: 'q-' + Date.now(),
      part: questionPart,
      question_text: questionText.trim(),
      options: [
        { key: 'A', text: optA.trim() },
        { key: 'B', text: optB.trim() },
        { key: 'C', text: optC.trim() },
        { key: 'D', text: optD.trim() },
      ],
      correct_answer: correctAnswer,
      explanation_vi: explanation.trim() || 'Giải thích chi tiết đáp án.',
      grammar_or_vocab_tag: grammarTag.trim() || 'TOEIC Part 5',
    }

    const updatedExam: ToeicExamTest = {
      ...activeExamForQuestion,
      total_questions: activeExamForQuestion.questions.length + 1,
      questions: [...activeExamForQuestion.questions, newQuestion],
    }

    addCustomToeicExam(updatedExam)
    setActiveExamForQuestion(updatedExam)
    toast.success('Đã thêm câu hỏi mới vào đề thi!')
    setQuestionText('')
    setOptA('')
    setOptB('')
    setOptC('')
    setOptD('')
    setExplanation('')
    setGrammarTag('')
  }

  // Calculate score for practice mode
  const handleCalculateScore = () => {
    if (!activeTestExam) return
    setIsTestSubmitted(true)
    let correct = 0
    activeTestExam.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_answer) {
        correct++
      }
    })
    if (correct === activeTestExam.questions.length) {
      playVictorySound()
      fireConfetti()
    } else if (correct > 0) {
      playCorrectSound()
    } else {
      playWrongSound()
    }
    toast.success(`Bạn đạt ${correct}/${activeTestExam.questions.length} câu đúng!`)
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
      {/* ─── Admin Header & Badge ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Trung Tâm Quản Trị Hệ Thống (EngY Admin Domain)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Quản Lý Tài Liệu, Bài Học & Đề Thi TOEIC
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Thêm từ vựng, cụm danh từ/tính từ, quy tắc ngữ pháp, cấu trúc câu và tạo đề thi thử TOEIC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/lessons"
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem Giao Diện Học Viên</span>
          </Link>
          <button
            onClick={() => setShowAddLessonModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bài Học Mới</span>
          </button>
        </div>
      </div>

      {/* ─── Metric Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase">Bài học</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{lessons.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">TOEIC & Y Khoa</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <FileText className="w-4 h-4 text-teal-500" />
            <span className="text-[10px] font-bold uppercase">Từ vựng</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{vocabularies.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Kèm phát âm TTS</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <Layers className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-bold uppercase">Cụm từ</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{collocations.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Noun/Adj Phrases</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <Award className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-bold uppercase">Ngữ pháp</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{grammarPoints.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Công thức & Mẹo</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold uppercase">Mẫu câu</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{sentencePatterns.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Email & Hội thoại</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase">Đề thi TOEIC</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{toeicExams.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Format ETS chuẩn</div>
        </div>
      </div>

      {/* ─── Admin Navigation Tabs ───────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 border border-gray-200 overflow-x-auto">
        <button
          onClick={() => setAdminTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            adminTab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Tổng Quan Tài Liệu</span>
        </button>

        <button
          onClick={() => setAdminTab('add_content')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            adminTab === 'add_content'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plus className="w-4 h-4 text-purple-600" />
          <span>Thêm Nội Dung Mới</span>
        </button>

        <button
          onClick={() => setAdminTab('manage_lessons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            adminTab === 'manage_lessons'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Quản Lý Bài Học ({lessons.length})</span>
        </button>

        <button
          id="toeic-exams"
          onClick={() => setAdminTab('toeic_exams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            adminTab === 'toeic_exams'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-indigo-600" />
          <span>Kho Đề Thi Thử TOEIC ({toeicExams.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: OVERVIEW & INVENTORY ─────────────── */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TOEIC Summary */}
            <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💼</span>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">Lộ Trình TOEIC</h3>
                    <p className="text-xs text-gray-500">Tiếng Anh Giao Tiếp & Thi Chứng Chỉ</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {lessons.filter((l) => l.track_type === 'toeic').length} Bài học
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Từ vựng thương mại & công sở:</span>
                  <span className="font-bold text-gray-900">
                    {vocabularies.filter((v) => v.track_type === 'toeic').length} từ
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Cụm danh từ / tính từ / Collocations:</span>
                  <span className="font-bold text-purple-700">
                    {collocations.filter((c) => c.track_type === 'toeic').length} cụm
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Chủ điểm ngữ pháp & Bẫy Part 5:</span>
                  <span className="font-bold text-blue-700">
                    {grammarPoints.filter((g) => g.track_type === 'toeic').length} chủ điểm
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Cấu trúc câu viết email & đàm phán:</span>
                  <span className="font-bold text-amber-700">
                    {sentencePatterns.filter((p) => p.track_type === 'toeic').length} mẫu câu
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Đề thi thử TOEIC Actual Test:</span>
                  <span className="font-bold text-indigo-700">{toeicExams.length} bộ đề</span>
                </div>
              </div>
            </div>

            {/* Medical Summary */}
            <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🩺</span>
                  <div>
                    <h3 className="font-bold text-base text-gray-900">Lộ Trình Y Khoa</h3>
                    <p className="text-xs text-gray-500">Tiếng Anh Chuyên Ngành Y - Dược</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                  {lessons.filter((l) => l.track_type === 'medical').length} Bài học
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Thuật ngữ y khoa chuyên biệt:</span>
                  <span className="font-bold text-gray-900">
                    {vocabularies.filter((v) => v.track_type === 'medical').length} thuật ngữ
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Cụm từ lâm sàng & Hồ sơ bệnh án:</span>
                  <span className="font-bold text-purple-700">
                    {collocations.filter((c) => c.track_type === 'medical').length} cụm
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Ngữ pháp bị động & Y văn khách quan:</span>
                  <span className="font-bold text-blue-700">
                    {grammarPoints.filter((g) => g.track_type === 'medical').length} chủ điểm
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Mẫu câu thăm khám & Dặn dò thuốc:</span>
                  <span className="font-bold text-amber-700">
                    {sentencePatterns.filter((p) => p.track_type === 'medical').length} mẫu câu
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Cập nhật mới từ admin:</span>
                  <span className="font-bold text-emerald-700">
                    {customVocabularies.length +
                      customCollocations.length +
                      customGrammarPoints.length}{' '}
                    mục
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-purple-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-base text-gray-900">
                Sẵn Sàng Thêm Tài Liệu Mới Hoặc Đề Thi?
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Admin có thể thêm nhanh từ vựng, các cụm từ collocations, bài học mới hoặc tạo đề
                thi TOEIC trực tiếp ngay bên dưới.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAdminTab('add_content')}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm"
              >
                + Thêm Nội Dung
              </button>
              <button
                onClick={() => setAdminTab('toeic_exams')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
              >
                + Soạn Đề Thi TOEIC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: ADD CONTENT FORM ────────────────── */}
      {adminTab === 'add_content' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-gray-900">Thêm Nội Dung Học Mới Vào Hệ Thống</h2>
            <p className="text-xs text-gray-500 mt-1">
              Chọn loại nội dung cần thêm: Từ vựng, Cụm từ (Collocations), Ngữ pháp hoặc Cấu trúc
              câu
            </p>
          </div>

          {/* Content Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setContentType('vocab')}
              className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                contentType === 'vocab'
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>1. Từ Vựng Mới</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('collocation')}
              className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                contentType === 'collocation'
                  ? 'border-purple-500 bg-purple-50/70 text-purple-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-5 h-5 text-purple-600" />
              <span>2. Cụm Danh/Tính Từ</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('grammar')}
              className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                contentType === 'grammar'
                  ? 'border-blue-500 bg-blue-50/70 text-blue-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <span>3. Ngữ Pháp & Công Thức</span>
            </button>

            <button
              type="button"
              onClick={() => setContentType('pattern')}
              className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                contentType === 'pattern'
                  ? 'border-amber-500 bg-amber-50/70 text-amber-800 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <span>4. Mẫu Câu Thực Tế</span>
            </button>
          </div>

          <form onSubmit={handleAddContent} className="space-y-5 pt-2">
            {/* Common fields: Track & Lesson */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Lộ Trình:</label>
                <select
                  value={targetTrack}
                  onChange={(e) => setTargetTrack(e.target.value as TrackType)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none"
                >
                  <option value="toeic">💼 TOEIC Track</option>
                  <option value="medical">🩺 Medical (Y Khoa) Track</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Gán Vào Bài Học:
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none"
                >
                  {lessons
                    .filter((l) => l.track_type === targetTrack)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.icon} {l.title_vi} ({l.title_en})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Độ Khó:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none"
                >
                  <option value="beginner">Cơ bản (Beginner)</option>
                  <option value="intermediate">Trung cấp (Intermediate)</option>
                  <option value="advanced">Nâng cao (Advanced)</option>
                </select>
              </div>
            </div>

            {/* 1. VOCABULARY FIELDS */}
            {contentType === 'vocab' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Từ vựng (English Word)*:
                    </label>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder="e.g. prescription"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Phiên âm (Phonetic):
                    </label>
                    <input
                      type="text"
                      value={phonetic}
                      onChange={(e) => setPhonetic(e.target.value)}
                      placeholder="e.g. /prɪˈskrɪpʃn/"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Từ loại:</label>
                    <select
                      value={partOfSpeech}
                      onChange={(e) => setPartOfSpeech(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-400 bg-white"
                    >
                      <option value="noun">Danh từ (Noun)</option>
                      <option value="verb">Động từ (Verb)</option>
                      <option value="adjective">Tính từ (Adjective)</option>
                      <option value="adverb">Trạng từ (Adverb)</option>
                      <option value="preposition">Giới từ (Preposition)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nghĩa Tiếng Việt*:
                    </label>
                    <input
                      type="text"
                      value={meaningVi}
                      onChange={(e) => setMeaningVi(e.target.value)}
                      placeholder="e.g. đơn thuốc, toa thuốc"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Nghĩa Tiếng Anh (Definition):
                    </label>
                    <input
                      type="text"
                      value={meaningEn}
                      onChange={(e) => setMeaningEn(e.target.value)}
                      placeholder="e.g. an instruction written by a doctor for medical treatment"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Câu Ví Dụ (English Sentence):
                    </label>
                    <input
                      type="text"
                      value={exampleSentence}
                      onChange={(e) => setExampleSentence(e.target.value)}
                      placeholder="e.g. The doctor gave me a prescription for painkillers."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Dịch Câu Ví Dụ (Vietnamese Translation):
                    </label>
                    <input
                      type="text"
                      value={exampleTranslation}
                      onChange={(e) => setExampleTranslation(e.target.value)}
                      placeholder="e.g. Bác sĩ đã kê cho tôi một đơn thuốc giảm đau."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. COLLOCATION FIELDS */}
            {contentType === 'collocation' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Cụm Từ / Cụm Danh Từ (Collocation)*:
                    </label>
                    <input
                      type="text"
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      placeholder="e.g. adverse drug reaction hoặc board of directors"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Loại cụm từ:
                    </label>
                    <select
                      value={collocationType}
                      onChange={(e) => setCollocationType(e.target.value as CollocationType)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-400 bg-white"
                    >
                      <option value="noun_phrase">Cụm Danh Từ (Noun Phrase)</option>
                      <option value="adjective_phrase">Cụm Tính Từ (Adjective Phrase)</option>
                      <option value="verb_phrase">Cụm Động Từ (Verb Phrase / Collocation)</option>
                      <option value="prepositional_phrase">Cụm Giới Từ (Prepositional Phrase)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ý Nghĩa Tiếng Việt*:
                    </label>
                    <input
                      type="text"
                      value={meaningVi}
                      onChange={(e) => setMeaningVi(e.target.value)}
                      placeholder="e.g. phản ứng bất lợi của thuốc"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ý Nghĩa Tiếng Anh:
                    </label>
                    <input
                      type="text"
                      value={meaningEn}
                      onChange={(e) => setMeaningEn(e.target.value)}
                      placeholder="e.g. an unwanted reaction caused by administration of drugs"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Câu Ví Dụ Thực Tế:
                    </label>
                    <input
                      type="text"
                      value={exampleSentence}
                      onChange={(e) => setExampleSentence(e.target.value)}
                      placeholder="e.g. Always check if the patient has a history of adverse reactions."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Dịch Nghĩa Câu Ví Dụ:
                    </label>
                    <input
                      type="text"
                      value={exampleTranslation}
                      onChange={(e) => setExampleTranslation(e.target.value)}
                      placeholder="e.g. Luôn kiểm tra xem bệnh nhân có tiền sử phản ứng bất lợi hay không."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mẹo Dùng / Bẫy Đề Thi:
                  </label>
                  <input
                    type="text"
                    value={usageTip}
                    onChange={(e) => setUsageTip(e.target.value)}
                    placeholder="e.g. Thường đi với động từ report, monitor, hoặc viết tắt là ADR"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            )}

            {/* 3. GRAMMAR FIELDS */}
            {contentType === 'grammar' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tiêu Đề Ngữ Pháp (Tiếng Việt)*:
                    </label>
                    <input
                      type="text"
                      value={grammarTitleVi}
                      onChange={(e) => setGrammarTitleVi(e.target.value)}
                      placeholder="e.g. Thể Giả Định Trong Mệnh Đề That"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tiêu Đề Tiếng Anh:
                    </label>
                    <input
                      type="text"
                      value={grammarTitleEn}
                      onChange={(e) => setGrammarTitleEn(e.target.value)}
                      placeholder="e.g. Subjunctive Mood in That-Clauses"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Công Thức / Cấu Trúc Trọng Tâm (Formula)*:
                  </label>
                  <input
                    type="text"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    placeholder="e.g. S1 + recommend/request + that + S2 + (should) + V_bare"
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 text-xs font-mono font-bold text-blue-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tóm Tắt Quy Tắc (Rule Summary):
                    </label>
                    <textarea
                      rows={2}
                      value={ruleSummary}
                      onChange={(e) => setRuleSummary(e.target.value)}
                      placeholder="e.g. Động từ trong mệnh đề that luôn ở dạng nguyên thể không to..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Giải Thích Chi Tiết:
                    </label>
                    <textarea
                      rows={2}
                      value={explanationVi}
                      onChange={(e) => setExplanationVi(e.target.value)}
                      placeholder="e.g. Kể cả khi chủ ngữ là số ít he/she/the manager, động từ vẫn không thêm s..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Câu Ví Dụ Tiếng Anh:
                    </label>
                    <input
                      type="text"
                      value={grammarExampleEn}
                      onChange={(e) => setGrammarExampleEn(e.target.value)}
                      placeholder="e.g. The CEO suggested that Mr. Nam submit the report on time."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Dịch Câu Ví Dụ:
                    </label>
                    <input
                      type="text"
                      value={grammarExampleVi}
                      onChange={(e) => setGrammarExampleVi(e.target.value)}
                      placeholder="e.g. Tổng giám đốc gợi ý rằng anh Nam nộp báo cáo đúng hạn."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Lỗi Sai Thường Gặp (Common Mistakes):
                    </label>
                    <input
                      type="text"
                      value={commonMistake}
                      onChange={(e) => setCommonMistake(e.target.value)}
                      placeholder="e.g. Nhầm lẫn thêm s/es vào động từ sau that"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mẹo Giải Nhanh Đề Thi / Lâm Sàng:
                    </label>
                    <input
                      type="text"
                      value={examTip}
                      onChange={(e) => setExamTip(e.target.value)}
                      placeholder="e.g. Thấy recommend/request that -> chọn ngay V nguyên mẫu"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. SENTENCE PATTERN FIELDS */}
            {contentType === 'pattern' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mẫu Cấu Trúc (Sentence Pattern)*:
                    </label>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="e.g. I am writing to inquire about [Noun/V-ing]..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ngữ Cảnh Ứng Dụng:
                    </label>
                    <input
                      type="text"
                      value={patternContext}
                      onChange={(e) => setPatternContext(e.target.value)}
                      placeholder="e.g. Email công sở, Khám bệnh, Giao ban"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ý Nghĩa / Mục Đích Sử Dụng*:
                    </label>
                    <input
                      type="text"
                      value={meaningVi}
                      onChange={(e) => setMeaningVi(e.target.value)}
                      placeholder="e.g. Mở đầu thư hỏi thông tin lịch thiệp"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Câu Ví Dụ Tiếng Anh:
                    </label>
                    <input
                      type="text"
                      value={patternExEn}
                      onChange={(e) => setPatternExEn(e.target.value)}
                      placeholder="e.g. I am writing to inquire about your discounted subscription plans."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bản Dịch Tiếng Việt Câu Ví Dụ:
                  </label>
                  <input
                    type="text"
                    value={patternExVi}
                    onChange={(e) => setPatternExVi(e.target.value)}
                    placeholder="e.g. Tôi viết thư này để hỏi về các gói đăng ký ưu đãi của quý công ty."
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-200 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Lưu & Thêm Vào Hệ Thống Ngay</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 3: MANAGE LESSONS ──────────────────── */}
      {adminTab === 'manage_lessons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">
              Danh Sách Bài Học Hiện Tại ({lessons.length})
            </h2>
            <button
              onClick={() => setShowAddLessonModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Bài Học Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => {
              const vocabCount = vocabularies.filter((v) => v.lesson_id === lesson.id).length
              const isCustom = customLessons.some((cl) => cl.id === lesson.id)

              return (
                <div
                  key={lesson.id}
                  className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-emerald-300 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                        {lesson.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                          {lesson.title_vi}
                        </h3>
                        <p className="text-xs text-gray-500">{lesson.title_en}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lesson.track_type === 'medical'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {lesson.track_type === 'medical' ? 'Y Khoa' : 'TOEIC'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">{lesson.description_vi}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span>{vocabCount} từ vựng</span>
                      <span>•</span>
                      <span>+{lesson.xp_reward} XP</span>
                      <span>•</span>
                      <span className="capitalize">{lesson.difficulty}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-bold text-[11px] transition-colors"
                      >
                        Mở Xem
                      </Link>

                      {isCustom && (
                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa bài học tùy chỉnh này?')) {
                              deleteCustomItem('lesson', lesson.id)
                              toast.success('Đã xóa bài học tùy chỉnh.')
                            }
                          }}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa bài học tùy chỉnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 4: TOEIC EXAMS MANAGER & RUNNER ────── */}
      {adminTab === 'toeic_exams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Kho Đề Thi Thử TOEIC ({toeicExams.length} Đề Thi)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Admin có thể tạo thêm các bộ đề thi TOEIC mới, soạn câu hỏi và làm thử trực tiếp!
              </p>
            </div>

            <button
              onClick={() => setShowAddExamModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bộ Đề Thi Mới</span>
            </button>
          </div>

          {/* Exam Cards */}
          <div className="space-y-4">
            {toeicExams.map((exam) => (
              <div
                key={exam.id}
                className="p-6 rounded-3xl bg-white border border-indigo-100 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {exam.year_edition}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                        Target: {exam.target_score}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{exam.description_vi}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTestExam(exam)
                        setUserAnswers({})
                        setIsTestSubmitted(false)
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-2xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Làm Thử Đề Này</span>
                    </button>

                    <button
                      onClick={() => setActiveExamForQuestion(exam)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 border border-indigo-200 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Câu Hỏi</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {exam.time_limit_minutes} phút
                  </span>
                  <span>•</span>
                  <span className="font-bold text-indigo-700">
                    {exam.questions.length} câu hỏi trắc nghiệm
                  </span>
                  <span>•</span>
                  <span>Part {exam.parts_included.join(', ')}</span>
                </div>

                {/* Question Preview List */}
                {exam.questions.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Danh sách câu hỏi trong đề:
                    </div>
                    <div className="space-y-2">
                      {exam.questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">
                              Câu {idx + 1} (Part {q.part}): {q.question_text}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Đáp án: {q.correct_answer}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] text-gray-600 pt-1">
                            {q.options.map((opt) => (
                              <div
                                key={opt.key}
                                className={`px-2 py-1 rounded-lg ${
                                  opt.key === q.correct_answer
                                    ? 'bg-emerald-100 font-bold text-emerald-900'
                                    : 'bg-white'
                                }`}
                              >
                                ({opt.key}) {opt.text}
                              </div>
                            ))}
                          </div>
                          {q.explanation_vi && (
                            <div className="text-[11px] text-gray-500 italic pt-1 border-t border-gray-200/60 mt-1">
                              💡 {q.explanation_vi}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE LESSON ────────────────────── */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">Tạo Bài Học Mới</h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lộ Trình:</label>
                  <select
                    value={targetTrack}
                    onChange={(e) => setTargetTrack(e.target.value as TrackType)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50"
                  >
                    <option value="toeic">💼 TOEIC</option>
                    <option value="medical">🩺 Y Khoa (Medical)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Biểu Tượng (Emoji):
                  </label>
                  <input
                    type="text"
                    value={newLessonIcon}
                    onChange={(e) => setNewLessonIcon(e.target.value)}
                    placeholder="e.g. 📊 hoặc 🏥"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tiêu Đề Bài Học (Tiếng Việt)*:
                </label>
                <input
                  type="text"
                  value={newLessonTitleVi}
                  onChange={(e) => setNewLessonTitleVi(e.target.value)}
                  placeholder="e.g. Quản Lý Dự Án & Tiến Độ"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tiêu Đề Tiếng Anh:
                </label>
                <input
                  type="text"
                  value={newLessonTitleEn}
                  onChange={(e) => setNewLessonTitleEn(e.target.value)}
                  placeholder="e.g. Project Management & Deadlines"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mô Tả Ngắn (Tiếng Việt):
                </label>
                <textarea
                  rows={2}
                  value={newLessonDescVi}
                  onChange={(e) => setNewLessonDescVi(e.target.value)}
                  placeholder="e.g. Từ vựng và cấu trúc về tiến độ, báo cáo dự án..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Thời Gian (Phút):
                  </label>
                  <input
                    type="number"
                    value={newLessonMin}
                    onChange={(e) => setNewLessonMin(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phần Thưởng XP:
                  </label>
                  <input
                    type="number"
                    value={newLessonXP}
                    onChange={(e) => setNewLessonXP(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 font-bold text-xs text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 font-bold text-xs text-white hover:bg-emerald-600 shadow-sm"
                >
                  Tạo Bài Học Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE TOEIC EXAM ─────────────────── */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">Tạo Bộ Đề Thi Thử TOEIC</h3>
              <button
                onClick={() => setShowAddExamModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Bộ Đề Thi*:
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. ETS TOEIC 2024 Actual Test 02"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mô Tả Bộ Đề:</label>
                <textarea
                  rows={2}
                  value={examDesc}
                  onChange={(e) => setExamDesc(e.target.value)}
                  placeholder="e.g. Tập trung luyện Part 5 từ vựng công sở và các bẫy liên từ..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Target Score:
                  </label>
                  <select
                    value={examTargetScore}
                    onChange={(e) => setExamTargetScore(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <option value="550+">550+ (Cơ bản)</option>
                    <option value="750+">750+ (Khá giỏi)</option>
                    <option value="850+ - 990">850+ - 990 (Xuất sắc)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Thời Gian (Phút):
                  </label>
                  <input
                    type="number"
                    value={examTimeLimit}
                    onChange={(e) => setExamTimeLimit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 font-bold text-xs text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 font-bold text-xs text-white hover:bg-indigo-700 shadow-sm"
                >
                  Tạo Đề Thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD QUESTION TO EXAM ─────────────── */}
      {activeExamForQuestion && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Thêm Câu Hỏi Cho: {activeExamForQuestion.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Hiện có {activeExamForQuestion.questions.length} câu hỏi
                </p>
              </div>
              <button
                onClick={() => setActiveExamForQuestion(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionToExam} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phần Thi (Part):</label>
                  <select
                    value={questionPart}
                    onChange={(e) => setQuestionPart(Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  >
                    <option value={5}>Part 5: Incomplete Sentences</option>
                    <option value={6}>Part 6: Text Completion</option>
                    <option value={7}>Part 7: Reading Comprehension</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Chủ Điểm / Tag:</label>
                  <input
                    type="text"
                    value={grammarTag}
                    onChange={(e) => setGrammarTag(e.target.value)}
                    placeholder="e.g. Subjunctive Mood"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nội Dung Câu Hỏi (Kèm chỗ trống _______)*:
                </label>
                <textarea
                  rows={2}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. The committee insisted that every member _______ the financial report."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  required
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lựa chọn (A)*:</label>
                  <input
                    type="text"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="e.g. review"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lựa chọn (B)*:</label>
                  <input
                    type="text"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="e.g. reviews"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lựa chọn (C)*:</label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="e.g. reviewed"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lựa chọn (D)*:</label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="e.g. reviewing"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Đáp Án Đúng*:</label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value as 'A' | 'B' | 'C' | 'D')}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800"
                >
                  <option value="A">Đáp án (A)</option>
                  <option value="B">Đáp án (B)</option>
                  <option value="C">Đáp án (C)</option>
                  <option value="D">Đáp án (D)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Giải Thích Chi Tiết Tiếng Việt:
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="e.g. Thể giả định sau insisted that + S + V nguyên mẫu..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveExamForQuestion(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 font-bold text-xs text-gray-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 font-bold text-xs text-white hover:bg-indigo-700 shadow-sm"
                >
                  Lưu Câu Hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: TEST RUNNER (LÀM THỬ ĐỀ THI) ───────── */}
      {activeTestExam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    CHẾ ĐỘ THI THỬ
                  </span>
                  <span className="text-xs text-gray-400">
                    Thời gian: {activeTestExam.time_limit_minutes} phút
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mt-1">{activeTestExam.title}</h3>
              </div>
              <button
                onClick={() => setActiveTestExam(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {activeTestExam.questions.map((q, idx) => {
                const selected = userAnswers[q.id]
                const isCorrect = selected === q.correct_answer

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isTestSubmitted
                        ? isCorrect
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-red-300 bg-red-50/30'
                        : 'border-gray-200 bg-white'
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-bold text-xs sm:text-sm text-gray-900">
                        <span className="text-indigo-600 mr-1.5">Câu {idx + 1}:</span>
                        {q.question_text}
                      </div>
                      {isTestSubmitted && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isCorrect ? '✓ Đúng' : `✗ Sai (Đ/án: ${q.correct_answer})`}
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt) => {
                        const isChosen = selected === opt.key
                        const isRightOpt = opt.key === q.correct_answer

                        let optClasses = 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        if (isTestSubmitted) {
                          if (isRightOpt) {
                            optClasses = 'border-emerald-400 bg-emerald-100 text-emerald-900 font-bold'
                          } else if (isChosen && !isRightOpt) {
                            optClasses = 'border-red-400 bg-red-100 text-red-900 font-bold'
                          }
                        } else if (isChosen) {
                          optClasses = 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-200'
                        }

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            disabled={isTestSubmitted}
                            onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                            className={`p-3 rounded-xl border text-xs text-left flex items-center gap-2 transition-all ${optClasses}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px] shrink-0">
                              {opt.key}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {isTestSubmitted && q.explanation_vi && (
                      <div className="p-3 rounded-xl bg-gray-100/80 text-xs text-gray-700 space-y-1">
                        <div className="font-bold text-gray-900">💡 Giải thích chi tiết:</div>
                        <div>{q.explanation_vi}</div>
                        {q.grammar_or_vocab_tag && (
                          <div className="text-[11px] font-semibold text-indigo-700">
                            Tag: {q.grammar_or_vocab_tag}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Test Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-500 font-medium">
                Đã trả lời: {Object.keys(userAnswers).length} / {activeTestExam.questions.length} câu
              </div>

              <div className="flex items-center gap-2">
                {isTestSubmitted ? (
                  <button
                    onClick={() => {
                      setUserAnswers({})
                      setIsTestSubmitted(false)
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm Lại</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCalculateScore}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nộp Bài & Chấm Điểm</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
