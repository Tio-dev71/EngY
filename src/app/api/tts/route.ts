import { NextResponse, type NextRequest } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

// Cache recent audio buffers in memory to respond instantly for repeated words
const audioCache = new Map<string, { buffer: Buffer; contentType: string }>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')?.trim()
  const engine = searchParams.get('engine') || 'edge' // 'edge' | 'google'
  const voice = searchParams.get('voice') || 'en-US-JennyNeural' // Jenny, Guy, Aria

  if (!text) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 })
  }

  // Prevent abuse with too long text
  const cleanText = text.slice(0, 300)
  const cacheKey = `${engine}:${voice}:${cleanText.toLowerCase()}`

  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey)!
    return new Response(cached.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  }

  // 1. Try Microsoft Edge Neural TTS (Natural human-like AI voice)
  if (engine === 'edge') {
    try {
      const tts = new MsEdgeTTS()
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
      const { audioStream } = tts.toStream(cleanText)

      const chunks: Buffer[] = []
      await new Promise<void>((resolve, reject) => {
        audioStream.on('data', (chunk: Buffer) => chunks.push(chunk))
        audioStream.on('end', () => resolve())
        audioStream.on('error', (err) => reject(err))
      })

      const audioBuffer = Buffer.concat(chunks)
      if (audioBuffer.length > 0) {
        audioCache.set(cacheKey, { buffer: audioBuffer, contentType: 'audio/mpeg' })
        return new Response(audioBuffer as unknown as BodyInit, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            'X-TTS-Engine': 'Microsoft Edge Neural',
          },
        })
      }
    } catch (edgeError) {
      console.warn('Edge TTS failed, falling back to Google TTS:', edgeError)
    }
  }

  // 2. Google Translate TTS (Free, fast, reliable)
  try {
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(
      cleanText
    )}`

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      audioCache.set(cacheKey, { buffer, contentType: 'audio/mpeg' })

      return new Response(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'X-TTS-Engine': 'Google Translate TTS',
        },
      })
    }
  } catch (googleError) {
    console.error('Google TTS error:', googleError)
  }

  return NextResponse.json(
    { error: 'Failed to generate audio from Edge and Google TTS' },
    { status: 500 }
  )
}
