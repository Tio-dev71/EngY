'use client'

// ─── EngY Audio & Voice Synthesis Service ──────────
// Supports:
// 1. Microsoft Edge Neural TTS (Ultra-natural AI voices: Jenny & Guy)
// 2. Google Translate TTS (Reliable, clear pronunciation)
// 3. Native Browser Web Speech Synthesis fallback

export type VoiceEngine = 'edge_jenny' | 'edge_guy' | 'google' | 'native'

interface PlayVoiceOptions {
  voiceEngine?: VoiceEngine
  rate?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: unknown) => void
}

// Keep an active audio element to allow stopping previous speech
let currentAudio: HTMLAudioElement | null = null

export function playAudioText(text: string, options: PlayVoiceOptions = {}) {
  const {
    voiceEngine = 'edge_jenny',
    onStart,
    onEnd,
    onError,
  } = options

  if (!text || typeof window === 'undefined') return

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }

  // Cancel any browser speech synthesis in progress
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }

  // 1. If user prefers Native Browser TTS
  if (voiceEngine === 'native') {
    playNativeTTS(text, onStart, onEnd, onError)
    return
  }

  // 2. Build URL for Microsoft Edge Neural TTS or Google TTS
  let engineParam = 'edge'
  let voiceParam = 'en-US-JennyNeural'

  if (voiceEngine === 'edge_guy') {
    engineParam = 'edge'
    voiceParam = 'en-US-GuyNeural'
  } else if (voiceEngine === 'google') {
    engineParam = 'google'
    voiceParam = 'default'
  }

  const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&engine=${engineParam}&voice=${voiceParam}`

  const audio = new Audio(audioUrl)
  currentAudio = audio

  if (onStart) {
    audio.onplay = () => onStart()
  }

  audio.onended = () => {
    currentAudio = null
    if (onEnd) onEnd()
  }

  audio.onerror = (e) => {
    console.warn('Online TTS audio error, falling back to Native TTS:', e)
    currentAudio = null
    // Graceful fallback to Native SpeechSynthesis
    playNativeTTS(text, onStart, onEnd, onError)
  }

  audio.play().catch((err) => {
    console.warn('Audio play request failed or blocked by browser policy:', err)
    playNativeTTS(text, onStart, onEnd, onError)
  })
}

// Fallback: Browser Web SpeechSynthesis
function playNativeTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: unknown) => void
) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85

    // Attempt to pick Google or Microsoft voice from OS if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Siri'))
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    if (onStart) utterance.onstart = () => onStart()
    if (onEnd) utterance.onend = () => onEnd()
    if (onError) utterance.onerror = (err) => onError(err)

    window.speechSynthesis.speak(utterance)
  } else if (onError) {
    onError(new Error('TTS not supported'))
  }
}
