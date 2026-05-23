/* ── Raw event row from Google Sheets ──────────────────────── */
export interface SheetEvent {
  id: string

  // Core identity
  event:          string   // Event/Festival name
  festival:       string   // Festival name (may equal event)
  region:         string   // Legacy single-region string (kept for compat)
  emotion:        string   // Primary emotion
  tone:           string   // Brand/content tone
  audience:       string   // Target audience
  industry:       string   // Target industry / vertical

  // Content strategy
  ctaStyle:       string   // CTA style
  keywords:       string[] // Keywords (array)
  campaignAngle:  string   // Campaign angle
  insight:        string   // Strategic insight
  hook:           string   // Content hook
  contentHooks:   string[] // Multiple hooks (array)

  // Scheduling & metadata
  festivalDate:   string   // ISO date string (YYYY-MM-DD)
  contentType:    string   // Content type
  priority:       string   // High | Medium | Low
  status:         string   // Draft | Scheduled | Published | Active
  suggestedPlatform: string // LinkedIn | WhatsApp | Email | etc.

  // Computed
  daysUntil: number

  // ── Multi-tab intelligence ──────────────────────────────
  sourceSheet:  string    // Raw tab name (e.g. "PUNJAB", "National")
  state:        string    // Normalized state (e.g. "Punjab", "National")
  regions:      string[]  // All regions for this event (multiple if merged)
  isMerged:     boolean   // true when this event appears in 2+ tabs
}

/* ── Request to /api/generate/stream ───────────────────────── */
export interface GenerateRequest {
  message:   string
  eventId?:  string
  platform:  'linkedin' | 'whatsapp' | 'email'
  tone?:     string
}

/* ── API route response envelope ───────────────────────────── */
export interface EventsApiResponse {
  events:      SheetEvent[]
  error?:      string
  source:      'sheets' | 'fallback' | 'error'
  tabsLoaded?: string[]
  totalRaw?:   number
}
