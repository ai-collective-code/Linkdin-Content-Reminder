'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ElementType } from 'react'
import {
  Search, Globe, Hash, Copy, Check, RefreshCw, Sparkles,
  Bot, Loader2, Send, FileText,
  Mail, MessageCircle, Share2, AlertCircle, X, Clock,
  Zap, AlertTriangle, Info, CheckCircle2, BellRing, Cpu, Timer,
} from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GradientBadge, StatusBadge } from '@/components/shared/gradient-badge'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'
import { cn } from '@/lib/utils'
import type { SheetEvent, EventsApiResponse } from '@/types/sheets'
import type { ContentPlatform } from '@/lib/prompt-templates'

/* ─── types ─────────────────────────────────────────────────── */
interface GeneratedOutput {
  id: string
  platform: ContentPlatform
  content: string
  eventName: string
  prompt: string
  createdAt: Date
}

interface Campaign {
  linkedin: string
  whatsapp: string
  email: string
  generatedAt: Date
}

interface CampaignEntry {
  status: 'idle' | 'generating' | 'ready' | 'error'
  data?: Campaign
  generatingPlatform?: ContentPlatform
  error?: string
}

type CampaignStore = Record<string, CampaignEntry>

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'ai'
  at: Date
}

/* ─── platform config ───────────────────────────────────────── */
const PLATFORMS: { id: ContentPlatform; label: string; icon: ElementType; color: string; badge: string }[] = [
  { id: 'linkedin', label: 'LinkedIn',  icon: Share2,        color: 'text-blue-accent',  badge: 'bg-blue-accent/15 text-blue-accent border-blue-accent/25' },
  { id: 'whatsapp', label: 'WhatsApp',  icon: MessageCircle, color: 'text-emerald-400',  badge: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/25' },
  { id: 'email',    label: 'Email',     icon: Mail,          color: 'text-amber-400',    badge: 'bg-amber-400/15 text-amber-400 border-amber-400/25' },
]

const TONES = ['Professional', 'Conversational', 'Inspirational', 'Urgent', 'Storytelling', 'Witty']

/* ─── helpers ───────────────────────────────────────────────── */
function getUrgencyConfig(daysUntil: number): { label: string; cls: string; pulse: boolean } | null {
  if (daysUntil <= 0)  return null
  if (daysUntil === 1) return { label: 'TOMORROW', cls: 'bg-red-500/15 text-red-400 border-red-500/30', pulse: true }
  if (daysUntil <= 3)  return { label: `${daysUntil}D LEFT`, cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30', pulse: true }
  if (daysUntil <= 7)  return { label: `${daysUntil}D`, cls: 'bg-amber-500/10 text-amber-400/80 border-amber-500/20', pulse: false }
  if (daysUntil <= 14) return { label: `${daysUntil}D`, cls: 'bg-white/6 text-white/50 border-white/12', pulse: false }
  if (daysUntil <= 30) return { label: `${daysUntil}D`, cls: 'bg-white/4 text-white/35 border-white/8', pulse: false }
  return null
}

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

function getCachedCampaign(eventId: string): Campaign | null {
  try {
    const today = new Date().toISOString().split('T')[0]
    const raw = localStorage.getItem(`cie_campaign_${eventId}_${today}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...parsed, generatedAt: new Date(parsed.generatedAt) }
  } catch { return null }
}

function setCachedCampaign(eventId: string, campaign: Campaign) {
  try {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`cie_campaign_${eventId}_${today}`, JSON.stringify(campaign))
  } catch {}
}

/* ─── NotificationStrip ─────────────────────────────────────── */
const NOTIF_ICON: Record<Notification['type'], ElementType> = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  ai:      Sparkles,
}
const NOTIF_CLS: Record<Notification['type'], string> = {
  info:    'border-blue-accent/20 bg-blue-accent/8 text-blue-accent',
  success: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400',
  warning: 'border-amber-500/20 bg-amber-500/8 text-amber-400',
  ai:      'border-purple/20 bg-purple/8 text-purple-300',
}

function NotificationStrip({ notifications, onDismiss }: {
  notifications: Notification[]
  onDismiss: (id: string) => void
}) {
  if (notifications.length === 0) return null
  return (
    <div className="flex-none border-b border-glass bg-background/60 backdrop-blur-sm px-4 py-2 overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <BellRing className="size-3 text-muted-foreground shrink-0" />
        <AnimatePresence initial={false}>
          {notifications.slice(0, 4).map(n => {
            const Icon = NOTIF_ICON[n.type]
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -16, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-1 text-[11px] font-medium shrink-0',
                  NOTIF_CLS[n.type],
                )}
              >
                <Icon className="size-3 shrink-0" />
                <span>{n.message}</span>
                <button
                  onClick={() => onDismiss(n.id)}
                  className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="size-2.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── CampaignViewPanel ─────────────────────────────────────── */
function CampaignViewPanel({
  event,
  entry,
  onGenerate,
  onSwitchToManual,
}: {
  event: SheetEvent | null
  entry: CampaignEntry | undefined
  onGenerate: (event: SheetEvent) => void
  onSwitchToManual: () => void
}) {
  const [activeTab, setActiveTab] = useState<ContentPlatform>('linkedin')
  const [copiedPlatform, setCopiedPlatform] = useState<ContentPlatform | null>(null)

  const status      = entry?.status ?? 'idle'
  const data        = entry?.data
  const isGenerating = status === 'generating'
  const genPlatform  = entry?.generatingPlatform

  const content = data ? data[activeTab] : ''

  const handleCopy = async (platform: ContentPlatform) => {
    const text = data?.[platform] ?? ''
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedPlatform(platform)
    setTimeout(() => setCopiedPlatform(null), 2000)
  }

  // Platform tab readiness
  const platformReady = (p: ContentPlatform) => !!data?.[p]
  const platformGenerating = (p: ContentPlatform) => isGenerating && genPlatform === p

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Header */}
      <div className="flex-none border-b border-glass px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex size-6 items-center justify-center shrink-0">
              <div className={cn(
                'absolute size-6 rounded-full',
                isGenerating ? 'animate-ping bg-purple/30' : 'opacity-0',
              )} />
              <div className="relative flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan">
                <Cpu className="size-3 text-white" />
              </div>
            </div>
            <h2 className="text-sm font-semibold text-foreground">Campaign Engine</h2>
            {event && (
              <div className="flex items-center gap-1.5 rounded-lg border border-purple/25 bg-purple/8 px-2.5 py-1 min-w-0">
                <div className={cn('size-1.5 rounded-full', isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400')} />
                <span className="text-[10px] font-medium text-purple truncate max-w-[140px]">
                  {event.event}
                </span>
                {event.daysUntil > 0 && (
                  <span className="text-[10px] text-purple/60 shrink-0">{event.daysUntil}d</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isGenerating && <StatusBadge label="Generating…" status="active" />}
            {status === 'ready' && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                <CheckCircle2 className="size-3" /> 3 pieces ready
              </span>
            )}
            {event && (
              <button
                onClick={() => onGenerate(event)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-lg border border-glass bg-surface-1/50 px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all disabled:opacity-40"
              >
                <RefreshCw className={cn('size-3', isGenerating && 'animate-spin')} />
                Regenerate
              </button>
            )}
            <button
              onClick={onSwitchToManual}
              className="flex items-center gap-1.5 rounded-lg border border-glass bg-surface-1/50 px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all"
            >
              Manual Mode
            </button>
          </div>
        </div>

        {/* Platform tabs */}
        <div className="mt-3 flex items-center gap-1">
          {PLATFORMS.map(p => {
            const ready = platformReady(p.id)
            const generating = platformGenerating(p.id)
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  activeTab === p.id
                    ? cn('ring-1', p.badge)
                    : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
                )}
              >
                <p.icon className="size-3.5" />
                {p.label}
                {generating ? (
                  <Loader2 className="size-2.5 animate-spin text-amber-400" />
                ) : ready ? (
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                ) : isGenerating ? (
                  <span className="size-1.5 rounded-full bg-white/20" />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">

        {/* No event selected */}
        {!event && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Cpu className="size-8 mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground/60">No event selected</p>
            <p className="mt-1 text-xs text-muted-foreground/40">Select an event from the browser to generate its campaign</p>
          </div>
        )}

        {/* Idle — prompt to generate */}
        {event && status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-full flex-col items-center justify-center text-center"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-purple/20 blur-xl" />
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple/20 to-cyan/10 border border-purple/20">
                <Zap className="size-7 text-purple" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Auto-generate full campaign</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mb-4">
              Generate LinkedIn, WhatsApp, and Email content simultaneously using AI cultural intelligence.
            </p>
            <button
              onClick={() => onGenerate(event)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-purple to-cyan px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_oklch(0.560_0.268_279/25%)] hover:shadow-[0_0_28px_oklch(0.560_0.268_279/40%)] hover:scale-105 transition-all duration-200"
            >
              <Zap className="size-4" />
              Generate Campaign
            </button>
          </motion.div>
        )}

        {/* Generating state */}
        {event && isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Pipeline status */}
            <div className="rounded-xl border border-glass bg-surface-1/30 p-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Loader2 className="size-3 animate-spin text-purple" />
                AI Content Pipeline Running
              </p>
              <div className="space-y-3">
                {PLATFORMS.map(p => {
                  const done = !!data?.[p.id]
                  const active = genPlatform === p.id
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className={cn(
                        'flex size-6 items-center justify-center rounded-full border transition-all',
                        done   ? 'border-emerald-500/30 bg-emerald-500/10' :
                        active ? 'border-purple/30 bg-purple/10 animate-pulse' :
                                 'border-white/8 bg-surface-1',
                      )}>
                        {done ? (
                          <CheckCircle2 className="size-3 text-emerald-400" />
                        ) : active ? (
                          <Loader2 className="size-3 text-purple animate-spin" />
                        ) : (
                          <p.icon className="size-3 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          'text-xs font-medium',
                          done ? 'text-emerald-400' : active ? 'text-foreground' : 'text-muted-foreground/40',
                        )}>
                          {p.label}
                        </p>
                        <p className="text-[9px] text-muted-foreground/40">
                          {done ? 'Ready' : active ? 'Writing…' : 'Pending'}
                        </p>
                      </div>
                      {done && (
                        <span className="text-[9px] font-medium text-emerald-400 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5">
                          Done
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Partial content preview for completed platforms */}
            {data?.[activeTab] && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-xl border border-glass bg-surface-1/30 p-4"
                style={{ boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 4%)' }}
              >
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {data[activeTab]}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Ready state — show content */}
        {event && status === 'ready' && data && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Platform + copy actions */}
            <div className="flex items-center justify-between">
              {(() => {
                const p = PLATFORMS.find(pl => pl.id === activeTab)!
                return (
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', p.badge)}>
                    <p.icon className="size-3" />
                    {p.label} — {event.event}
                  </span>
                )
              })()}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(activeTab)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-all',
                    copiedPlatform === activeTab
                      ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400'
                      : 'border-glass bg-surface-1/50 text-muted-foreground hover:border-glass-strong hover:text-foreground',
                  )}
                >
                  {copiedPlatform === activeTab ? (
                    <><Check className="size-3" /> Copied</>
                  ) : (
                    <><Copy className="size-3" /> Copy</>
                  )}
                </button>
              </div>
            </div>

            {/* Content card */}
            <div
              className="relative rounded-xl border border-glass bg-surface-1/30 p-4"
              style={{ boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 4%), 0 2px 12px oklch(0 0 0 / 12%)' }}
            >
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {data[activeTab]}
              </p>
            </div>

            {/* Metadata */}
            {(event.emotion || event.audience || event.tone) && (
              <div className="flex items-center gap-3 flex-wrap">
                {event.emotion && (
                  <span className="text-[10px] text-muted-foreground">
                    Emotion: <span className="text-foreground/70">{event.emotion}</span>
                  </span>
                )}
                {event.audience && (
                  <span className="text-[10px] text-muted-foreground">
                    Audience: <span className="text-foreground/70">{event.audience}</span>
                  </span>
                )}
                {data.generatedAt && (
                  <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                    <Clock className="size-2.5" />
                    {data.generatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Error state */}
        {event && status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="size-7 mb-2 text-red-400/60" />
            <p className="text-xs font-medium text-red-400/80 mb-1">Campaign generation failed</p>
            <p className="text-[10px] text-muted-foreground mb-3">{entry?.error}</p>
            <button
              onClick={() => onGenerate(event)}
              className="flex items-center gap-1.5 rounded-lg border border-glass bg-surface-1/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all"
            >
              <RefreshCw className="size-3" /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── EventCard ─────────────────────────────────────────────── */
function EventCard({
  event,
  selected,
  onSelect,
  campaignEntry,
  onGenerateCampaign,
}: {
  event: SheetEvent
  selected: boolean
  onSelect: () => void
  campaignEntry?: CampaignEntry
  onGenerateCampaign: (event: SheetEvent) => void
}) {
  const urgency = getUrgencyConfig(event.daysUntil)
  const campStatus = campaignEntry?.status

  return (
    <motion.div
      variants={staggerItem}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
      className={cn(
        'w-full text-left rounded-xl border p-3 transition-all duration-200 cursor-pointer',
        'hover:border-glass-strong group',
        selected
          ? 'border-purple/40 bg-purple/8 ring-1 ring-purple/25'
          : 'border-glass glass-hover',
      )}
      style={selected ? { boxShadow: '0 0 0 1px oklch(0.560 0.268 279 / 25%), 0 4px 16px oklch(0.560 0.268 279 / 10%)' } : undefined}
    >
      {/* Row 1: name + urgency badge */}
      <div className="flex items-start justify-between gap-2">
        <p className={cn(
          'text-sm font-semibold truncate transition-colors',
          selected ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground',
        )}>
          {event.event}
        </p>
        {urgency && (
          <span className={cn(
            'flex-none rounded-md border px-1.5 py-0.5 text-[9px] font-bold tracking-wide',
            urgency.cls,
            urgency.pulse && 'animate-pulse',
          )}>
            {urgency.label}
          </span>
        )}
      </div>

      {/* Row 2: region badges */}
      <div className="mt-1.5 flex items-center gap-1 flex-wrap">
        {event.regions.slice(0, 3).map(r => (
          <span
            key={r}
            className={cn(
              'text-[9px] font-semibold rounded border px-1.5 py-0.5',
              stateColor(r),
            )}
          >
            {r}
          </span>
        ))}
        {event.regions.length > 3 && (
          <span className="text-[9px] text-muted-foreground/50">+{event.regions.length - 3}</span>
        )}
        {event.isMerged && (
          <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-400/80 border border-amber-500/20 rounded px-1.5 py-0.5">
            Multi-state
          </span>
        )}
      </div>

      {/* Row 3: keywords */}
      {event.keywords.length > 0 && (
        <div className="mt-2 flex items-center gap-1 overflow-hidden">
          <Hash className="size-2.5 shrink-0 text-muted-foreground/50" />
          <p className="text-[10px] text-muted-foreground truncate">
            {event.keywords.slice(0, 3).join(' · ')}
          </p>
        </div>
      )}

      {/* Row 4: campaign platform status dots */}
      {campStatus && campStatus !== 'idle' && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[9px] text-muted-foreground/50 mr-0.5">Campaign:</span>
          {PLATFORMS.map(p => {
            const ready = campStatus === 'ready' && !!campaignEntry?.data?.[p.id]
            const gen   = campStatus === 'generating' && campaignEntry?.generatingPlatform === p.id
            return (
              <span
                key={p.id}
                title={p.label}
                className={cn(
                  'size-2 rounded-full transition-all',
                  ready ? 'bg-emerald-400' :
                  gen   ? 'bg-amber-400 animate-pulse' :
                          'bg-white/15',
                )}
              />
            )
          })}
          {campStatus === 'generating' && (
            <span className="text-[9px] text-amber-400/80 ml-0.5">Generating…</span>
          )}
          {campStatus === 'ready' && (
            <span className="text-[9px] text-emerald-400/80 ml-0.5">Ready</span>
          )}
        </div>
      )}

      {/* Expanded: insight + generate button */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t border-purple/20 space-y-2"
        >
          {event.insight && (
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
              {event.insight}
            </p>
          )}
          <button
            onClick={e => { e.stopPropagation(); onGenerateCampaign(event) }}
            disabled={campStatus === 'generating'}
            className={cn(
              'w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-semibold transition-all duration-200',
              campStatus === 'generating'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed'
                : campStatus === 'ready'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15'
                  : 'bg-gradient-to-r from-purple/20 to-cyan/10 text-purple border border-purple/25 hover:from-purple/30 hover:to-cyan/20',
            )}
          >
            {campStatus === 'generating' ? (
              <><Loader2 className="size-3 animate-spin" /> Generating…</>
            ) : campStatus === 'ready' ? (
              <><CheckCircle2 className="size-3" /> View Campaign</>
            ) : (
              <><Zap className="size-3" /> Generate Campaign</>
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ─── EventBrowserPanel ─────────────────────────────────────── */
function EventBrowserPanel({
  events,
  loading,
  fetchError,
  selectedEvent,
  onSelect,
  onRetry,
  campaigns,
  onGenerateCampaign,
}: {
  events: SheetEvent[]
  loading: boolean
  fetchError: string | null
  selectedEvent: SheetEvent | null
  onSelect: (e: SheetEvent | null) => void
  onRetry: () => void
  campaigns: CampaignStore
  onGenerateCampaign: (event: SheetEvent) => void
}) {
  const [search, setSearch]           = useState('')
  const [stateFilter, setStateFilter] = useState('All')

  // Build sorted unique state list from loaded events
  const states = ['All', ...([...new Set(events.map(e => e.state).filter(Boolean))].sort())]
  const hasMultiState = events.some(e => e.isMerged)
  if (hasMultiState && !states.includes('Multi-state')) states.push('Multi-state')

  const visible = events
    .filter(e => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        e.event.toLowerCase().includes(q) ||
        e.regions.some(r => r.toLowerCase().includes(q))
      const matchState =
        stateFilter === 'All' ||
        (stateFilter === 'Multi-state' ? e.isMerged : e.state === stateFilter)
      return matchSearch && matchState
    })
    .sort((a, b) => {
      if (a.daysUntil > 0 && b.daysUntil > 0) return a.daysUntil - b.daysUntil
      if (a.daysUntil > 0) return -1
      if (b.daysUntil > 0) return 1
      return 0
    })

  const upcomingCount = events.filter(e => e.daysUntil > 0 && e.daysUntil <= 30).length

  return (
    <div className="flex w-72 xl:w-80 flex-none flex-col border-r border-glass overflow-hidden">
      {/* Header */}
      <div className="flex-none border-b border-glass px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-purple" />
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-none">Event Browser</h2>
              {states.length > 2 && (
                <p className="text-[9px] text-muted-foreground mt-0.5">{states.length - 1} states</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {upcomingCount > 0 && (
              <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                {upcomingCount} upcoming
              </span>
            )}
            {!loading && (
              <span className="text-[10px] font-medium text-muted-foreground bg-surface-1 rounded-full px-2 py-0.5 border border-glass">
                {events.length}
              </span>
            )}
            <button
              onClick={onRetry}
              disabled={loading}
              className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              title="Refresh from Sheets"
            >
              <RefreshCw className={cn('size-3', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(
              'w-full rounded-lg border border-glass bg-surface-1/50',
              'pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:border-purple/40 focus:bg-surface-1',
              'transition-all duration-200',
            )}
          />
        </div>

        {/* State filters */}
        {states.length > 1 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {states.map(s => (
              <button
                key={s}
                onClick={() => setStateFilter(s)}
                className={cn(
                  'rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all duration-200 border',
                  stateFilter === s
                    ? s === 'All'
                      ? 'bg-purple/15 text-purple border-purple/25 ring-1 ring-purple/20'
                      : cn(stateColor(s), 'ring-1 ring-white/10')
                    : 'border-transparent text-muted-foreground hover:bg-surface-1 hover:text-foreground/80',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-glass p-3 animate-pulse">
              <div className="h-3.5 w-3/4 rounded bg-surface-2 mb-2" />
              <div className="flex gap-1.5">
                <div className="h-4 w-14 rounded bg-surface-2" />
                <div className="h-4 w-12 rounded bg-surface-2" />
              </div>
            </div>
          ))
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-3">
            <AlertCircle className="size-7 mb-2 text-red-400/60" />
            <p className="text-xs font-medium text-red-400/80 mb-1">Sheets connection failed</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">{fetchError}</p>
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 rounded-lg border border-glass bg-surface-1/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all"
            >
              <RefreshCw className="size-3" /> Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Globe className="size-8 mb-2 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">
              {events.length === 0 ? 'No data rows in sheet' : 'No matches found'}
            </p>
            {events.length === 0 && (
              <button
                onClick={onRetry}
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-glass bg-surface-1/50 px-3 py-1.5 text-[10px] text-muted-foreground hover:border-glass-strong transition-all"
              >
                <RefreshCw className="size-3" /> Retry
              </button>
            )}
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
            {visible.map(event => (
              <EventCard
                key={event.id}
                event={event}
                selected={selectedEvent?.id === event.id}
                onSelect={() => onSelect(selectedEvent?.id === event.id ? null : event)}
                campaignEntry={campaigns[event.id]}
                onGenerateCampaign={onGenerateCampaign}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── StreamingContent ──────────────────────────────────────── */
function StreamingContent({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [content])
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-sm font-normal">
        {content}
        {isStreaming && <span className="inline-block w-0.5 h-4 bg-purple ml-0.5 animate-pulse align-middle" />}
      </p>
      <div ref={endRef} />
    </div>
  )
}

/* ─── AIWorkspacePanel ──────────────────────────────────────── */
function AIWorkspacePanel({
  selectedEvent,
  outputs,
  onGenerate,
  isGenerating,
  streamContent,
  currentOutputId,
  onSwitchToCampaign,
  hasCampaign,
}: {
  selectedEvent: SheetEvent | null
  outputs: GeneratedOutput[]
  onGenerate: (params: { prompt: string; platform: ContentPlatform; tone: string }) => void
  isGenerating: boolean
  streamContent: string
  currentOutputId: string | null
  onSwitchToCampaign: () => void
  hasCampaign: boolean
}) {
  const [platform, setPlatform] = useState<ContentPlatform>('linkedin')
  const [tone, setTone] = useState('')
  const [promptText, setPromptText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeOutput = currentOutputId
    ? outputs.find(o => o.id === currentOutputId) ?? null
    : outputs.length > 0 ? outputs[outputs.length - 1] : null

  const displayContent = isGenerating ? streamContent : (activeOutput?.content ?? '')
  const platformConfig = PLATFORMS.find(p => p.id === (isGenerating ? platform : (activeOutput?.platform ?? platform)))!

  const handleGenerate = () => {
    if (!promptText.trim() || isGenerating) return
    onGenerate({ prompt: promptText.trim(), platform, tone })
    setPromptText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate() }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none border-b border-glass px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex size-6 items-center justify-center">
              <div className={cn('absolute size-6 rounded-full transition-opacity', isGenerating ? 'animate-ping bg-purple/30 opacity-100' : 'opacity-0')} />
              <div className="relative flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan">
                <Sparkles className="size-3 text-white" />
              </div>
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Workspace</h2>
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && <StatusBadge label="Generating…" status="active" />}
            {selectedEvent && !isGenerating && (
              <div className="flex items-center gap-1.5 rounded-lg border border-purple/25 bg-purple/8 px-2.5 py-1">
                <div className="size-1.5 rounded-full bg-purple" />
                <span className="text-[10px] font-medium text-purple truncate max-w-[140px]">{selectedEvent.event}</span>
                <span className="text-[10px] text-purple/60">active</span>
              </div>
            )}
            {hasCampaign && selectedEvent && (
              <button
                onClick={onSwitchToCampaign}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/12 transition-colors"
              >
                <CheckCircle2 className="size-3" /> View Campaign
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!displayContent && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex h-full flex-col items-center justify-center text-center"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-purple/20 blur-xl" />
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple/20 to-cyan/10 border border-purple/20">
                <Bot className="size-7 text-purple" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {selectedEvent ? `Ready to generate for ${selectedEvent.event}` : 'Select an event to begin'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              {selectedEvent
                ? 'Describe what you want to create — or use Campaign Engine for all 3 platforms at once.'
                : 'Browse the event list on the left, select a cultural moment, then describe the content you need.'}
            </p>
            {selectedEvent && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Write a LinkedIn post for this event', 'Create a WhatsApp broadcast message', 'Draft an email campaign', 'Generate 3 content hooks'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setPromptText(suggestion)}
                    className="rounded-lg border border-glass bg-surface-1/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-glass-strong hover:text-foreground transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {(displayContent || isGenerating) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {platformConfig && (
                <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', platformConfig.badge)}>
                  <platformConfig.icon className="size-3" />
                  {platformConfig.label}
                </span>
              )}
              {(isGenerating ? selectedEvent?.event : activeOutput?.eventName) && (
                <span className="text-xs text-muted-foreground">
                  for <span className="text-foreground/70">{isGenerating ? selectedEvent?.event : activeOutput?.eventName}</span>
                </span>
              )}
              {isGenerating && (
                <span className="flex items-center gap-1 text-xs text-purple">
                  <Loader2 className="size-3 animate-spin" />
                  Writing…
                </span>
              )}
            </div>
            <div
              className="relative rounded-xl border border-glass bg-surface-1/30 p-4"
              style={{ boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 4%), 0 2px 12px oklch(0 0 0 / 12%)' }}
            >
              <StreamingContent content={displayContent} isStreaming={isGenerating} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Prompt Bar */}
      <div className="flex-none border-t border-glass bg-background/40 backdrop-blur-xl px-4 py-3">
        <div className="mb-3 flex items-center gap-1">
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                platform === p.id ? cn('ring-1', p.badge) : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
              )}
            >
              <p.icon className="size-3.5" />
              {p.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            {TONES.slice(0, 3).map(t => (
              <button
                key={t}
                onClick={() => setTone(tone === t ? '' : t)}
                className={cn(
                  'rounded-lg px-2 py-1 text-[10px] font-medium transition-all duration-200',
                  tone === t ? 'bg-surface-2 text-foreground ring-1 ring-glass-strong' : 'text-muted-foreground hover:bg-surface-1',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedEvent ? `Describe the ${selectedEvent.event} content you want to create…` : 'Describe what you want — or select an event on the left to add cultural context…'}
              disabled={isGenerating}
              rows={2}
              className={cn(
                'w-full resize-none rounded-xl border bg-surface-1/60 px-3.5 py-2.5',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:border-purple/40',
                'transition-all duration-200 leading-relaxed',
                'disabled:opacity-50 disabled:cursor-not-allowed border-glass',
              )}
            />
            <p className="absolute bottom-2.5 right-3 text-[9px] text-muted-foreground/40">
              {selectedEvent ? '⌘↵ to generate' : ''}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!promptText.trim() || isGenerating}
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
              promptText.trim() && !isGenerating
                ? 'bg-gradient-to-br from-purple to-cyan text-white shadow-[0_0_16px_oklch(0.560_0.268_279/30%)] hover:scale-105'
                : 'bg-surface-1 text-muted-foreground cursor-not-allowed border border-glass',
            )}
          >
            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── OutputCard ────────────────────────────────────────────── */
function OutputCard({ output, isActive, onCopy, onRegenerate, copied }: {
  output: GeneratedOutput
  isActive: boolean
  onCopy: (id: string, content: string) => void
  onRegenerate: (output: GeneratedOutput) => void
  copied: boolean
}) {
  const pConfig = PLATFORMS.find(p => p.id === output.platform)!
  const PIcon = pConfig.icon
  return (
    <motion.div
      variants={staggerItem}
      className={cn('rounded-xl border p-3 transition-all duration-200', isActive ? 'border-purple/30 bg-purple/5' : 'border-glass glass-hover')}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', pConfig.badge)}>
          <PIcon className="size-2.5" />{pConfig.label}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => onRegenerate(output)} className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-1 hover:text-foreground transition-colors" title="Regenerate">
            <RefreshCw className="size-3" />
          </button>
          <button
            onClick={() => onCopy(output.id, output.content)}
            className={cn('flex size-6 items-center justify-center rounded-md transition-all duration-200', copied ? 'text-emerald-400 bg-emerald-400/10' : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground')}
            title="Copy"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-1.5 truncate">
        <span className="text-purple/70">{output.eventName}</span>
        <span className="mx-1 text-muted-foreground/40">·</span>
        <Clock className="size-2.5 inline" />
        {' '}{output.createdAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">{output.content}</p>
    </motion.div>
  )
}

/* ─── OutputHistoryPanel ────────────────────────────────────── */
function OutputHistoryPanel({ outputs, currentOutputId, onCopy, onRegenerate, campaigns }: {
  outputs: GeneratedOutput[]
  currentOutputId: string | null
  onCopy: (id: string, content: string) => void
  onRegenerate: (output: GeneratedOutput) => void
  campaigns: CampaignStore
}) {
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedIds(prev => new Set([...prev, id]))
    onCopy(id, content)
    setTimeout(() => setCopiedIds(prev => { const n = new Set(prev); n.delete(id); return n }), 2000)
  }

  const readyCampaigns = Object.entries(campaigns).filter(([, e]) => e.status === 'ready')
  const generatingCampaigns = Object.entries(campaigns).filter(([, e]) => e.status === 'generating')

  return (
    <div className="flex w-80 xl:w-96 flex-none flex-col border-l border-glass overflow-hidden">
      {/* Header */}
      <div className="flex-none border-b border-glass px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-cyan" />
            <h2 className="text-sm font-semibold text-foreground">Content Queue</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {generatingCampaigns.length > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                <Loader2 className="size-2.5 animate-spin" />{generatingCampaigns.length} gen
              </span>
            )}
            {outputs.length > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground bg-surface-1 rounded-full px-2 py-0.5 border border-glass">
                {outputs.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Campaign summaries */}
        {readyCampaigns.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="size-2.5" /> Auto-Generated Campaigns
            </p>
            <div className="space-y-2">
              {readyCampaigns.map(([eventId, entry]) => (
                <div key={eventId} className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Campaign Ready
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {entry.data?.generatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {PLATFORMS.map(p => (
                      <span key={p.id} className={cn('flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium', p.badge)}>
                        <p.icon className="size-2.5" />{p.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generating campaigns */}
        {generatingCampaigns.length > 0 && (
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Loader2 className="size-2.5 animate-spin" /> In Progress
            </p>
            <div className="space-y-2">
              {generatingCampaigns.map(([eventId, entry]) => (
                <div key={eventId} className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="size-3 text-amber-400 animate-spin" />
                    <span className="text-[10px] font-medium text-amber-400">Generating campaign…</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {PLATFORMS.map(p => {
                      const done = !!entry.data?.[p.id]
                      const active = entry.generatingPlatform === p.id
                      return (
                        <span key={p.id} className={cn(
                          'flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-medium',
                          done   ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400' :
                          active ? 'border-amber-500/20 bg-amber-500/8 text-amber-400' :
                                   'border-white/8 bg-surface-1 text-muted-foreground/40',
                        )}>
                          {active ? <Loader2 className="size-2.5 animate-spin" /> : done ? <Check className="size-2.5" /> : <p.icon className="size-2.5" />}
                          {p.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual outputs */}
        {outputs.length === 0 && readyCampaigns.length === 0 && generatingCampaigns.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-10">
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-glass bg-surface-1/50">
              <Sparkles className="size-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/60">Queue is empty</p>
            <p className="mt-1 text-xs text-muted-foreground/40 max-w-[180px]">
              Auto-generated campaigns and manual outputs appear here
            </p>
          </div>
        ) : outputs.length > 0 && (
          <div>
            {(readyCampaigns.length > 0 || generatingCampaigns.length > 0) && (
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="size-2.5" /> Manual Outputs
              </p>
            )}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
              {[...outputs].reverse().map(output => (
                <OutputCard
                  key={output.id}
                  output={output}
                  isActive={output.id === currentOutputId}
                  onCopy={handleCopy}
                  onRegenerate={onRegenerate}
                  copied={copiedIds.has(output.id)}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Footer */}
      {outputs.length > 0 && (
        <div className="flex-none border-t border-glass px-4 py-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">{outputs.length} piece{outputs.length !== 1 ? 's' : ''} this session</p>
            <div className="flex gap-2">
              {PLATFORMS.map(p => {
                const count = outputs.filter(o => o.platform === p.id).length
                if (!count) return null
                const PIcon = p.icon
                return (
                  <span key={p.id} className={cn('flex items-center gap-0.5 text-[10px] font-medium', p.color)}>
                    <PIcon className="size-2.5" />{count}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── WorkspacePage ─────────────────────────────────────────── */
export default function WorkspacePage() {
  const [events, setEvents]           = useState<SheetEvent[]>([])
  const [eventsLoading, setEvLoading] = useState(true)
  const [fetchError, setFetchError]   = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<SheetEvent | null>(null)
  const [outputs, setOutputs]         = useState<GeneratedOutput[]>([])
  const [isGenerating, setIsGenerating]   = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [currentOutputId, setCurrentOutputId] = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Automation state
  const [campaigns, setCampaigns]         = useState<CampaignStore>({})
  const [centerMode, setCenterMode]       = useState<'workspace' | 'campaign'>('workspace')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const batchAbortRef  = useRef<AbortController | null>(null)
  const autoGenRef     = useRef<Set<string>>(new Set())

  /* ── notification helpers ── */
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'at'>) => {
    const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const notif: Notification = { ...n, id, at: new Date() }
    setNotifications(prev => [notif, ...prev].slice(0, 5))
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== id)), 9000)
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  /* ── batch campaign generation ── */
  const generateCampaign = useCallback(async (event: SheetEvent) => {
    setCampaigns(prev => {
      if (prev[event.id]?.status === 'generating') return prev
      return { ...prev, [event.id]: { status: 'generating' } }
    })
    setCenterMode('campaign')
    addNotification({ message: `Auto-generating ${event.event} campaign — LinkedIn, WhatsApp, Email`, type: 'ai' })

    const abort = new AbortController()
    batchAbortRef.current = abort

    try {
      const res = await fetch('/api/generate/batch', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  abort.signal,
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
              platform?: string; status?: string; content?: string; done?: boolean; eventName?: string; error?: string
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
                    generatedAt: new Date(),
                  },
                },
              }))
            }

            if (data.done) {
              const campaign: Campaign = {
                linkedin:    partial.linkedin ?? '',
                whatsapp:    partial.whatsapp ?? '',
                email:       partial.email    ?? '',
                generatedAt: new Date(),
              }
              setCampaigns(prev => ({ ...prev, [event.id]: { status: 'ready', data: campaign } }))
              setCachedCampaign(event.id, campaign)
              addNotification({
                message: `${data.eventName ?? event.event} campaign ready — 3 pieces generated`,
                type: 'success',
              })
            }

            if (data.error) throw new Error(data.error)
          } catch { /* skip malformed SSE line */ }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setCampaigns(prev => ({ ...prev, [event.id]: { status: 'error', error: (err as Error).message } }))
      addNotification({ message: `Campaign generation failed for ${event.event}`, type: 'warning' })
    }
  }, [addNotification])

  /* ── events loader ── */
  const doLoad = useCallback((invalidate: boolean) => {
    setEvLoading(true)
    setFetchError(null)
    fetch(invalidate ? '/api/sheets/events?refresh=1' : '/api/sheets/events')
      .then(r => r.json() as Promise<EventsApiResponse>)
      .then(data => {
        setEvents(data.events)
        if (data.error) setFetchError(data.error)
      })
      .catch(err => setFetchError(err instanceof Error ? err.message : 'Failed to load events'))
      .finally(() => setEvLoading(false))
  }, [])

  // Silent cache read on mount; manual retry forces a fresh Sheets pull
  const loadEvents   = useCallback(() => doLoad(false), [doLoad])
  const retryEvents  = useCallback(() => doLoad(true),  [doLoad])

  useEffect(() => { loadEvents() }, [loadEvents])

  /* ── auto-detect upcoming events + auto-generate urgent ones ── */
  const generateCampaignRef = useRef(generateCampaign)
  useEffect(() => { generateCampaignRef.current = generateCampaign }, [generateCampaign])

  useEffect(() => {
    if (eventsLoading || events.length === 0) return

    const upcoming = events
      .filter(e => e.daysUntil > 0 && e.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)

    // Staggered notifications for upcoming events
    upcoming.slice(0, 3).forEach((e, i) => {
      setTimeout(() => {
        addNotification({
          message: e.daysUntil === 1
            ? `${e.event} is TOMORROW — campaign content generating`
            : e.daysUntil <= 3
              ? `${e.event} in ${e.daysUntil} days — auto-generating campaign`
              : `${e.event} in ${e.daysUntil} days — campaign preparation recommended`,
          type: e.daysUntil <= 3 ? 'warning' : 'info',
        })
      }, i * 600)
    })

    // Auto-generate for events ≤7 days (check cache first)
    upcoming
      .filter(e => e.daysUntil <= 7)
      .slice(0, 2)
      .forEach(event => {
        if (autoGenRef.current.has(event.id)) return
        autoGenRef.current.add(event.id)

        const cached = getCachedCampaign(event.id)
        if (cached) {
          setCampaigns(prev => ({ ...prev, [event.id]: { status: 'ready', data: cached } }))
          setTimeout(() => {
            addNotification({ message: `${event.event} campaign restored from today's cache`, type: 'success' })
          }, 1500)
        } else {
          generateCampaignRef.current(event)
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, eventsLoading])

  /* ── 2-minute silent poll (uses cache, no Drive API call unless cache expired) ── */
  useEffect(() => {
    const interval = setInterval(() => { loadEvents() }, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadEvents])

  /* ── select event → switch view mode ── */
  const campaignsRef = useRef(campaigns)
  useEffect(() => { campaignsRef.current = campaigns }, [campaigns])

  const handleSelectEvent = useCallback((event: SheetEvent | null) => {
    setSelectedEvent(event)
    if (event && campaignsRef.current[event.id]) {
      setCenterMode('campaign')
    } else {
      setCenterMode('workspace')
    }
  }, [])

  /* ── manual streaming generation ── */
  const handleGenerate = useCallback(async ({ prompt, platform, tone }: { prompt: string; platform: ContentPlatform; tone: string }) => {
    if (isGenerating) abortRef.current?.abort()

    const outputId = `output-${Date.now()}`
    setCurrentOutputId(outputId)
    setStreamContent('')
    setIsGenerating(true)
    setError(null)
    setCenterMode('workspace')

    setOutputs(prev => [...prev, { id: outputId, platform, content: '', eventName: selectedEvent?.event ?? 'Unknown', prompt, createdAt: new Date() }])

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch('/api/generate/stream', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  abort.signal,
        body: JSON.stringify({ message: prompt, eventId: selectedEvent?.id, platform, tone: tone || undefined }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamContent(accumulated)
      }

      setOutputs(prev => prev.map(o => o.id === outputId ? { ...o, content: accumulated } : o))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Generation failed'
      setError(msg)
      setOutputs(prev => prev.filter(o => o.id !== outputId))
      setCurrentOutputId(null)
    } finally {
      setIsGenerating(false)
      setStreamContent('')
    }
  }, [isGenerating, selectedEvent])

  const handleRegenerate = useCallback((output: GeneratedOutput) => {
    setSelectedEvent(events.find(e => e.event === output.eventName) ?? selectedEvent)
    handleGenerate({ prompt: output.prompt, platform: output.platform, tone: '' })
  }, [events, selectedEvent, handleGenerate])

  useEffect(() => () => { abortRef.current?.abort(); batchAbortRef.current?.abort() }, [])

  const hasCampaign = !!(selectedEvent && campaigns[selectedEvent.id])

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Notification strip */}
        <NotificationStrip notifications={notifications} onDismiss={dismissNotification} />

        {/* Main 3-panel area */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* Error toast */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -32 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-red-400/25 bg-red-400/8 backdrop-blur-xl px-4 py-2.5 shadow-xl"
              >
                <AlertCircle className="size-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
                <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 transition-colors">
                  <X className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left: Event Browser */}
          <EventBrowserPanel
            events={events}
            loading={eventsLoading}
            fetchError={fetchError}
            selectedEvent={selectedEvent}
            onSelect={handleSelectEvent}
            onRetry={retryEvents}
            campaigns={campaigns}
            onGenerateCampaign={(event) => {
              handleSelectEvent(event)
              generateCampaign(event)
            }}
          />

          {/* Center: Workspace or Campaign Engine */}
          <AnimatePresence mode="wait">
            {centerMode === 'campaign' ? (
              <motion.div
                key="campaign"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-1 overflow-hidden"
              >
                <CampaignViewPanel
                  event={selectedEvent}
                  entry={selectedEvent ? campaigns[selectedEvent.id] : undefined}
                  onGenerate={(event) => generateCampaign(event)}
                  onSwitchToManual={() => setCenterMode('workspace')}
                />
              </motion.div>
            ) : (
              <motion.div
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-1 overflow-hidden"
              >
                <AIWorkspacePanel
                  selectedEvent={selectedEvent}
                  outputs={outputs}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  streamContent={streamContent}
                  currentOutputId={currentOutputId}
                  onSwitchToCampaign={() => setCenterMode('campaign')}
                  hasCampaign={hasCampaign}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: Content Queue */}
          <OutputHistoryPanel
            outputs={outputs}
            currentOutputId={currentOutputId}
            onCopy={() => {}}
            onRegenerate={handleRegenerate}
            campaigns={campaigns}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
