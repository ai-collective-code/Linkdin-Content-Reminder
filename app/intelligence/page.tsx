'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, CheckCircle2, Clock, Zap, Loader2, RefreshCw,
  Share2, MessageCircle, Mail, AlertCircle, Copy, Check,
  ChevronDown, ChevronUp, Globe, Sparkles, Map,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GlassCard } from '@/components/shared/glass-card'
import { GradientBadge } from '@/components/shared/gradient-badge'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { SheetEvent, EventsApiResponse } from '@/types/sheets'
import type { ContentPlatform } from '@/lib/prompt-templates'

/* ─── types ─────────────────────────────────────────────────── */
interface Campaign {
  linkedin: string
  whatsapp: string
  email:    string
  generatedAt: string
}

interface CampaignEntry {
  status: 'idle' | 'generating' | 'ready' | 'error'
  data?: Campaign
  generatingPlatform?: ContentPlatform
  error?: string
}

/* ─── platform config ───────────────────────────────────────── */
const PLATFORMS: { id: ContentPlatform; label: string; icon: typeof Share2; color: string; badge: string }[] = [
  { id: 'linkedin', label: 'LinkedIn',  icon: Share2,        color: 'text-blue-accent',  badge: 'bg-blue-accent/15 text-blue-accent border-blue-accent/25' },
  { id: 'whatsapp', label: 'WhatsApp',  icon: MessageCircle, color: 'text-emerald-400',  badge: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/25' },
  { id: 'email',    label: 'Email',     icon: Mail,          color: 'text-amber-400',    badge: 'bg-amber-400/15 text-amber-400 border-amber-400/25' },
]

/* ─── localStorage helpers ──────────────────────────────────── */
function getCachedCampaign(eventId: string): Campaign | null {
  try {
    const today = new Date().toISOString().split('T')[0]
    const raw = localStorage.getItem(`cie_campaign_${eventId}_${today}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setCachedCampaign(eventId: string, campaign: Campaign) {
  try {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`cie_campaign_${eventId}_${today}`, JSON.stringify(campaign))
  } catch {}
}

/* ─── state colour helper (same palette as workspace) ───────── */
const STATE_COLORS: Record<string, string> = {
  'Punjab':           'bg-amber-500/12 text-amber-400/90 border-amber-500/20',
  'Gujarat':          'bg-cyan-500/12 text-cyan-400/90 border-cyan-500/20',
  'West Bengal':      'bg-green-500/12 text-green-400/90 border-green-500/20',
  'Odisha':           'bg-orange-500/12 text-orange-400/90 border-orange-500/20',
  'Bihar Jharkhand':  'bg-red-500/12 text-red-400/90 border-red-500/20',
  'Bihar & Jharkhand':'bg-red-500/12 text-red-400/90 border-red-500/20',
  'National':         'bg-purple/12 text-purple/90 border-purple/20',
  'Maharashtra':      'bg-yellow-500/12 text-yellow-400/90 border-yellow-500/20',
  'Tamil Nadu':       'bg-pink-500/12 text-pink-400/90 border-pink-500/20',
  'Rajasthan':        'bg-rose-500/12 text-rose-400/90 border-rose-500/20',
  'Uttar Pradesh':    'bg-indigo-500/12 text-indigo-400/90 border-indigo-500/20',
  'Karnataka':        'bg-violet-500/12 text-violet-400/90 border-violet-500/20',
}
function stateColor(s: string) {
  return STATE_COLORS[s] ?? 'bg-white/6 text-white/50 border-white/10'
}

/* ─── urgency helpers ───────────────────────────────────────── */
function urgencyLabel(d: number): { label: string; cls: string; pulse: boolean } | null {
  if (d <= 0)  return null
  if (d === 1) return { label: 'TOMORROW', cls: 'bg-red-500/15 text-red-400 border-red-500/30', pulse: true }
  if (d <= 3)  return { label: `${d}D LEFT`, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30', pulse: true }
  if (d <= 7)  return { label: `${d}D`, cls: 'bg-amber-500/10 text-amber-400/80 border-amber-500/20', pulse: false }
  if (d <= 14) return { label: `${d}D`, cls: 'bg-white/6 text-white/50 border-white/12', pulse: false }
  if (d <= 30) return { label: `${d}D`, cls: 'bg-white/4 text-white/35 border-white/8', pulse: false }
  return null
}

/* ─── stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-glass bg-surface-1/30 px-4 py-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-xs font-medium text-foreground/70 mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  )
}

/* ─── Campaign Event Card ───────────────────────────────────── */
function CampaignCard({
  event,
  entry,
  onGenerate,
}: {
  event: SheetEvent
  entry: CampaignEntry
  onGenerate: (event: SheetEvent) => void
}) {
  const [expanded, setExpanded]       = useState(false)
  const [activeTab, setActiveTab]     = useState<ContentPlatform>('linkedin')
  const [copiedPlatform, setCopied]   = useState<ContentPlatform | null>(null)

  const urgency    = urgencyLabel(event.daysUntil)
  const isReady    = entry.status === 'ready'
  const isGen      = entry.status === 'generating'
  const data       = entry.data

  const handleCopy = async (platform: ContentPlatform) => {
    const text = data?.[platform] ?? ''
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(platform)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        'rounded-2xl border transition-all duration-200',
        isReady ? 'border-emerald-500/20 bg-emerald-500/3' :
        isGen   ? 'border-amber-500/20 bg-amber-500/3' :
                  'border-glass bg-surface-1/20',
      )}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 p-4">
        {/* Status icon */}
        <div className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl border mt-0.5',
          isReady ? 'border-emerald-500/25 bg-emerald-500/10' :
          isGen   ? 'border-amber-500/25 bg-amber-500/10 animate-pulse' :
                    'border-glass bg-surface-1',
        )}>
          {isReady ? <CheckCircle2 className="size-4 text-emerald-400" /> :
           isGen   ? <Loader2 className="size-4 text-amber-400 animate-spin" /> :
                     <Cpu className="size-4 text-muted-foreground/40" />}
        </div>

        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground leading-snug">{event.event || event.festival}</p>
            {urgency && (
              <span className={cn(
                'flex-none rounded-md border px-1.5 py-0.5 text-[9px] font-bold tracking-wide',
                urgency.cls, urgency.pulse && 'animate-pulse',
              )}>
                {urgency.label}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            {(event.regions ?? [event.state ?? event.region]).slice(0, 3).map(r => r && (
              <span key={r} className={cn('text-[9px] font-semibold rounded border px-1.5 py-0.5', stateColor(r))}>
                {r}
              </span>
            ))}
            {(event.regions?.length ?? 0) > 3 && (
              <span className="text-[9px] text-muted-foreground/50">+{event.regions.length - 3}</span>
            )}
            {event.isMerged && (
              <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-400/80 border border-amber-500/20 rounded px-1.5 py-0.5">
                Multi-state
              </span>
            )}
            {event.festivalDate && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-1">
                <Clock className="size-2.5" />
                {event.festivalDate}
              </span>
            )}
          </div>

          {/* Platform status dots */}
          <div className="mt-2.5 flex items-center gap-2">
            {PLATFORMS.map(p => {
              const pReady  = isReady && !!data?.[p.id]
              const pActive = isGen && entry.generatingPlatform === p.id
              return (
                <div key={p.id} className="flex items-center gap-1">
                  <span className={cn(
                    'size-1.5 rounded-full transition-all',
                    pReady  ? 'bg-emerald-400' :
                    pActive ? 'bg-amber-400 animate-pulse' :
                              'bg-white/15',
                  )} />
                  <span className={cn(
                    'text-[10px] font-medium',
                    pReady  ? 'text-emerald-400' :
                    pActive ? 'text-amber-400' :
                              'text-muted-foreground/40',
                  )}>
                    {p.label}
                  </span>
                </div>
              )
            })}
            {isReady && data?.generatedAt && (
              <span className="ml-auto text-[9px] text-muted-foreground">
                {new Date(data.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {!isReady && !isGen && (
            <button
              onClick={() => onGenerate(event)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple/20 to-cyan/10 border border-purple/25 px-3 py-1.5 text-[10px] font-semibold text-purple hover:from-purple/30 hover:to-cyan/20 transition-all"
            >
              <Zap className="size-3" /> Generate
            </button>
          )}
          {isGen && (
            <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-1.5 text-[10px] font-medium text-amber-400">
              <Loader2 className="size-3 animate-spin" /> Generating…
            </span>
          )}
          {isReady && (
            <button
              onClick={() => onGenerate(event)}
              className="flex items-center gap-1.5 rounded-lg border border-glass bg-surface-1/50 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all"
              title="Regenerate"
            >
              <RefreshCw className="size-3" />
            </button>
          )}
          {isReady && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 rounded-lg border border-glass bg-surface-1/50 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? 'Hide' : 'Preview'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded content preview */}
      <AnimatePresence>
        {expanded && isReady && data && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-glass overflow-hidden"
          >
            {/* Platform tabs */}
            <div className="flex items-center gap-1 px-4 pt-3">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    activeTab === p.id ? cn('ring-1', p.badge) : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
                  )}
                >
                  <p.icon className="size-3.5" />
                  {p.label}
                  {data[p.id] && <span className="size-1.5 rounded-full bg-emerald-400" />}
                </button>
              ))}
              <button
                onClick={() => handleCopy(activeTab)}
                className={cn(
                  'ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-all',
                  copiedPlatform === activeTab
                    ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400'
                    : 'border-glass bg-surface-1/50 text-muted-foreground hover:border-glass-strong hover:text-foreground',
                )}
              >
                {copiedPlatform === activeTab ? <><Check className="size-3" /> Copied</> : <><Copy className="size-3" /> Copy</>}
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
              <div
                className="rounded-xl border border-glass bg-surface-1/30 p-4"
                style={{ boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 4%)' }}
              >
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {data[activeTab] || 'Content not available for this platform.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function CampaignStatusPage() {
  const [events, setEvents]           = useState<SheetEvent[]>([])
  const [loading, setLoading]         = useState(true)
  const [fetchError, setError]        = useState<string | null>(null)
  const [campaigns, setCampaigns]     = useState<Record<string, CampaignEntry>>({})
  const [filter, setFilter]           = useState<'all' | 'ready' | 'pending' | 'urgent'>('all')
  const [stateFilter, setStateFilter] = useState('All')
  const [tabsLoaded, setTabsLoaded]   = useState<string[]>([])

  // Load events + restore cached campaigns
  const loadEvents = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/sheets/events?refresh=1')
      .then(r => r.json() as Promise<EventsApiResponse>)
      .then(data => {
        setEvents(data.events ?? [])
        setTabsLoaded(data.tabsLoaded ?? [])
        if (data.error) setError(data.error)
        const restored: Record<string, CampaignEntry> = {}
        for (const ev of data.events ?? []) {
          const cached = getCachedCampaign(ev.id)
          if (cached) restored[ev.id] = { status: 'ready', data: cached }
        }
        setCampaigns(restored)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadEvents() }, [loadEvents])

  // Generate campaign via batch API
  const generateCampaign = useCallback(async (event: SheetEvent) => {
    setCampaigns(prev => ({
      ...prev,
      [event.id]: { status: 'generating' },
    }))

    try {
      const res = await fetch('/api/generate/batch', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ eventId: event.id }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const partial: Partial<{ linkedin: string; whatsapp: string; email: string }> = {}

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6)) as {
              platform?: string; status?: string; content?: string; done?: boolean; error?: string
            }
            if (data.platform && data.status === 'generating') {
              setCampaigns(prev => ({
                ...prev,
                [event.id]: { ...prev[event.id], status: 'generating', generatingPlatform: data.platform as ContentPlatform },
              }))
            }
            if (data.platform && data.content) {
              partial[data.platform as 'linkedin' | 'whatsapp' | 'email'] = data.content
              setCampaigns(prev => ({
                ...prev,
                [event.id]: {
                  status: 'generating',
                  generatingPlatform: data.platform as ContentPlatform,
                  data: {
                    linkedin: partial.linkedin ?? '',
                    whatsapp: partial.whatsapp ?? '',
                    email:    partial.email    ?? '',
                    generatedAt: new Date().toISOString(),
                  },
                },
              }))
            }
            if (data.done) {
              const campaign: Campaign = {
                linkedin:    partial.linkedin ?? '',
                whatsapp:    partial.whatsapp ?? '',
                email:       partial.email    ?? '',
                generatedAt: new Date().toISOString(),
              }
              setCampaigns(prev => ({ ...prev, [event.id]: { status: 'ready', data: campaign } }))
              setCachedCampaign(event.id, campaign)
            }
            if (data.error) throw new Error(data.error)
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setCampaigns(prev => ({ ...prev, [event.id]: { status: 'error', error: (err as Error).message } }))
    }
  }, [])

  // Build state list for filter pills
  const states = ['All', ...([...new Set(events.map(e => e.state).filter(Boolean))].sort())]

  // Filter + sort
  const sorted = [...events].sort((a, b) => {
    if (a.daysUntil > 0 && b.daysUntil > 0) return a.daysUntil - b.daysUntil
    if (a.daysUntil > 0) return -1
    if (b.daysUntil > 0) return 1
    return 0
  })

  const visible = sorted.filter(e => {
    const matchState  = stateFilter === 'All' || e.state === stateFilter
    const matchStatus =
      filter === 'ready'   ? campaigns[e.id]?.status === 'ready' :
      filter === 'pending' ? !campaigns[e.id] || campaigns[e.id].status === 'idle' :
      filter === 'urgent'  ? e.daysUntil > 0 && e.daysUntil <= 7 :
      true
    return matchState && matchStatus
  })

  const readyCount   = Object.values(campaigns).filter(c => c.status === 'ready').length
  const genCount     = Object.values(campaigns).filter(c => c.status === 'generating').length
  const urgentCount  = events.filter(e => e.daysUntil > 0 && e.daysUntil <= 7).length
  const pendingCount = events.length - readyCount

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex-none border-b border-glass px-6 pt-6 pb-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="size-4 text-purple" />
                <span className="text-xs font-semibold text-purple uppercase tracking-widest">Campaign Engine</span>
                {genCount > 0 && (
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[9px] font-medium text-amber-400">
                    <Loader2 className="size-2.5 animate-spin" /> {genCount} generating
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-foreground">Campaign Status Board</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                India-wide intelligence — {tabsLoaded.length > 0 ? `${tabsLoaded.length} states loaded` : 'loading sheets…'}
              </p>
              {tabsLoaded.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <Map className="size-3 text-muted-foreground/50 shrink-0" />
                  {tabsLoaded.map(t => (
                    <span key={t} className={cn('text-[9px] font-semibold rounded border px-1.5 py-0.5', stateColor(
                      t.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                    ))}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadEvents}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-glass bg-surface-1/50 px-3 py-2 text-xs font-medium text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all disabled:opacity-40"
              >
                <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => {
                  const pending = sorted.filter(e => e.daysUntil > 0 && e.daysUntil <= 14 && campaigns[e.id]?.status !== 'ready' && campaigns[e.id]?.status !== 'generating').slice(0, 3)
                  pending.forEach(e => generateCampaign(e))
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-purple to-cyan px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Zap className="size-3.5" />
                Auto-Generate Urgent
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-3 mt-4">
            <StatCard label="States" value={tabsLoaded.length || states.length - 1} sub="sheets loaded" color="text-purple" />
            <StatCard label="Total Events" value={events.length} sub="merged & deduped" color="text-foreground" />
            <StatCard label="Campaigns Ready" value={readyCount} sub="generated today" color="text-emerald-400" />
            <StatCard label="Urgent" value={urgentCount} sub="within 7 days" color="text-amber-400" />
            <StatCard label="Pending" value={pendingCount} sub="need generation" color="text-muted-foreground" />
          </div>
        </motion.div>

        {/* Filter bar + content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Status filter pills */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {([
              { key: 'all',     label: 'All Events' },
              { key: 'urgent',  label: `Urgent (${urgentCount})` },
              { key: 'ready',   label: `Ready (${readyCount})` },
              { key: 'pending', label: `Pending (${pendingCount})` },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200',
                  filter === f.key
                    ? 'bg-purple/15 text-purple border-purple/30 ring-1 ring-purple/20'
                    : 'border-glass text-muted-foreground hover:border-glass-strong hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* State filter pills */}
          {states.length > 1 && (
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              <span className="text-[10px] text-muted-foreground/50 mr-0.5">State:</span>
              {states.map(s => (
                <button
                  key={s}
                  onClick={() => setStateFilter(s)}
                  className={cn(
                    'rounded-lg border px-2.5 py-0.5 text-[10px] font-medium transition-all duration-200',
                    stateFilter === s
                      ? s === 'All'
                        ? 'bg-purple/15 text-purple border-purple/25'
                        : cn(stateColor(s), 'ring-1 ring-white/10')
                      : 'border-glass text-muted-foreground hover:border-glass-strong hover:text-foreground/80',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {fetchError && (
            <div className="flex items-center gap-3 mb-4 p-4 rounded-xl border border-red-500/20 bg-red-500/8">
              <AlertCircle className="size-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{fetchError}</p>
            </div>
          )}

          {/* Loading skeletons */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl border border-glass bg-surface-1/20 animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Globe className="size-10 mb-3 text-muted-foreground/25" />
              <p className="text-sm font-medium text-muted-foreground/60">No events match this filter</p>
              <button
                onClick={() => setFilter('all')}
                className="mt-2 text-xs text-purple hover:text-purple/80 transition-colors"
              >
                Show all events
              </button>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {visible.map(event => (
                <CampaignCard
                  key={event.id}
                  event={event}
                  entry={campaigns[event.id] ?? { status: 'idle' }}
                  onGenerate={generateCampaign}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
