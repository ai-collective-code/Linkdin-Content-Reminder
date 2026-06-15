import { google } from 'googleapis'
import * as XLSX from 'xlsx'
import type { SheetEvent } from '@/types/sheets'

function getAuthClient() {
  // Option 1: Use an API key if provided (much simpler for Netlify)
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE') {
    return process.env.GOOGLE_API_KEY
  }

  // Option 2: Fallback to Service Account
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL

  // Normalise the private key:
  let rawKey = process.env.GOOGLE_PRIVATE_KEY ?? ''
  rawKey = rawKey.replace(/^"|"$/g, '')            // strip wrapping quotes
  rawKey = rawKey.replace(/\\n/g, '\n')              // literal \n → newline
  const privateKey = rawKey.trim() || undefined

  if (!email || !privateKey) {
    console.warn('Missing Google credentials: Will attempt to fetch as a public sheet.')
    return null
  }
  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  })
}

/* ── Header utilities ───────────────────────────────────────── */
type HeaderMap = Record<string, number>

function normalise(s: string): string {
  return s.toLowerCase().trim().replace(/[\s_/\-()+]+/g, '_').replace(/_+$/, '')
}

function buildHeaderMap(headerRow: string[]): HeaderMap {
  const map: HeaderMap = {}
  for (let i = 0; i < headerRow.length; i++) {
    const key = normalise(headerRow[i] ?? '')
    if (key) map[key] = i
  }
  return map
}

function col(row: string[], map: HeaderMap, ...aliases: string[]): string {
  for (const alias of aliases) {
    const idx = map[normalise(alias)]
    if (idx !== undefined) return (row[idx] ?? '').trim()
  }
  return ''
}

function toArray(cell: string): string[] {
  if (!cell.trim()) return []
  return cell.split(/[,|;]/).map(s => s.trim()).filter(Boolean)
}

/* ── Date parsing ───────────────────────────────────────────── */
function parseFlexDate(raw: string): string {
  if (!raw?.trim()) return ''
  const s = raw.trim()

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s

  // "Apr 2", "Apr 14-15" → take first number
  const m = s.match(/^([A-Za-z]+)[.\s]+(\d+)/i)
  if (m) {
    const month = m[1]
    const day   = m[2]
    const currentYear = new Date().getFullYear()
    for (const year of [currentYear, currentYear + 1]) {
      const d = new Date(`${month} ${day}, ${year}`)
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
    }
  }

  const d = new Date(s)
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
}

function computeDaysUntil(dateStr: string): number {
  if (!dateStr) return 0
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 0
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000))
}

/* ── Header row detection ───────────────────────────────────── */
function findHeaderRowIndex(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    if (rows[i].filter(c => c?.trim()).length >= 4) return i
  }
  return 0
}

/* ── State name normalisation ───────────────────────────────── */
// Maps raw sheet tab names → clean state labels shown in the UI
const OVERVIEW_TABS = new Set([
  'master view', 'category view', 'overview', 'summary', 'all states',
  'all india', 'pan india', 'notes', 'readme', 'template',
])

function extractStateName(sheetName: string): string {
  const lower = sheetName.toLowerCase().trim()
  if (OVERVIEW_TABS.has(lower)) return 'National'
  // Title-case each word
  return sheetName
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/* ── Per-row parser ─────────────────────────────────────────── */
function parseRow(
  row:        string[],
  rowIndex:   number,
  map:        HeaderMap,
  sheetName:  string,
  state:      string,
): SheetEvent {
  const rawDate = col(row, map,
    'week_/_date', 'week_date', 'date', 'festival_date', 'event_date', 'week',
  )
  const festivalDate = parseFlexDate(rawDate)

  const eventName = col(row, map,
    'moment_/_trigger', 'moment_trigger', 'moment', 'trigger',
    'event', 'festival', 'name', 'festival_name',
  )

  const hook = col(row, map,
    'bcf_sales_hook', 'sales_hook', 'hook', 'content_hook', 'headline_hook',
  )
  const insight = col(row, map,
    'organic_social_trends_what_people_are_already_posting',
    'organic_social_trends', 'what_people_are_already_posting',
    'insight', 'strategic_insight', 'key_insight', 'trends',
  )
  const agencyMiss = col(row, map,
    'what_mumbai_agencies_will_miss', 'agencies_will_miss', 'what_agencies_miss',
  )
  const campaignAngle = col(row, map,
    'content_angle_story_first', 'content_angle', 'campaign_angle',
    'campaign angle', 'angle',
  )
  const targetBrands = col(row, map,
    'target_brand_categories', 'target_brands', 'brand_categories',
    'industry', 'vertical', 'sector', 'target_industry', 'audience', 'target_audience',
  )
  const format = col(row, map,
    'format_+_duration', 'format_duration', 'format', 'cta_style', 'cta',
  )
  const suggestedPlatform = col(row, map,
    'platform_priority', 'platform', 'suggested_platform', 'platforms',
  )
  const contentType = col(row, map, 'type', 'content_type', 'content type')
  const priority    = col(row, map, 'revenue_tier', 'priority', 'priority_level')

  const keywordSource = [hook, insight].filter(Boolean).join(' ')
  const keywords = keywordSource
    ? toArray(keywordSource.split('.')[0])
    : []

  return {
    id:               `${normalise(state)}_event-${rowIndex}`,
    event:            eventName,
    festival:         eventName,
    region:           state,
    emotion:          col(row, map, 'emotion', 'primary_emotion', 'emotional_tone'),
    tone:             col(row, map, 'tone', 'brand_tone', 'voice'),
    audience:         targetBrands,
    industry:         targetBrands,
    ctaStyle:         format,
    keywords,
    campaignAngle,
    insight:          [insight, agencyMiss].filter(Boolean).join(' | '),
    hook,
    contentHooks:     toArray(campaignAngle),
    festivalDate,
    contentType,
    priority,
    status:           col(row, map, 'status', 'post_status'),
    suggestedPlatform,
    daysUntil:        computeDaysUntil(festivalDate),
    // multi-tab fields
    sourceSheet:  sheetName,
    state,
    regions:      [state],
    isMerged:     false,
  }
}

/* ── Parse a full tab's rows into SheetEvents ───────────────── */
function parseSheetRows(rows: string[][], sheetName: string): SheetEvent[] {
  if (rows.length === 0) return []

  const state          = extractStateName(sheetName)
  const headerRowIndex = findHeaderRowIndex(rows)
  const headerMap      = buildHeaderMap(rows[headerRowIndex])

  console.log(`[google-sheets] "${sheetName}" (${state}) — header at row ${headerRowIndex}:`, rows[headerRowIndex].slice(0, 6))

  return rows
    .slice(headerRowIndex + 1)
    .filter(r => r?.[1]?.trim())   // skip section-header rows (empty event column)
    .map((row, i) => parseRow(row, i + 1, headerMap, sheetName, state))
    .filter(e => e.event.trim())   // skip rows where event name resolved to empty
}

/* ── Deduplication + merge ──────────────────────────────────── */
function normaliseEventName(name: string): string {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}

function mergeEvents(events: SheetEvent[]): SheetEvent[] {
  const map = new Map<string, SheetEvent>()

  for (const ev of events) {
    // Key: normalised name + date (blank date is ok — still groups by name)
    const key = normaliseEventName(ev.event) + '__' + ev.festivalDate

    const existing = map.get(key)
    if (!existing) {
      map.set(key, { ...ev, regions: [ev.state] })
      continue
    }

    // Merge: accumulate regions, prefer richer content
    const regions  = [...new Set([...existing.regions, ev.state])]
    const isMerged = regions.length > 1

    // Re-use the merged ID only if regions grew
    const id = isMerged
      ? `merged_${normaliseEventName(ev.event).replace(/\s/g, '_')}_${ev.festivalDate || 'nodate'}`
      : existing.id

    map.set(key, {
      ...existing,
      id,
      regions,
      isMerged,
      region: regions.join(', '),
      // Prefer longer / richer content from either source
      insight:       existing.insight.length >= ev.insight.length ? existing.insight : ev.insight,
      hook:          existing.hook           || ev.hook,
      campaignAngle: existing.campaignAngle.length >= ev.campaignAngle.length ? existing.campaignAngle : ev.campaignAngle,
      audience:      existing.audience       || ev.audience,
      keywords:      [...new Set([...existing.keywords, ...ev.keywords])],
      // Keep highest priority
      priority: (
        existing.priority?.toLowerCase() === 'high' ||
        ev.priority?.toLowerCase() === 'high'
      ) ? 'High' : existing.priority || ev.priority,
    })
  }

  return Array.from(map.values())
}

/* ── Method A: Sheets API — all tabs ────────────────────────── */
interface RawSheetData { rows: string[][]; sheetName: string }

async function fetchAllTabsViaSheets(
  auth:    Exclude<ReturnType<typeof getAuthClient>, null>,
  sheetId: string,
): Promise<RawSheetData[]> {
  const sheets = google.sheets({ version: 'v4', auth })

  const meta      = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
  const allTabs   = meta.data.sheets ?? []
  const tabNames  = allTabs
    .map(s => s.properties?.title ?? '')
    .filter(Boolean)

  console.log(`[google-sheets] Sheets API — ${tabNames.length} tabs: ${tabNames.join(', ')}`)

  const results: RawSheetData[] = []

  for (const tabName of tabNames) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!A:Z`,
      })
      results.push({
        rows:      (res.data.values ?? []) as string[][],
        sheetName: tabName,
      })
    } catch (err) {
      console.warn(`[google-sheets] Skipping tab "${tabName}": ${(err as Error).message}`)
    }
  }

  return results
}

/* ── Method B: Drive API — downloads once, parses all tabs ─── */
async function fetchAllTabsViaDrive(
  auth:    Exclude<ReturnType<typeof getAuthClient>, null>,
  sheetId: string,
): Promise<RawSheetData[]> {
  console.log('[google-sheets] Falling back to Drive API (Excel file — all tabs)')

  const drive = google.drive({ version: 'v3', auth })
  const driveRes = await drive.files.get(
    { fileId: sheetId, alt: 'media' },
    { responseType: 'arraybuffer' },
  )

  const buffer   = Buffer.from(driveRes.data as ArrayBuffer)
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  console.log(`[google-sheets] Drive API — ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}`)

  return workbook.SheetNames.map(sheetName => {
    const worksheet = workbook.Sheets[sheetName]
    if (!worksheet) return { rows: [], sheetName }
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1, defval: '', raw: false,
    }) as string[][]
    return { rows, sheetName }
  })
}

/* ── Method C: Public Export API (No Auth) ─────────────────── */
async function fetchAllTabsViaPublicExport(sheetId: string): Promise<RawSheetData[]> {
  console.log('[google-sheets] Fetching via Public Export (No Auth)')
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Public export failed with status ${res.status}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  console.log(`[google-sheets] Public Export — ${workbook.SheetNames.length} sheets`)

  return workbook.SheetNames.map(sheetName => {
    const worksheet = workbook.Sheets[sheetName]
    if (!worksheet) return { rows: [], sheetName }
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1, defval: '', raw: false,
    }) as string[][]
    return { rows, sheetName }
  })
}

/* ── In-process cache (2-minute TTL) ───────────────────────── */
interface Cache {
  events:     SheetEvent[]
  tabsLoaded: string[]
  totalRaw:   number
  ts:         number
}
let _cache: Cache | null = null
const CACHE_TTL_MS = 2 * 60 * 1000

/* ── Main entry point ───────────────────────────────────────── */
export async function fetchEvents(): Promise<SheetEvent[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID is not set in .env.local')

  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return _cache.events
  }

  const auth = getAuthClient()

  // Fetch all tabs — try Sheets API first, Drive API as fallback
  let tabDataList: RawSheetData[]
  
  if (!auth) {
    tabDataList = await fetchAllTabsViaPublicExport(sheetId)
  } else {
    try {
      tabDataList = await fetchAllTabsViaSheets(auth, sheetId)
      // If Sheets API returns very few tabs, it may have failed silently
      if (tabDataList.length === 0) throw new Error('No tabs returned')
    } catch (err) {
      const msg = (err as Error).message ?? ''
      if (
        msg.includes('Office file') ||
        msg.includes('not supported for this document') ||
        msg.includes('No tabs returned')
      ) {
        tabDataList = await fetchAllTabsViaDrive(auth, sheetId)
      } else {
        console.warn(`[google-sheets] Auth failed (${msg}), trying public export.`)
        tabDataList = await fetchAllTabsViaPublicExport(sheetId)
      }
    }
  }

  // Parse each tab independently
  const allEvents: SheetEvent[] = []
  const tabsLoaded: string[]    = []

  for (const { rows, sheetName } of tabDataList) {
    try {
      const parsed = parseSheetRows(rows, sheetName)
      if (parsed.length > 0) {
        allEvents.push(...parsed)
        tabsLoaded.push(sheetName)
        console.log(`[google-sheets] "${sheetName}" → ${parsed.length} events`)
      }
    } catch (err) {
      console.warn(`[google-sheets] Parse error in "${sheetName}": ${(err as Error).message}`)
    }
  }

  if (allEvents.length === 0) {
    console.warn('[google-sheets] No events parsed from any tab')
    _cache = { events: [], tabsLoaded: [], totalRaw: 0, ts: Date.now() }
    return []
  }

  const totalRaw     = allEvents.length
  const mergedEvents = mergeEvents(allEvents)

  console.log(`[google-sheets] Merged ${totalRaw} raw rows → ${mergedEvents.length} unique events from ${tabsLoaded.length} tabs`)

  _cache = { events: mergedEvents, tabsLoaded, totalRaw, ts: Date.now() }
  return mergedEvents
}

export async function fetchEventById(id: string): Promise<SheetEvent | null> {
  const events = await fetchEvents()
  return events.find(e => e.id === id) ?? null
}

export function invalidateCache() {
  _cache = null
}

// Expose cache metadata for the API route
export function getCacheInfo(): { tabsLoaded: string[]; totalRaw: number } {
  return {
    tabsLoaded: _cache?.tabsLoaded ?? [],
    totalRaw:   _cache?.totalRaw   ?? 0,
  }
}
