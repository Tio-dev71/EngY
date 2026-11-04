import { NextResponse, type NextRequest } from 'next/server'
import type { GameScore } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lesson_id, game_type, score, max_score, xp_earned } = body

    const gameScore: GameScore = {
      id: 'gs-' + Date.now(),
      user_id: 'current-user',
      lesson_id: lesson_id || 'general',
      game_type: game_type || 'flashcard_match',
      score: score || 0,
      max_score: max_score || 100,
      time_spent_seconds: 60,
      xp_earned: xp_earned || 25,
      played_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      gameScore,
      xp_awarded: gameScore.xp_earned,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record game score' }, { status: 500 })
  }
}
