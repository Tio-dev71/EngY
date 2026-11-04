import { NextResponse, type NextRequest } from 'next/server'
import { allLessons, allVocabularies } from '@/data/seed'
import type { TrackType } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const track = searchParams.get('track') as TrackType | null
  const lessonId = searchParams.get('lessonId')

  if (lessonId) {
    const lesson = allLessons.find((l) => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }
    const vocabs = allVocabularies.filter((v) => v.lesson_id === lessonId)
    return NextResponse.json({ lesson, vocabularies: vocabs })
  }

  const filtered = track
    ? allLessons.filter((l) => l.track_type === track)
    : allLessons

  return NextResponse.json({ lessons: filtered })
}
