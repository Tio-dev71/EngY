import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format XP numbers with commas  
export function formatXP(xp: number): string {
  return xp.toLocaleString()
}

// Calculate days remaining
export function daysRemaining(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// Spaced Repetition Algorithm (SM-2 simplified)
export function calculateNextReview(
  quality: number, // 0-5 where 0=again, 3=good, 5=easy
  easeFactor: number,
  interval: number
): { newInterval: number; newEaseFactor: number } {
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  newEaseFactor = Math.max(1.3, newEaseFactor)

  let newInterval: number
  if (quality < 3) {
    newInterval = 1 // Reset
  } else if (interval === 0) {
    newInterval = 1
  } else if (interval === 1) {
    newInterval = 6
  } else {
    newInterval = Math.round(interval * newEaseFactor)
  }

  return { newInterval, newEaseFactor }
}

// Shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'text-emerald-500 bg-emerald-50'
    case 'intermediate': return 'text-amber-500 bg-amber-50'
    case 'advanced': return 'text-rose-500 bg-rose-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

// Generate avatar gradient from name
export function getAvatarGradient(name: string): string {
  const gradients = [
    'from-mint-400 to-purple-300',
    'from-pink-300 to-purple-400',
    'from-blue-300 to-mint-400',
    'from-amber-300 to-pink-400',
    'from-emerald-300 to-blue-400',
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}
