import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { fetchEventById } from '@/lib/google-sheets'
import { buildGenerationPrompt, SYSTEM_PROMPT } from '@/lib/prompt-templates'
import type { ContentPlatform } from '@/lib/prompt-templates'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

const PLATFORM_DIRECTIVE: Record<ContentPlatform, string> = {
  linkedin: 'Write a LinkedIn post for this cultural event',
  whatsapp: 'Write a WhatsApp broadcast message for this cultural event',
  email:    'Write a complete email campaign for this cultural event',
}

async function generateForPlatform(
  event: Awaited<ReturnType<typeof fetchEventById>>,
  platform: ContentPlatform,
): Promise<string> {
  const prompt = buildGenerationPrompt({
    userMessage: PLATFORM_DIRECTIVE[platform],
    event,
    platform,
  })
  const msg = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 900,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: prompt }],
  })
  const block = msg.content[0]
  return block.type === 'text' ? block.text : ''
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  let body: { eventId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { eventId } = body
  if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 })

  const event = await fetchEventById(eventId)
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const encoder  = new TextEncoder()
  const platforms: ContentPlatform[] = ['linkedin', 'whatsapp', 'email']

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        for (const platform of platforms) {
          send({ platform, status: 'generating' })
          const content = await generateForPlatform(event, platform)
          send({ platform, content })
        }
        send({ done: true, eventName: event.event || event.festival })
      } catch (err) {
        send({ error: (err as Error).message ?? 'Generation failed' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':          'text/event-stream',
      'Cache-Control':         'no-cache, no-store',
      'X-Accel-Buffering':     'no',
    },
  })
}
