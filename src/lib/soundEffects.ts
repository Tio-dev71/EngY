'use client'

/**
 * ─── EngY Game Sound Effects Engine ────────────────────────
 * Pure Web Audio API synthesized sound effects.
 * 100% offline, zero external audio asset dependencies, zero network latency.
 * Provides cheerful, crisp arcade & educational feedback sounds (Ding, Buzz, Pop, Fanfare).
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioContextClass) {
        audioCtx = new AudioContextClass()
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    return audioCtx
  } catch (err) {
    console.warn('Web Audio API not supported:', err)
    return null
  }
}

// ─── Sound Settings (Mute / Unmute) ─────────────────────────
const STORAGE_KEY = 'engy_game_sound_fx'

export function isSoundEffectsEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const val = localStorage.getItem(STORAGE_KEY)
    return val === null ? true : val === 'true'
  } catch {
    return true
  }
}

export function setSoundEffectsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
    window.dispatchEvent(new CustomEvent('engy-sound-toggle', { detail: { enabled } }))
  } catch (err) {
    console.warn('Failed to save sound settings:', err)
  }
}

export function toggleSoundEffects(): boolean {
  const current = isSoundEffectsEnabled()
  const next = !current
  setSoundEffectsEnabled(next)
  if (next) {
    playSampleTestSound()
  }
  return next
}

// ─── Procedural Sound Synthesizers ──────────────────────────

/**
 * Play a cheerful, bright ascending chime when answering correctly (Chọn đúng)
 * Uses harmonized sine/triangle arpeggio (C5 -> E5 -> G5 -> C6) with combo sparkles
 */
export function playCorrectSound(combo = 0): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime

  // Notes in Hz: C5, E5, G5, C6, E6
  const baseNotes = [523.25, 659.25, 783.99, 1046.5]
  if (combo > 1) {
    baseNotes.push(1318.51) // Extra high sparkle for combos
  }

  const stepDuration = 0.075

  baseNotes.forEach((freq, idx) => {
    const noteStart = now + idx * stepDuration
    const noteDuration = 0.28

    // Primary bell tone (Sine)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, noteStart)

    // Harmonics overtone (Triangle wave at double frequency for warm bell chime)
    const overtone = ctx.createOscillator()
    const overtoneGain = ctx.createGain()
    overtone.type = 'triangle'
    overtone.frequency.setValueAtTime(freq * 2, noteStart)

    // Master volume envelope
    gain.gain.setValueAtTime(0.001, noteStart)
    gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration)

    overtoneGain.gain.setValueAtTime(0.001, noteStart)
    overtoneGain.gain.linearRampToValueAtTime(0.06, noteStart + 0.01)
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration * 0.7)

    osc.connect(gain)
    overtone.connect(overtoneGain)
    gain.connect(ctx.destination)
    overtoneGain.connect(ctx.destination)

    osc.start(noteStart)
    osc.stop(noteStart + noteDuration)
    overtone.start(noteStart)
    overtone.stop(noteStart + noteDuration)
  })
}

/**
 * Play a playful, gentle cartoon "wobble/uh-oh" thud when answering wrongly (Chọn sai)
 * Pitch bends downward softly with a lowpass filter so it's clear yet never grating
 */
export function playWrongSound(): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.32

  // Two slightly detuned oscillators for a comical, bouncy game feel
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()

  // Warm filter to soften buzz
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(800, now)
  filter.frequency.exponentialRampToValueAtTime(250, now + duration)

  osc1.type = 'triangle'
  osc2.type = 'sawtooth'

  // Frequency slide downward (290Hz -> 140Hz)
  osc1.frequency.setValueAtTime(290, now)
  osc1.frequency.exponentialRampToValueAtTime(140, now + duration)

  osc2.frequency.setValueAtTime(278, now)
  osc2.frequency.exponentialRampToValueAtTime(135, now + duration)

  // Subtle volume envelope
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.25, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc1.connect(filter)
  osc2.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  osc1.start(now)
  osc2.start(now)
  osc1.stop(now + duration)
  osc2.stop(now + duration)
}

/**
 * Crisp, tactile pop/bubble sound for tapping cards or picking options
 */
export function playCardClickSound(): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.06

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  // Quick frequency sweep gives pleasant wooden/bubble tap pop
  osc.frequency.setValueAtTime(450, now)
  osc.frequency.exponentialRampToValueAtTime(850, now + 0.02)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.18, now + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration)
}

/**
 * Celebratory 5-note fanfare when finishing a game round (Chiến thắng minigame)
 */
export function playVictorySound(): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  // Fanfare: C5, E5, G5, B5, C6 (High hold)
  const notes = [
    { freq: 523.25, time: 0.0, dur: 0.15 },
    { freq: 659.25, time: 0.12, dur: 0.15 },
    { freq: 783.99, time: 0.24, dur: 0.15 },
    { freq: 987.77, time: 0.36, dur: 0.18 },
    { freq: 1046.5, time: 0.52, dur: 0.65 },
  ]

  notes.forEach((n) => {
    const start = now + n.time
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(n.freq, start)

    gain.gain.setValueAtTime(0.001, start)
    gain.gain.linearRampToValueAtTime(0.24, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + n.dur)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + n.dur)
  })
}

/**
 * Play a cute marimba-like pitch blip when picking letters in Word Scramble
 */
export function playLetterPickSound(step = 0): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.12

  // Pitch scales up with each letter picked
  const baseFreq = 440
  const freq = baseFreq * Math.pow(1.08, step % 8)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, now)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.2, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration)
}

/**
 * Gentle whoosh when clearing/resetting letters
 */
export function playLetterResetSound(): void {
  if (!isSoundEffectsEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.14

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(650, now)
  osc.frequency.exponentialRampToValueAtTime(220, now + duration)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.12, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration)
}

/**
 * Test beep when toggling sound ON
 */
export function playSampleTestSound(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, now)

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.18, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.15)
}

/**
 * Lightweight pure canvas confetti particle burst on victory!
 */
export function fireConfetti(): void {
  if (typeof window === 'undefined') return
  try {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '99999'
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      canvas.remove()
      return
    }

    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    const colors = ['#10b981', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#06b6d4', '#84cc16']
    const particles = Array.from({ length: 80 }).map(() => ({
      x: width * 0.5 + (Math.random() - 0.5) * 200,
      y: height * 0.4 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
    }))

    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      if (elapsed > 2500) {
        canvas.remove()
        return
      }

      ctx?.clearRect(0, 0, width, height)
      const progress = elapsed / 2500
      const fade = Math.max(0, 1 - progress)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.38 // gravity
        p.vx *= 0.98 // air friction
        p.rotation += p.vRotation

        if (ctx) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color
          ctx.globalAlpha = fade
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          ctx.restore()
        }
      })

      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  } catch (err) {
    console.warn('Confetti error:', err)
  }
}
