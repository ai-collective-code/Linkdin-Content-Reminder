'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Sparkles,
  Eye,
  BarChart3,
  CheckCircle2,
  Circle,
  Zap,
  Star,
  Plus,
  Filter,
  Share2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GlassCard } from '@/components/shared/glass-card'
import { GradientBadge } from '@/components/shared/gradient-badge'
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from '@/lib/animations'
import type { SheetEvent, EventsApiResponse } from '@/types/sheets'

/* ── Types ─────────────────────────────────────────────────── */
type PostType = 'festival' | 'thought-leadership' | 'product' | 'engagement'

interface CalendarEvent {
  id: string
  title: string
  preview: string
  date: number    // day of month
  month: number   // 0-indexed
  year: number
  type: PostType
  status: 'scheduled' | 'published' | 'draft'
  platform: string
  keywords: string[]
  daysUntil: number
  priority: string
  state:    string
  regions:  string[]
  isMerged: boolean
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ── Map SheetEvent → CalendarEvent ─────────────────────────── */
function sheetEventToCalendarEvent(e: SheetEvent): CalendarEvent | null {
  if (!e.festivalDate) return null
  const d = new Date(e.festivalDate)
  if (isNaN(d.getTime())) return null

  const priorityLower = e.priority?.toLowerCase() ?? ''
  const type: PostType =
    priorityLower === 'high'   ? 'festival'
    : priorityLower === 'medium' ? 'thought-leadership'
    : priorityLower === 'low'    ? 'engagement'
    : 'festival'

  const statusRaw = e.status?.toLowerCase() ?? ''
  const status: CalendarEvent['status'] =
    statusRaw === 'published' ? 'published'
    : statusRaw === 'draft'   ? 'draft'
    : 'scheduled'

  return {
    id:        e.id,
    title:     e.event || e.festival || 'Untitled',
    preview:   e.insight || e.hook || e.campaignAngle || '',
    date:      d.getDate(),
    month:     d.getMonth(),
    year:      d.getFullYear(),
    type,
    status,
    platform:  e.suggestedPlatform || 'LinkedIn',
    keywords:  e.keywords,
    daysUntil: e.daysUntil,
    priority:  e.priority,
    state:     e.state    ?? e.region ?? '',
    regions:   e.regions  ?? [e.region ?? ''],
    isMerged:  e.isMerged ?? false,
  }
}

/* ── Post type styling ─────────────────────────────────────── */
const TYPE_CONFIG: Record<PostType, {
  label: string
  bg: string
  text: string
  border: string
  dot: string
  icon: React.ReactNode
}> = {
  festival: {
    label: 'Festival',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/25',
    dot: 'bg-amber-400',
    icon: <span className="text-[10px]">🎉</span>,
  },
  'thought-leadership': {
    label: 'Thought Leadership',
    bg: 'bg-purple/10',
    text: 'text-purple-400',
    border: 'border-purple/25',
    dot: 'bg-purple',
    icon: <Star className="w-2.5 h-2.5" />,
  },
  product: {
    label: 'Product',
    bg: 'bg-blue-accent/10',
    text: 'text-blue-400',
    border: 'border-blue-accent/25',
    dot: 'bg-blue-accent',
    icon: <Zap className="w-2.5 h-2.5" />,
  },
  engagement: {
    label: 'Engagement',
    bg: 'bg-cyan/10',
    text: 'text-cyan-400',
    border: 'border-cyan/25',
    dot: 'bg-cyan',
    icon: <BarChart3 className="w-2.5 h-2.5" />,
  },
}

const STATUS_CONFIG = {
  scheduled: { icon: <Clock className="w-3 h-3 text-cyan-400" />, label: 'Scheduled', color: 'text-cyan-400' },
  published: { icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />, label: 'Published', color: 'text-emerald-400' },
  draft:     { icon: <Circle className="w-3 h-3 text-white/30" />, label: 'Draft', color: 'text-white/40' },
}

/* ── Calendar helpers ──────────────────────────────────────── */
function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(month: number, year: number) {
  const d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

/* ── Calendar post pill ─────────────────────────────────────── */
function CalendarPostPill({ event, onClick, isSelected }: {
  event: CalendarEvent
  onClick: () => void
  isSelected: boolean
}) {
  const cfg = TYPE_CONFIG[event.type]
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full text-left px-2 py-1.5 rounded-md border text-[10px] leading-tight
        transition-all cursor-pointer group
        ${cfg.bg} ${cfg.border}
        ${isSelected ? 'ring-1 ring-white/20' : ''}
      `}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span className={`${cfg.dot} w-1.5 h-1.5 rounded-full shrink-0`} />
        <span className={`${cfg.text} font-semibold truncate`}>{event.priority}</span>
      </div>
      <p className="text-white/70 truncate leading-tight">{event.title}</p>
    </motion.button>
  )
}

/* ── Event detail modal ─────────────────────────────────────── */
function EventDetailCard({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const cfg = TYPE_CONFIG[event.type]
  const status = STATUS_CONFIG[event.status]
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <GlassCard
        className="relative w-full max-w-md z-10 p-0 overflow-hidden"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b border-white/6 ${cfg.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {cfg.label}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-white/50">
                  {status.icon}
                  <span className={status.color}>{status.label}</span>
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug">{event.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 transition-colors mt-0.5 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Date + platform */}
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {MONTH_NAMES[event.month]} {event.date}, {event.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              {event.platform}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {event.daysUntil}d away
            </span>
          </div>

          {/* Preview / insight */}
          {event.preview && (
            <div className="bg-white/3 rounded-lg p-3 border border-white/6">
              <p className="text-xs text-white/70 leading-relaxed italic">
                &ldquo;{event.preview}&rdquo;
              </p>
            </div>
          )}

          {/* Keywords */}
          {event.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.keywords.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/50">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/6 flex items-center gap-2">
          <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-purple/20 text-purple border border-purple/30 hover:bg-purple/30 transition-colors">
            Generate Content
          </button>
          <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-white/5 text-white/70 border border-white/10 hover:bg-white/8 transition-colors">
            View in Workspace
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/* ── Queue item ─────────────────────────────────────────────── */
function QueueItem({ event }: { event: CalendarEvent }) {
  const cfg = TYPE_CONFIG[event.type]
  const status = STATUS_CONFIG[event.status]
  return (
    <motion.div
      variants={staggerItem}
      className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0 group cursor-pointer hover:bg-white/2 -mx-2 px-2 rounded-lg transition-colors"
    >
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white/80 truncate leading-snug">{event.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-white/40 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {MONTH_NAMES[event.month]?.slice(0, 3)} {event.date}
          </span>
          <span className="text-[10px] text-white/40">{event.platform}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {status.icon}
      </div>
    </motion.div>
  )
}

/* ── Month stat ─────────────────────────────────────────────── */
function MonthStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-white/50 mt-0.5">{label}</p>
      <p className="text-[9px] text-white/30">{sub}</p>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────── */
export default function LinkedInCalendarPage() {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [filterType, setFilterType]       = useState<PostType | 'all'>('all')
  const [stateFilter, setStateFilter]     = useState('All')

  useEffect(() => {
    fetch('/api/sheets/events')
      .then(r => r.json())
      .then((data: EventsApiResponse) => {
        const mapped = (data.events ?? [])
          .map(sheetEventToCalendarEvent)
          .filter((e): e is CalendarEvent => e !== null)
        setAllEvents(mapped)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const daysInMonth = getDaysInMonth(viewMonth, viewYear)
  const firstDow = getFirstDayOfWeek(viewMonth, viewYear)

  const postsByDate = allEvents.reduce<Record<number, CalendarEvent[]>>((acc, event) => {
    if (event.month === viewMonth && event.year === viewYear) {
      if (!acc[event.date]) acc[event.date] = []
      acc[event.date].push(event)
    }
    return acc
  }, {})

  const states = ['All', ...([...new Set(allEvents.map(e => e.state).filter(Boolean))].sort())]

  const filteredPostsByDate = Object.entries(postsByDate).reduce<Record<number, CalendarEvent[]>>((acc, [day, events]) => {
    const filtered = events.filter(e => {
      const matchType  = filterType === 'all' || e.type === filterType
      const matchState = stateFilter === 'All' || e.state === stateFilter
      return matchType && matchState
    })
    if (filtered.length > 0) acc[Number(day)] = filtered
    return acc
  }, {})

  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDow + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  const upcomingEvents = allEvents
    .filter(e => e.daysUntil > 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5)

  const highPriorityEvents = allEvents.filter(e => e.priority?.toLowerCase() === 'high').slice(0, 3)

  const totalScheduled = allEvents.filter(e => e.status === 'scheduled').length
  const totalDraft     = allEvents.filter(e => e.status === 'draft').length
  const totalPublished = allEvents.filter(e => e.status === 'published').length

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const today = now.getDate()
  const isCurrentMonthYear = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Page header ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="shrink-0 px-6 pt-6 pb-4 border-b border-white/5"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Content Planner</span>
              </div>
              <h1 className="text-xl font-bold text-white">Festival Calendar</h1>
              <p className="text-sm text-white/40 mt-0.5">
                India-wide cultural events — {states.length > 1 ? `${states.length - 1} states` : 'loading…'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading sheet data...
                </div>
              )}
              {!loading && allEvents.length > 0 && (
                <GradientBadge variant="cyan" className="text-xs">
                  {allEvents.length} events loaded
                </GradientBadge>
              )}
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 bg-white/5 border border-white/10 rounded-lg hover:bg-white/8 transition-colors">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple to-blue-accent rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-3.5 h-3.5" />
                New Event
              </button>
            </div>
          </div>

          {/* Month stats row */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-8 mt-4 pt-4 border-t border-white/5"
          >
            <MonthStat label="Scheduled" value={String(totalScheduled)} sub="total events" color="text-cyan-400" />
            <div className="w-px h-8 bg-white/6" />
            <MonthStat label="Drafts" value={String(totalDraft)} sub="need review" color="text-amber-400" />
            <div className="w-px h-8 bg-white/6" />
            <MonthStat label="Published" value={String(totalPublished)} sub="completed" color="text-emerald-400" />
            <div className="w-px h-8 bg-white/6" />
            <MonthStat
              label="High Priority"
              value={String(allEvents.filter(e => e.priority?.toLowerCase() === 'high').length)}
              sub="urgent events"
              color="text-amber-400"
            />
          </motion.div>
        </motion.div>

        {/* ── Content area ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {error ? (
            <div className="flex items-center gap-3 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : (
            <div className="flex gap-5 pt-5 h-full">

              {/* ── Left: Calendar ── */}
              <div className="flex-1 min-w-0">
                {/* Month nav + type filter */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-base font-semibold text-white">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </h2>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Type filter pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                        filterType === 'all'
                          ? 'bg-white/12 text-white border-white/20'
                          : 'bg-white/3 text-white/40 border-white/8 hover:border-white/15'
                      }`}
                    >
                      All
                    </button>
                    {(Object.entries(TYPE_CONFIG) as [PostType, typeof TYPE_CONFIG[PostType]][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setFilterType(key)}
                        className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                          filterType === key
                            ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                            : 'bg-white/3 text-white/40 border-white/8 hover:border-white/15'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State filter pills */}
                {states.length > 1 && (
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <span className="text-[9px] text-white/30 mr-0.5">State:</span>
                    {states.map(s => (
                      <button
                        key={s}
                        onClick={() => setStateFilter(s)}
                        className={`px-2.5 py-0.5 text-[9px] font-semibold rounded-lg border transition-colors ${
                          stateFilter === s
                            ? 'bg-white/12 text-white border-white/20'
                            : 'bg-white/3 text-white/30 border-white/8 hover:border-white/15 hover:text-white/60'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Calendar grid */}
                <GlassCard padding="none" className="overflow-hidden">
                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 border-b border-white/6">
                    {DAY_LABELS.map(d => (
                      <div key={d} className="py-2.5 text-center text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                        {d}
                      </div>
                    ))}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16 text-white/30">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm">Loading events from sheet...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-7">
                      {cells.map((day, idx) => {
                        const events = day ? (filteredPostsByDate[day] ?? []) : []
                        const isToday = isCurrentMonthYear && day === today
                        const hasPosts = events.length > 0

                        return (
                          <div
                            key={idx}
                            className={`
                              min-h-[88px] p-1.5 border-b border-r border-white/4
                              ${day === null ? 'bg-white/1' : 'hover:bg-white/2'}
                              ${isToday ? 'bg-purple/4' : ''}
                              transition-colors
                            `}
                          >
                            {day !== null && (
                              <>
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`
                                    text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full
                                    ${isToday
                                      ? 'bg-purple text-white text-[10px]'
                                      : hasPosts ? 'text-white/80' : 'text-white/30'}
                                  `}>
                                    {day}
                                  </span>
                                  {hasPosts && (
                                    <span className="text-[8px] text-white/30">{events.length}</span>
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  {events.map(event => (
                                    <CalendarPostPill
                                      key={event.id}
                                      event={event}
                                      onClick={() => setSelectedEvent(event)}
                                      isSelected={selectedEvent?.id === event.id}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </GlassCard>

                {/* Legend */}
                <div className="flex items-center gap-5 mt-3 flex-wrap">
                  {(Object.entries(TYPE_CONFIG) as [PostType, typeof TYPE_CONFIG[PostType]][]).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-[10px] text-white/40">{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: Sidebar ── */}
              <div className="w-64 shrink-0 space-y-4">
                {/* Upcoming queue */}
                <GlassCard padding="none" className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      Upcoming
                    </h3>
                    <GradientBadge variant="cyan" className="text-[9px] px-2 py-0.5">
                      {upcomingEvents.length} events
                    </GradientBadge>
                  </div>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="px-4 py-2"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2 py-4 text-white/30 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading...
                      </div>
                    ) : upcomingEvents.length === 0 ? (
                      <p className="text-[10px] text-white/30 py-3">No upcoming events found.</p>
                    ) : (
                      upcomingEvents.map(event => (
                        <QueueItem key={event.id} event={event} />
                      ))
                    )}
                  </motion.div>
                </GlassCard>

                {/* High priority */}
                <GlassCard padding="none" className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      High Priority
                    </h3>
                  </div>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="p-3 space-y-2"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2 py-2 text-white/30 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading...
                      </div>
                    ) : highPriorityEvents.length === 0 ? (
                      <p className="text-[10px] text-white/30 py-2">No high priority events.</p>
                    ) : (
                      highPriorityEvents.map(event => (
                        <motion.div
                          key={event.id}
                          variants={staggerItem}
                          onClick={() => setSelectedEvent(event)}
                          className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/15 cursor-pointer hover:border-amber-500/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px]">🎉</span>
                            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">High Priority</span>
                          </div>
                          <p className="text-xs font-medium text-white/80 mb-1 leading-snug">{event.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/50">
                              {MONTH_NAMES[event.month]?.slice(0, 3)} {event.date}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                              {event.daysUntil}d away
                            </span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </GlassCard>

                {/* Summary */}
                <GlassCard padding="none" className="overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <h3 className="text-xs font-semibold text-white/80 flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                      Event Summary
                    </h3>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {[
                      { label: 'Total Events', value: String(allEvents.length), color: 'text-white' },
                      { label: 'High Priority', value: String(allEvents.filter(e => e.priority?.toLowerCase() === 'high').length), color: 'text-amber-400' },
                      { label: 'Scheduled', value: String(totalScheduled), color: 'text-cyan-400' },
                      { label: 'Drafts', value: String(totalDraft), color: 'text-white/50' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-[11px] text-white/50">{item.label}</span>
                        <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
