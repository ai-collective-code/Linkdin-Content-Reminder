import type { SheetEvent } from '@/types/sheets'

export type ContentPlatform = 'linkedin' | 'whatsapp' | 'email'

/* ── System prompt ─────────────────────────────────────────── */
export const SYSTEM_PROMPT = `You are a world-class cultural intelligence content strategist with deep expertise in festival marketing, B2B brand storytelling, and emotionally resonant copywriting.

You generate content that is:
- Hyperlocal and culturally nuanced — you understand the subtle distinctions within cultures
- Emotionally intelligent — you connect brands to human moments with authenticity
- Premium B2B-focused — never generic, always executive-grade
- Structured for the target platform's algorithm and consumption patterns
- Free of hollow brand speak, clichés, or recycled templates

You draw on cultural insight data to make every piece feel tailored, not templated.`

/* ── Platform-specific instructions ───────────────────────── */
const PLATFORM_GUIDE: Record<ContentPlatform, string> = {
  linkedin: `TARGET PLATFORM: LinkedIn

Format requirements:
- Open with a pattern-interrupt hook (not "Happy [Festival]!")
- Keep it under 1,300 characters before the "see more" cut-off
- Use line breaks strategically for white space and scannability
- Include 3-5 hyper-relevant hashtags at the end
- End with a genuine question or insight that invites engagement
- Voice: authoritative but human, first-person perspective works best`,

  whatsapp: `TARGET PLATFORM: WhatsApp Broadcast

Format requirements:
- Under 300 characters for the preview line
- Use *bold* with asterisks for key phrases
- Maximum 3 strategic emojis — choose emotionally resonant ones
- Include a clear, urgent CTA with [link] placeholder
- Short paragraphs — one idea per paragraph
- Conversational, direct, warm`,

  email: `TARGET PLATFORM: Email Campaign

Format requirements:
Provide three components:
1. Subject line (under 50 characters, curiosity-driven)
2. Preview text (under 90 characters, complements subject)
3. Email body with: opening hook, 2-3 short paragraphs, CTA button text
Use [First Name] for personalization placeholder.
Scannable structure, single clear CTA.`,
}

/* ── Build the generation prompt ───────────────────────────── */
interface PromptContext {
  userMessage: string
  event: SheetEvent | null
  platform: ContentPlatform
  tone?: string
}

export function buildGenerationPrompt({ userMessage, event, platform, tone }: PromptContext): string {
  const eventBlock = event
    ? `
━━━ CULTURAL INTELLIGENCE BRIEF ━━━
Event / Festival: ${event.event}
Region & Market: ${event.region}
Primary Emotion: ${event.emotion}
Target Audience: ${event.audience}
Strategic Insight: ${event.insight}
Campaign Angle: ${event.campaignAngle}
Trending Keywords: ${event.keywords.join(', ')}
Content Hooks: ${event.contentHooks.join(' | ')}
Preferred CTA Style: ${event.ctaStyle}
Brand Tone: ${event.tone}
${event.daysUntil > 0 ? `Days Until Event: ${event.daysUntil} days` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    : ''

  const toneInstruction = tone
    ? `\nRequested Tone Override: ${tone}`
    : ''

  return `${eventBlock}

${PLATFORM_GUIDE[platform]}
${toneInstruction}

USER REQUEST:
${userMessage}

Generate premium content. Use the cultural intelligence brief to inform every word choice — the output should feel like it was written by someone who deeply understands this cultural moment, not an AI pattern-matching a template.`
}
