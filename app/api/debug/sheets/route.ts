import { NextResponse } from 'next/server'
import { fetchEvents, invalidateCache } from '@/lib/google-sheets'

export const dynamic = 'force-dynamic'

export async function GET() {
  const report: Record<string, unknown> = {}

  const sheetId      = process.env.GOOGLE_SHEET_ID
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey       = process.env.GOOGLE_PRIVATE_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  report.env = {
    GOOGLE_SHEET_ID:              !!sheetId,
    GOOGLE_SHEET_GID:             process.env.GOOGLE_SHEET_GID ?? '(not set)',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!serviceEmail,
    GOOGLE_PRIVATE_KEY:           !!rawKey,
    GOOGLE_PRIVATE_KEY_LENGTH:    rawKey?.length ?? 0,
    GOOGLE_PRIVATE_KEY_BEGINS:    rawKey?.replace(/\\n/g, '\n').startsWith('-----BEGIN') ?? false,
    ANTHROPIC_API_KEY:            !!anthropicKey,
    ANTHROPIC_KEY_PREFIX:         anthropicKey?.slice(0, 14) ?? '(missing)',
  }

  if (!sheetId || !serviceEmail || !rawKey) {
    return NextResponse.json({ ok: false, step: 'env', error: 'Missing required env vars', report })
  }

  invalidateCache()

  try {
    const events = await fetchEvents()
    report.pipeline = {
      ok: true,
      method: 'auto (Sheets API or Drive API fallback)',
      eventCount: events.length,
      sample: events.slice(0, 3).map(e => ({
        id:      e.id,
        event:   e.event,
        region:  e.region,
        festivalDate: e.festivalDate,
        daysUntil: e.daysUntil,
        audience: e.audience,
        hook: e.hook,
      })),
    }
    return NextResponse.json({ ok: true, step: 'complete', report })
  } catch (err) {
    const message = (err as Error).message ?? 'Unknown error'
    report.pipeline = { ok: false, error: message }
    return NextResponse.json({ ok: false, step: 'pipeline', error: message, report })
  }
}
