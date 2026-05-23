import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { fetchEventById } from '@/lib/google-sheets'
import { buildGenerationPrompt, SYSTEM_PROMPT, type ContentPlatform } from '@/lib/prompt-templates'

export const dynamic = 'force-dynamic'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
})

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[api/generate/stream] ANTHROPIC_API_KEY not set')
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  let body: { message: string; eventId?: string; platform: ContentPlatform; tone?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, eventId, platform, tone } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  if (!platform || !['linkedin', 'whatsapp', 'email'].includes(platform)) {
    return NextResponse.json({ error: 'platform must be linkedin | whatsapp | email' }, { status: 400 })
  }

  try {
    // Pull live event intelligence from Google Sheets
    const event = eventId ? await fetchEventById(eventId) : null

    console.log(`[api/generate/stream] platform=${platform} tone=${tone ?? 'none'} eventId=${eventId ?? 'none'} eventFound=${!!event}`)

    const prompt = buildGenerationPrompt({ userMessage: message, event, platform, tone })

    console.log(`[api/generate/stream] Prompt length: ${prompt.length} chars`)

    // Anthropic streaming — use the messages.stream() API
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const encoder = new TextEncoder()
    let chunkCount = 0

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
              chunkCount++
            }
          }
          console.log(`[api/generate/stream] Completed — ${chunkCount} chunks emitted`)
        } catch (streamErr) {
          console.error('[api/generate/stream] Stream error:', (streamErr as Error).message)
          controller.error(streamErr)
          return
        }
        controller.close()
      },
      cancel() {
        console.log('[api/generate/stream] Aborted by client')
        stream.abort()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type':          'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control':          'no-cache, no-store',
        'X-Accel-Buffering':      'no',    // disable Nginx buffering if proxied
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    console.error('[api/generate/stream]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
