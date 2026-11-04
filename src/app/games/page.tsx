'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Gamepad2,
  Trophy,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Stethoscope,
  Volume2,
  VolumeX,
  HelpCircle,
  Flame,
} from 'lucide-react'
import { useAppStore, useLanguageStore } from '@/lib/store'
import type { GameType, Vocabulary } from '@/types/database'
import { shuffleArray } from '@/lib/utils'
import { playAudioText } from '@/lib/audio'
import {
  playCorrectSound,
  playWrongSound,
  playCardClickSound,
  playVictorySound,
  playLetterPickSound,
  playLetterResetSound,
  isSoundEffectsEnabled,
  toggleSoundEffects,
  fireConfetti,
} from '@/lib/soundEffects'
import { toast } from 'sonner'

function GamesContent() {
  const searchParams = useSearchParams()
  const initialLessonId = searchParams.get('lesson') || searchParams.get('lessonId')
  const initialGameType = searchParams.get('type') as GameType | null

  const { activeTrack, recordGameScore, addXP, voiceEngine, getAllLessons, getAllVocabularies } =
    useAppStore()
  const { language, t } = useLanguageStore()

  const allLessonsList = getAllLessons()
  const allVocabulariesList = getAllVocabularies()

  // Track filter & lesson selector
  const availableLessons = useMemo(
    () => allLessonsList.filter((l) => l.track_type === activeTrack),
    [allLessonsList, activeTrack]
  )
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initialLessonId || availableLessons[0]?.id || ''
  )

  // Auto-sync selected lesson if track changes and current lesson not in track
  useEffect(() => {
    if (availableLessons.length > 0) {
      const exists = availableLessons.some((l) => l.id === selectedLessonId)
      if (!exists) {
        setSelectedLessonId(availableLessons[0].id)
      }
    }
  }, [activeTrack, availableLessons, selectedLessonId])

  const [activeGameType, setActiveGameType] = useState<GameType>(
    initialGameType || 'flashcard_match'
  )

  // Game state
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Listen for sound toggle events
  useEffect(() => {
    setSoundEnabled(isSoundEffectsEnabled())
    const handleSoundToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>
      setSoundEnabled(customEvent.detail.enabled)
    }
    window.addEventListener('engy-sound-toggle', handleSoundToggle)
    return () => window.removeEventListener('engy-sound-toggle', handleSoundToggle)
  }, [])

  const handleToggleSound = () => {
    const next = toggleSoundEffects()
    setSoundEnabled(next)
    toast(
      next
        ? language === 'vi'
          ? '🔊 Đã bật âm thanh hiệu ứng'
          : '🔊 Game sound FX enabled'
        : language === 'vi'
        ? '🔇 Đã tắt âm thanh hiệu ứng'
        : '🔇 Game sound FX muted'
    )
  }

  // Active pool of vocabularies
  const currentVocabs: Vocabulary[] = useMemo(() => {
    if (selectedLessonId) {
      const match = allVocabulariesList.filter((v) => v.lesson_id === selectedLessonId)
      if (match.length > 0) return match
    }
    return allVocabulariesList.filter((v) => v.track_type === activeTrack)
  }, [selectedLessonId, activeTrack, allVocabulariesList])

  // ─────────────────────────────────────────────────────────────
  // GAME 1: FLASHCARD MATCH STATE
  // ─────────────────────────────────────────────────────────────
  interface MatchCard {
    id: string
    vocabId: string
    text: string
    isWord: boolean // true = English word, false = Vietnamese meaning
    matched: boolean
  }

  const [matchCards, setMatchCards] = useState<MatchCard[]>([])
  const [selectedCards, setSelectedCards] = useState<MatchCard[]>([])
  const [wrongCardIds, setWrongCardIds] = useState<string[]>([])
  const [matchedAnimIds, setMatchedAnimIds] = useState<string[]>([])

  const setupFlashcardMatch = () => {
    const subset = shuffleArray(currentVocabs).slice(0, 6)
    const cards: MatchCard[] = []

    subset.forEach((v) => {
      cards.push({
        id: `word-${v.id}`,
        vocabId: v.id,
        text: v.word,
        isWord: true,
        matched: false,
      })
      cards.push({
        id: `meaning-${v.id}`,
        vocabId: v.id,
        text: v.meaning_vi,
        isWord: false,
        matched: false,
      })
    })

    setMatchCards(shuffleArray(cards))
    setSelectedCards([])
    setWrongCardIds([])
    setMatchedAnimIds([])
    setScore(0)
    setStreak(0)
    setGameOver(false)
    setIsPlaying(true)
  }

  const handleCardClick = (card: MatchCard) => {
    if (
      card.matched ||
      selectedCards.some((c) => c.id === card.id) ||
      selectedCards.length >= 2 ||
      wrongCardIds.length > 0
    ) {
      return
    }

    playCardClickSound()
    const newSelected = [...selectedCards, card]
    setSelectedCards(newSelected)

    if (newSelected.length === 2) {
      const [cardA, cardB] = newSelected
      if (cardA.vocabId === cardB.vocabId && cardA.isWord !== cardB.isWord) {
        // MATCH! Correct sound + green pop animation
        playCorrectSound(streak + 1)
        setMatchedAnimIds([cardA.id, cardB.id])

        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c) =>
              c.vocabId === cardA.vocabId ? { ...c, matched: true } : c
            )
          )
          setSelectedCards([])
          setMatchedAnimIds([])
          setScore((s) => s + 20 + streak * 5)
          setStreak((st) => st + 1)
          toast.success(language === 'vi' ? 'Chính xác! +25 điểm 🎉' : 'Correct match! +25 pts 🎉')

          // Check if all matched
          setMatchCards((latest) => {
            const allDone = latest.every((c) => c.matched || c.vocabId === cardA.vocabId)
            if (allDone) {
              handleEndGame(score + 100)
            }
            return latest
          })
        }, 380)
      } else {
        // NO MATCH! Wrong sound + red shake animation
        playWrongSound()
        setWrongCardIds([cardA.id, cardB.id])

        setTimeout(() => {
          setSelectedCards([])
          setWrongCardIds([])
          setStreak(0)
        }, 650)
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GAME 2: MULTIPLE CHOICE QUIZ STATE
  // ─────────────────────────────────────────────────────────────
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<
    {
      vocab: Vocabulary
      options: string[]
      correctAnswer: string
    }[]
  >([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)

  const setupMultipleChoice = () => {
    const subset = shuffleArray(currentVocabs).slice(0, 6)
    const questions = subset.map((vocab) => {
      // Pick 3 wrong options
      const otherMeanings = currentVocabs
        .filter((v) => v.id !== vocab.id)
        .map((v) => v.meaning_vi)
      const shuffledOthers = shuffleArray(otherMeanings).slice(0, 3)
      const options = shuffleArray([vocab.meaning_vi, ...shuffledOthers])

      return {
        vocab,
        options,
        correctAnswer: vocab.meaning_vi,
      }
    })

    setQuizQuestions(questions)
    setQuizIndex(0)
    setSelectedOption(null)
    setIsAnswerRevealed(false)
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
  }

  const handleSelectQuizOption = (option: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(option)
    setIsAnswerRevealed(true)

    const currentQ = quizQuestions[quizIndex]
    const isCorrect = option === currentQ.correctAnswer

    if (isCorrect) {
      playCorrectSound()
      setScore((s) => s + 25)
      toast.success(language === 'vi' ? 'Đúng rồi! +25 XP ⭐' : 'Correct answer! +25 XP ⭐')
    } else {
      playWrongSound()
      toast.error(
        language === 'vi'
          ? `Sai rồi! Đáp án đúng là: ${currentQ.correctAnswer}`
          : `Incorrect! Correct answer: ${currentQ.correctAnswer}`
      )
    }

    setTimeout(() => {
      if (quizIndex + 1 < quizQuestions.length) {
        setQuizIndex((i) => i + 1)
        setSelectedOption(null)
        setIsAnswerRevealed(false)
      } else {
        handleEndGame(score + (isCorrect ? 25 : 0))
      }
    }, 1200)
  }

  // ─────────────────────────────────────────────────────────────
  // GAME 3: WORD SCRAMBLE STATE
  // ─────────────────────────────────────────────────────────────
  const [scrambleIndex, setScrambleIndex] = useState(0)
  const [scrambleVocabs, setScrambleVocabs] = useState<Vocabulary[]>([])
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([])
  const [userLetters, setUserLetters] = useState<string[]>([])
  const [scrambleIsWrong, setScrambleIsWrong] = useState(false)

  const setupWordScramble = () => {
    const subset = shuffleArray(currentVocabs).slice(0, 5)
    setScrambleVocabs(subset)
    setScrambleIndex(0)
    initScrambleQuestion(subset[0])
    setScore(0)
    setScrambleIsWrong(false)
    setGameOver(false)
    setIsPlaying(true)
  }

  const initScrambleQuestion = (vocab: Vocabulary) => {
    const cleanWord = vocab.word.toLowerCase().replace(/[^a-z]/g, '')
    const letters = cleanWord.split('')
    setScrambledLetters(shuffleArray(letters))
    setUserLetters([])
    setScrambleIsWrong(false)
  }

  const handlePickLetter = (letter: string, index: number) => {
    playLetterPickSound(userLetters.length)
    setUserLetters((prev) => [...prev, letter])
    setScrambledLetters((prev) => prev.filter((_, i) => i !== index))
  }

  const handleResetLetters = () => {
    playLetterResetSound()
    if (scrambleVocabs[scrambleIndex]) {
      initScrambleQuestion(scrambleVocabs[scrambleIndex])
    }
  }

  const handleCheckScramble = () => {
    const currentV = scrambleVocabs[scrambleIndex]
    const targetWord = currentV.word.toLowerCase().replace(/[^a-z]/g, '')
    const userWord = userLetters.join('').toLowerCase()

    if (userWord === targetWord) {
      playCorrectSound()
      setScore((s) => s + 30)
      toast.success(
        language === 'vi'
          ? `Chính xác! Từ là "${currentV.word}" (+30 XP) 🎉`
          : `Bingo! Word is "${currentV.word}" (+30 XP) 🎉`
      )

      setTimeout(() => {
        if (scrambleIndex + 1 < scrambleVocabs.length) {
          const nextIndex = scrambleIndex + 1
          setScrambleIndex(nextIndex)
          initScrambleQuestion(scrambleVocabs[nextIndex])
        } else {
          handleEndGame(score + 30)
        }
      }, 1000)
    } else {
      playWrongSound()
      setScrambleIsWrong(true)
      setTimeout(() => setScrambleIsWrong(false), 500)
      toast.error(
        language === 'vi'
          ? 'Chưa chính xác! Thử sắp xếp lại xem nhé.'
          : 'Not quite! Try rearranging the letters.'
      )
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GAME 4: FILL IN THE BLANK STATE
  // ─────────────────────────────────────────────────────────────
  const [fillIndex, setFillIndex] = useState(0)
  const [fillQuestions, setFillQuestions] = useState<
    {
      vocab: Vocabulary
      sentenceWithBlank: string
      options: string[]
    }[]
  >([])
  const [selectedFillOption, setSelectedFillOption] = useState<string | null>(null)
  const [isFillRevealed, setIsFillRevealed] = useState(false)

  const setupFillInBlank = () => {
    const subset = shuffleArray(currentVocabs).slice(0, 5)
    const questions = subset.map((vocab) => {
      // Replace word with blank
      const regex = new RegExp(vocab.word, 'gi')
      const sentenceWithBlank = vocab.example_sentence.replace(regex, '______')

      const otherWords = currentVocabs.filter((v) => v.id !== vocab.id).map((v) => v.word)
      const wrong = shuffleArray(otherWords).slice(0, 3)
      const options = shuffleArray([vocab.word, ...wrong])

      return {
        vocab,
        sentenceWithBlank,
        options,
      }
    })

    setFillQuestions(questions)
    setFillIndex(0)
    setSelectedFillOption(null)
    setIsFillRevealed(false)
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
  }

  const handleSelectFillOption = (option: string) => {
    if (isFillRevealed) return
    setSelectedFillOption(option)
    setIsFillRevealed(true)

    const currentQ = fillQuestions[fillIndex]
    const isCorrect = option.toLowerCase() === currentQ.vocab.word.toLowerCase()

    if (isCorrect) {
      playCorrectSound()
      setScore((s) => s + 25)
      toast.success(language === 'vi' ? 'Điền chính xác! +25 XP ⭐' : 'Correct word! +25 XP ⭐')
    } else {
      playWrongSound()
      toast.error(
        language === 'vi'
          ? `Chưa đúng! Từ cần điền là: ${currentQ.vocab.word}`
          : `Incorrect! Missing word is: ${currentQ.vocab.word}`
      )
    }

    setTimeout(() => {
      if (fillIndex + 1 < fillQuestions.length) {
        setFillIndex((i) => i + 1)
        setSelectedFillOption(null)
        setIsFillRevealed(false)
      } else {
        handleEndGame(score + (isCorrect ? 25 : 0))
      }
    }, 1200)
  }

  // ─────────────────────────────────────────────────────────────
  // GAME CONTROLLER
  // ─────────────────────────────────────────────────────────────
  const startGame = () => {
    if (activeGameType === 'flashcard_match') setupFlashcardMatch()
    if (activeGameType === 'multiple_choice') setupMultipleChoice()
    if (activeGameType === 'word_scramble') setupWordScramble()
    if (activeGameType === 'fill_blank') setupFillInBlank()
  }

  const handleEndGame = (finalScore: number) => {
    playVictorySound()
    fireConfetti()
    setIsPlaying(false)
    setGameOver(true)
    const xp = Math.max(30, Math.round(finalScore / 2))
    recordGameScore(selectedLessonId, activeGameType, finalScore, 150, xp)
    addXP(xp)
    toast.success(
      language === 'vi'
        ? `🏆 Chúc mừng! Bạn hoàn thành minigame và nhận được +${xp} XP!`
        : `🏆 Congratulations! You finished the minigame and earned +${xp} XP!`
    )
  }

  // Audio pronunciation helper using Edge Neural / Google TTS
  const playWord = (word: string) => {
    playAudioText(word, { voiceEngine })
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              {activeTrack === 'medical' ? '🩺 Y Khoa' : '💼 TOEIC'}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">Minigames Arena</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {language === 'vi' ? 'Đấu Trường Minigames Tiếng Anh' : 'English Minigames Arena'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {language === 'vi'
              ? 'Củng cố phản xạ từ vựng sau bài học, tích lũy điểm và thăng hạng XP'
              : 'Reinforce vocabulary reflexes, accumulate points, and level up with XP'}
          </p>
        </div>

        {/* Selected Lesson Picker & Sound Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Sound FX Toggle Pill */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all shadow-2xs ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
            }`}
            title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>{language === 'vi' ? 'Âm thanh: Bật' : 'Sound FX: On'}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                <span>{language === 'vi' ? 'Âm thanh: Tắt' : 'Sound FX: Off'}</span>
              </>
            )}
          </button>

          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            disabled={isPlaying}
            className="p-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-800 outline-none focus:border-purple-400 shadow-2xs"
          >
            {availableLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.icon} {language === 'vi' ? l.title_vi : l.title_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── 4 Game Mode Selector Tabs ───────────────── */}
      {!isPlaying && !gameOver && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              type: 'flashcard_match' as GameType,
              title: language === 'vi' ? 'Ghép Flashcard' : 'Flashcard Match',
              icon: '🃏',
              desc: language === 'vi' ? 'Nối từ & nghĩa nhanh nhất' : 'Match word & meaning fast',
            },
            {
              type: 'multiple_choice' as GameType,
              title: language === 'vi' ? 'Trắc Nghiệm' : 'Multiple Choice',
              icon: '🎯',
              desc: language === 'vi' ? 'Chọn nghĩa đúng 4 phương án' : 'Pick the correct 1 of 4',
            },
            {
              type: 'word_scramble' as GameType,
              title: language === 'vi' ? 'Xếp Chữ Cái' : 'Word Scramble',
              icon: '🔤',
              desc: language === 'vi' ? 'Sắp xếp lại các chữ cái' : 'Unscramble mixed letters',
            },
            {
              type: 'fill_blank' as GameType,
              title: language === 'vi' ? 'Điền Khuyết' : 'Fill in Blank',
              icon: '✍️',
              desc: language === 'vi' ? 'Điền từ vào ngữ cảnh câu' : 'Fill the missing word',
            },
          ].map((mode) => (
            <button
              key={mode.type}
              onClick={() => setActiveGameType(mode.type)}
              className={`p-4 rounded-3xl border text-left transition-all ${
                activeGameType === mode.type
                  ? 'border-purple-500 bg-purple-50/70 text-purple-900 shadow-md scale-102'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="font-black text-xs sm:text-sm">{mode.title}</div>
              <div className="text-[10px] text-gray-400 mt-1 leading-snug">{mode.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* ─── Ready to Play Card ──────────────────────── */}
      {!isPlaying && !gameOver && (
        <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-sm text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 text-3xl">
            {activeGameType === 'flashcard_match' && '🃏'}
            {activeGameType === 'multiple_choice' && '🎯'}
            {activeGameType === 'word_scramble' && '🔤'}
            {activeGameType === 'fill_blank' && '✍️'}
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-gray-900">
              {language === 'vi' ? 'Sẵn Sàng Bắt Đầu Thử Thách?' : 'Ready for the Challenge?'}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {language === 'vi' ? (
                <>
                  Bạn sẽ chơi với các từ vựng thuộc bài &ldquo;
                  <strong>
                    {availableLessons.find((l) => l.id === selectedLessonId)?.title_vi || 'Bài học'}
                  </strong>
                  &rdquo;. Chơi càng nhanh, điểm combo thưởng càng cao!
                </>
              ) : (
                <>
                  You will practice with words from &ldquo;
                  <strong>
                    {availableLessons.find((l) => l.id === selectedLessonId)?.title_en || 'Lesson'}
                  </strong>
                  &rdquo;. Play fast to earn higher combo bonus points!
                </>
              )}
            </p>
          </div>

          <div>
            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-sm shadow-lg shadow-purple-200 hover:scale-105 transition-all"
            >
              {language === 'vi' ? 'Chơi Ngay Bây Giờ 🚀' : 'Start Playing Now 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* ─── ACTIVE GAME ARENA ───────────────────────── */}
      {isPlaying && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-lg space-y-6">
          {/* Game Status Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">
                  {language === 'vi' ? 'Điểm hiện tại:' : 'Current score:'}
                </span>
                <span className="text-lg font-black text-purple-600">{score}</span>
              </div>
              {streak > 1 && (
                <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full animate-bounce">
                  <Flame className="w-4 h-4 fill-orange-500" />
                  <span>Combo x{streak}!</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sound FX Toggle in active game */}
              <button
                onClick={handleToggleSound}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">
                      {language === 'vi' ? 'Âm thanh' : 'Sound'}
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                    <span className="hidden sm:inline">
                      {language === 'vi' ? 'Tắt tiếng' : 'Muted'}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsPlaying(false)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'vi' ? 'Thoát game' : 'Exit'}
              </button>
            </div>
          </div>

          {/* 1. Flashcard Match UI */}
          {activeGameType === 'flashcard_match' && (
            <div className="space-y-4">
              <p className="text-xs text-center text-gray-400">
                {language === 'vi'
                  ? 'Nhấn chọn 1 thẻ tiếng Anh và 1 thẻ nghĩa tiếng Việt tương ứng:'
                  : 'Click 1 English word card and 1 corresponding Vietnamese meaning card:'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {matchCards.map((card) => {
                  const isSelected = selectedCards.some((c) => c.id === card.id)
                  const isWrong = wrongCardIds.includes(card.id)
                  const isJustMatched = matchedAnimIds.includes(card.id)

                  let cardStyle = card.isWord
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:border-emerald-400'
                    : 'bg-purple-50 text-purple-900 border-purple-200 hover:border-purple-400'

                  if (card.matched) {
                    cardStyle = 'opacity-0 scale-95 pointer-events-none'
                  } else if (isWrong) {
                    cardStyle =
                      'bg-red-100 text-red-900 border-red-400 shadow-md animate-game-shake ring-2 ring-red-300'
                  } else if (isJustMatched) {
                    cardStyle =
                      'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-lg animate-game-pop ring-2 ring-emerald-300'
                  } else if (isSelected) {
                    cardStyle =
                      'bg-purple-500 text-white border-purple-600 scale-105 shadow-md ring-2 ring-purple-300'
                  }

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      disabled={card.matched}
                      className={`h-28 p-3 rounded-2xl border text-xs font-bold flex items-center justify-center text-center transition-all ${cardStyle}`}
                    >
                      {card.text}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. Multiple Choice UI */}
          {activeGameType === 'multiple_choice' && quizQuestions[quizIndex] && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {language === 'vi' ? 'Câu hỏi' : 'Question'} {quizIndex + 1}/{quizQuestions.length}
                </span>
                <span>
                  {language === 'vi' ? 'Chọn 1 trong 4 đáp án đúng' : 'Pick the correct 1 of 4'}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 text-center space-y-2">
                <span className="text-xs font-bold text-gray-400">
                  {language === 'vi' ? 'Từ tiếng Anh:' : 'English word:'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {quizQuestions[quizIndex].vocab.word}
                </h3>
                <p className="text-xs font-mono text-purple-600">
                  {quizQuestions[quizIndex].vocab.phonetic}
                </p>
                <button
                  onClick={() => playWord(quizQuestions[quizIndex].vocab.word)}
                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 inline-flex items-center gap-1 text-xs font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'vi' ? 'Nghe phát âm AI' : 'Listen with AI voice'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizQuestions[quizIndex].options.map((option, idx) => {
                  let btnColor = 'bg-white border-gray-200 hover:border-purple-300'
                  if (isAnswerRevealed) {
                    if (option === quizQuestions[quizIndex].correctAnswer) {
                      btnColor =
                        'bg-emerald-500 text-white border-emerald-600 shadow-md animate-game-pop ring-2 ring-emerald-300'
                    } else if (option === selectedOption) {
                      btnColor =
                        'bg-red-500 text-white border-red-600 shadow-md animate-game-shake ring-2 ring-red-300'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(option)}
                      disabled={isAnswerRevealed}
                      className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all shadow-2xs ${btnColor}`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. Word Scramble UI */}
          {activeGameType === 'word_scramble' && scrambleVocabs[scrambleIndex] && (
            <div className="space-y-6 max-w-xl mx-auto text-center">
              <div className="text-xs text-gray-400">
                {language === 'vi' ? 'Từ' : 'Word'} {scrambleIndex + 1}/{scrambleVocabs.length}
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 text-xs text-purple-900 font-bold">
                {language === 'vi' ? 'Gợi ý nghĩa:' : 'Meaning hint:'} &ldquo;
                {scrambleVocabs[scrambleIndex].meaning_vi}&rdquo;
              </div>

              {/* Slot where user placed letters */}
              <div
                className={`flex flex-wrap items-center justify-center gap-2 min-h-[50px] p-3 rounded-2xl bg-gray-50 border transition-all ${
                  scrambleIsWrong
                    ? 'border-red-400 bg-red-50 animate-game-shake ring-2 ring-red-300'
                    : 'border-gray-200'
                }`}
              >
                {userLetters.length === 0 ? (
                  <span className="text-xs text-gray-400">
                    {language === 'vi'
                      ? 'Nhấn các chữ cái bên dưới để xếp từ'
                      : 'Click the letters below to assemble word'}
                  </span>
                ) : (
                  userLetters.map((l, i) => (
                    <span
                      key={i}
                      className="w-10 h-10 rounded-xl bg-purple-500 text-white font-black text-sm flex items-center justify-center shadow-xs animate-game-pop"
                    >
                      {l.toUpperCase()}
                    </span>
                  ))
                )}
              </div>

              {/* Letters pool */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {scrambledLetters.map((letter, i) => (
                  <button
                    key={i}
                    onClick={() => handlePickLetter(letter, i)}
                    className="w-11 h-11 rounded-xl bg-white border border-gray-200 hover:border-purple-400 font-black text-base text-gray-800 shadow-xs hover:scale-105 active:scale-95 transition-all"
                  >
                    {letter.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetLetters}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors"
                >
                  {language === 'vi' ? 'Xếp Lại' : 'Reset Letters'}
                </button>
                <button
                  onClick={handleCheckScramble}
                  className="px-6 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-600 shadow-xs hover:scale-105 transition-all"
                >
                  {language === 'vi' ? 'Kiểm Tra' : 'Submit Check'}
                </button>
              </div>
            </div>
          )}

          {/* 4. Fill in the Blank UI */}
          {activeGameType === 'fill_blank' && fillQuestions[fillIndex] && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {language === 'vi' ? 'Câu hỏi' : 'Question'} {fillIndex + 1}/{fillQuestions.length}
                </span>
                <span>
                  {language === 'vi'
                    ? 'Điền từ thích hợp vào chỗ trống'
                    : 'Select the missing word'}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-3">
                <p className="text-sm sm:text-base font-medium text-gray-900 leading-relaxed">
                  {fillQuestions[fillIndex].sentenceWithBlank}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {language === 'vi' ? 'Dịch nghĩa:' : 'Translation:'} &ldquo;
                  {fillQuestions[fillIndex].vocab.example_translation}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {fillQuestions[fillIndex].options.map((opt, i) => {
                  let btnColor = 'bg-white border-gray-200 hover:border-purple-300'
                  if (isFillRevealed) {
                    if (opt.toLowerCase() === fillQuestions[fillIndex].vocab.word.toLowerCase()) {
                      btnColor =
                        'bg-emerald-500 text-white border-emerald-600 shadow-md animate-game-pop ring-2 ring-emerald-300'
                    } else if (opt === selectedFillOption) {
                      btnColor =
                        'bg-red-500 text-white border-red-600 shadow-md animate-game-shake ring-2 ring-red-300'
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectFillOption(opt)}
                      disabled={isFillRevealed}
                      className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition-all ${btnColor}`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── GAME OVER VICTORY SCREEN ───────────────── */}
      {gameOver && (
        <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-xl text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-300 via-orange-400 to-pink-500 text-white shadow-lg text-4xl animate-bounce">
            🏆
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">
              {language === 'vi' ? 'Xuất Sắc! Hoàn Thành Minigame' : 'Outstanding! Game Completed'}
            </h2>
            <p className="text-xs text-gray-500">
              {language === 'vi'
                ? 'Kiến thức của bạn đã được củng cố và lưu vào bộ nhớ dài hạn!'
                : 'Your vocabulary memory has been strongly reinforced and consolidated!'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 max-w-sm mx-auto flex items-center justify-around">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">
                {language === 'vi' ? 'Điểm số' : 'Score'}
              </div>
              <div className="text-2xl font-black text-gray-900">{score}</div>
            </div>
            <div className="h-8 w-[1px] bg-purple-200" />
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">
                {language === 'vi' ? 'XP Nhận Được' : 'XP Earned'}
              </div>
              <div className="text-2xl font-black text-emerald-600">+{Math.round(score / 2)} XP</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-2xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'vi' ? 'Chơi Lại Trận Này' : 'Play Again'}</span>
            </button>

            <Link
              href="/lessons"
              className="px-6 py-3 rounded-2xl bg-white text-gray-700 font-bold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {language === 'vi' ? 'Học Bài Tiếp Theo' : 'Next Lesson'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-400">Đang tải phòng game...</div>
      }
    >
      <GamesContent />
    </Suspense>
  )
}
