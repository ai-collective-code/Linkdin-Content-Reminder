import { NextResponse } from 'next/server'
import { fetchEvents, invalidateCache, getCacheInfo } from '@/lib/google-sheets'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('refresh') === '1') {
    invalidateCache()
  }

  try {
    const events   = await fetchEvents()
    const { tabsLoaded, totalRaw } = getCacheInfo()
    return NextResponse.json({
      events,
      source:     'sheets',
      count:      events.length,
      tabsLoaded,
      totalRaw,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/sheets/events]', message)
    return NextResponse.json(
      { events: [], source: 'error', count: 0, error: message, tabsLoaded: [], totalRaw: 0 },
      { status: 200 },
    )
  }
}
