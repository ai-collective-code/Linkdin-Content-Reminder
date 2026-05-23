'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, Copy, Bookmark, CalendarDays, RefreshCw, Sparkles,
  ChevronDown, Check, Zap, Share2, Mail, MessageSquare,
  RotateCcw, Wand2, AlertCircle, Globe,
} from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GlassCard } from '@/components/shared/glass-card'
import { GradientBadge, StatusBadge } from '@/components/shared/gradient-badge'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { PROMPT_TEMPLATES, INITIAL_CHAT_MESSAGES } from '@/lib/mock-data'
import type { ChatMessage } from '@/lib/mock-data'
import type { SheetEvent } from '@/types/sheets'

/* ─── Config ─────────────────────────────────────────────────── */
const TONES = [
  { label: 'Warm & Aspirational', value: 'warm',         color: 'text-amber-400'  },
  { label: 'Bold & Confident',    value: 'bold',         color: 'text-pink'        },
  { label: 'Inspirational',       value: 'inspirational',color: 'text-purple'      },
  { label: 'Professional',        value: 'professional', color: 'text-blue-accent' },
  { label: 'Nostalgic',           value: 'nostalgic',    color: 'text-cyan'        },
  { label: 'Celebratory',         value: 'celebratory',  color: 'text-emerald-400' },
]

const PLATFORMS = [
  { label: 'LinkedIn', icon: Share2,       value: 'linkedin', color: 'bg-blue-accent/15 text-blue-accent border-blue-accent/30' },
  { label: 'WhatsApp', icon: MessageSquare, value: 'whatsapp', color: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30' },
  { label: 'Email',    icon: Mail,          value: 'email',    color: 'bg-purple/15 text-purple border-purple/30' },
]

const QUICK_PROMPTS = [
  { label: '🎉 Festival campaign',   text: 'Generate a LinkedIn post for the upcoming festival for a premium fintech brand. Tone: warm, aspirational, community-focused.' },
  { label: '📣 Broadcast message',   text: 'Create a WhatsApp broadcast for this cultural moment — keep it short, emoji-rich, and conversion-focused.' },
  { label: '💡 Thought leadership',  text: 'Write a thought leadership post about how cultural intelligence drives B2B marketing ROI. Data-driven, confident tone.' },
  { label: '📧 Email campaign',      text: 'Draft an email campaign for this cultural event — subject line, preview text, and body copy for a premium brand.' },
]

const OUTPUT_BADGE: Record<string, string> = {
  linkedin: 'bg-blue-accent/15 text-blue-accent border-blue-accent/25',
  whatsapp: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/25',
  email:    'bg-purple/15 text-purple border-purple/25',
}

/* ─── Streaming text display ────────────────────────────────── */
function StreamingContent({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <span className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {text}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-[1em] bg-purple align-text-bottom ml-0.5"
        />
      )}
    </span>
  )
}

/* ─── Chat bubble ────────────────────────────────────────────── */
function ChatBubble({
  msg,
  isStreaming,
  streamContent,
}: {
  msg: ChatMessage
  isStreaming: boolean
  streamContent?: string
}) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'
  const displayText = isStreaming && streamContent !== undefined ? streamContent : msg.content

  const copy = () => {
    navigator.clipboard.writeText(displayText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full mt-0.5',
        isUser
          ? 'bg-gradient-to-br from-purple to-pink text-xs font-bold text-white'
          : 'bg-gradient-to-br from-purple/30 to-cyan/20 border border-purple/30',
      )}>
        {isUser ? 'AR' : <Bot className="size-4 text-purple" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] space-y-1.5', isUser ? 'items-end' : 'items-start')}>
        {msg.outputType && (
          <div className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
            OUTPUT_BADGE[msg.outputType],
          )}>
            {msg.outputType === 'linkedin' ? <Share2 className="size-3" /> :
             msg.outputType === 'whatsapp' ? <MessageSquare className="size-3" /> :
             <Mail className="size-3" />}
            {msg.outputType} Content
          </div>
        )}

        <div className={cn(
          'rounded-2xl px-4 py-3',
          isUser
            ? 'bg-purple/15 border border-purple/25 text-foreground/90'
            : 'glass border border-glass',
        )}>
          {isUser ? (
            <p className="text-sm text-foreground/90">{msg.content}</p>
          ) : (
            <StreamingContent text={displayText} isStreaming={isStreaming} />
          )}
        </div>

        {/* Action row */}
        {!isUser && !isStreaming && msg.actions && displayText && (
          <div className="flex flex-wrap items-center gap-1 px-1">
            {[
              { icon: copied ? Check : Copy, label: copied ? 'Copied!' : 'Copy', action: copy, color: copied ? 'text-emerald-400' : '' },
              { icon: Bookmark,    label: 'Save',       action: () => {}, color: '' },
              { icon: CalendarDays,label: 'Schedule',   action: () => {}, color: '' },
              { icon: RotateCcw,   label: 'Regenerate', action: () => {}, color: '' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
                  btn.color || 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
                )}
              >
                <btn.icon className="size-3.5" />
                {btn.label}
              </button>
            ))}
          </div>
        )}

        <p className="px-1 text-[10px] text-muted-foreground/50">{msg.timestamp}</p>
      </div>
    </motion.div>
  )
}

/* ─── Typing indicator ───────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-purple/30 to-cyan/20 border border-purple/30">
        <Bot className="size-4 text-purple" />
      </div>
      <div className="glass rounded-2xl border border-glass px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.16 }}
              className="size-1.5 rounded-full bg-purple"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Event selector option ─────────────────────────────────── */
function EventOption({ event, selected, onClick }: {
  event: SheetEvent; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all',
        selected
          ? 'bg-purple/12 border-purple/30 text-foreground'
          : 'border-glass text-muted-foreground hover:bg-surface-1 hover:text-foreground',
      )}
    >
      <div className="font-medium truncate">{event.event}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
        {event.region} · {event.emotion}
        {event.daysUntil > 0 && ` · ${event.daysUntil}d away`}
      </div>
    </button>
  )
}

/* ─── Controls panel ─────────────────────────────────────────── */
function ControlsPanel({
  platform, setPlatform,
  tone, setTone,
  events, eventsLoading, selectedEventId, setSelectedEventId,
  onTemplate,
}: {
  platform: string; setPlatform: (v: string) => void
  tone: string; setTone: (v: string) => void
  events: SheetEvent[]
  eventsLoading: boolean
  selectedEventId: string | null
  setSelectedEventId: (id: string | null) => void
  onTemplate: (text: string) => void
}) {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showEventList, setShowEventList] = useState(false)
  const selectedEvent = events.find(e => e.id === selectedEventId)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      {/* Platform selector */}
      <div>
        <p className="text-label text-muted-foreground mb-2">Output Format</p>
        <div className="space-y-1.5">
          {PLATFORMS.map(p => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                platform === p.value
                  ? p.color
                  : 'border-glass text-muted-foreground hover:bg-surface-1 hover:text-foreground',
              )}
            >
              <p.icon className="size-4" />
              {p.label}
              {platform === p.value && <Check className="ml-auto size-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tone selector */}
      <div>
        <p className="text-label text-muted-foreground mb-2">Emotional Tone</p>
        <div className="grid grid-cols-2 gap-1.5">
          {TONES.map(t => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={cn(
                'rounded-xl border px-2 py-1.5 text-xs font-medium transition-all',
                tone === t.value
                  ? cn('border-glass-strong bg-surface-2', t.color)
                  : 'border-glass text-muted-foreground hover:bg-surface-1 hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event / Festival context — live from Google Sheets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-label text-muted-foreground">Festival Context</p>
          {eventsLoading
            ? <span className="text-[9px] text-purple animate-pulse">Loading…</span>
            : <span className="text-[9px] text-emerald-400">{events.length} events live</span>
          }
        </div>

        <button
          onClick={() => setShowEventList(v => !v)}
          className={cn(
            'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all',
            showEventList
              ? 'border-purple/30 bg-purple/8 text-foreground'
              : 'border-glass text-muted-foreground hover:bg-surface-1 hover:text-foreground',
          )}
        >
          <span className="flex-1 text-left truncate">
            {selectedEvent ? selectedEvent.event : 'No context — general AI'}
          </span>
          <ChevronDown className={cn('ml-2 size-4 shrink-0 transition-transform', showEventList && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {showEventList && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden mt-1.5 space-y-1"
            >
              <button
                onClick={() => { setSelectedEventId(null); setShowEventList(false) }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl border text-sm transition-all',
                  !selectedEventId
                    ? 'bg-white/5 border-white/12 text-foreground'
                    : 'border-glass text-muted-foreground hover:bg-surface-1',
                )}
              >
                No context — general AI
              </button>
              {events.map(event => (
                <EventOption
                  key={event.id}
                  event={event}
                  selected={selectedEventId === event.id}
                  onClick={() => { setSelectedEventId(event.id); setShowEventList(false) }}
                />
              ))}
              {events.length === 0 && !eventsLoading && (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  No events in sheet yet. Add rows to Google Sheets to see them here.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected event summary */}
        {selectedEvent && !showEventList && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2.5 rounded-xl bg-purple/6 border border-purple/15"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="size-3 text-purple" />
              <p className="text-[10px] font-semibold text-purple uppercase tracking-wider">Intelligence Active</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-white/70 font-medium">{selectedEvent.emotion}</span> ·{' '}
              {selectedEvent.insight.slice(0, 80)}{selectedEvent.insight.length > 80 ? '…' : ''}
            </p>
          </motion.div>
        )}
      </div>

      {/* Prompt templates */}
      <div>
        <button
          onClick={() => setShowTemplates(v => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-glass px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-1 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wand2 className="size-4 text-purple" />
            Prompt Templates
          </div>
          <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', showTemplates && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden mt-2"
            >
              <div className="space-y-1.5">
                {PROMPT_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => onTemplate(tpl.template)}
                    className="w-full rounded-xl border border-glass p-3 text-left hover:bg-surface-1 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground group-hover:text-purple transition-colors">{tpl.name}</p>
                      <GradientBadge variant={tpl.accentColor} size="sm">{tpl.usageCount}</GradientBadge>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{tpl.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI engine badge */}
      <div className="mt-auto rounded-xl border border-purple/20 bg-purple/5 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="size-3.5 text-purple" />
          <p className="text-[11px] font-semibold text-purple">Claude claude-sonnet-4-6 · Live</p>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Powered by Anthropic API. Cultural context injected from Google Sheets.
        </p>
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function AIContentGeneratorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES)
  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState<'linkedin' | 'whatsapp' | 'email'>('linkedin')
  const [tone, setTone] = useState('warm')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [streamBuffer, setStreamBuffer] = useState('')

  // Google Sheets events
  const [events, setEvents] = useState<SheetEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Fetch events from Google Sheets on mount
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/sheets/events')
        const data = await res.json()
        setEvents(data.events ?? [])
        if (data.events?.length > 0) setSelectedEventId(data.events[0].id)
      } catch (err) {
        console.error('Failed to load events:', err)
      } finally {
        setEventsLoading(false)
      }
    }
    loadEvents()
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating, streamBuffer])

  const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const sendMessage = useCallback(async (text?: string) => {
    const prompt = text ?? input
    if (!prompt.trim() || isGenerating) return

    setApiError(null)
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    // Append user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: prompt,
      timestamp: now(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsGenerating(true)

    // Create empty AI message placeholder
    const aiId = `msg-${Date.now()}-ai`
    const aiMsg: ChatMessage = {
      id: aiId,
      role: 'ai',
      content: '',
      timestamp: now(),
      outputType: platform,
      actions: ['copy', 'save', 'schedule', 'regenerate'],
    }
    setMessages(prev => [...prev, aiMsg])
    setStreamingMsgId(aiId)
    setStreamBuffer('')

    try {
      const res = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, eventId: selectedEventId ?? undefined, platform, tone }),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ error: 'Generation failed' }))
        throw new Error(errData.error ?? `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreamBuffer(accumulated)
      }

      // Commit full content to the message
      setMessages(prev =>
        prev.map(m => m.id === aiId ? { ...m, content: accumulated } : m)
      )
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const errMsg = err instanceof Error ? err.message : 'Generation failed. Please try again.'
      setApiError(errMsg)
      setMessages(prev => prev.map(m =>
        m.id === aiId
          ? { ...m, content: `⚠️ Error: ${errMsg}` }
          : m
      ))
    } finally {
      setStreamingMsgId(null)
      setStreamBuffer('')
      setIsGenerating(false)
    }
  }, [input, isGenerating, platform, tone, selectedEventId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <DashboardLayout>
      <div className="flex h-full overflow-hidden">

        {/* ── Chat column ── */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <motion.div
            variants={fadeInUp} initial="hidden" animate="visible"
            className="shrink-0 flex items-center justify-between gap-4 px-5 py-4 border-b border-glass"
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-purple to-cyan">
                  <Bot className="size-3.5 text-white" />
                </div>
                <h1 className="text-sm font-bold text-foreground">AI Content Generator</h1>
                <StatusBadge label="Live" status="active" />
              </div>
              <p className="text-xs text-muted-foreground">
                Claude claude-sonnet-4-6 · Cultural intelligence from Google Sheets ·{' '}
                {eventsLoading ? (
                  <span className="text-purple animate-pulse">loading context…</span>
                ) : (
                  <span className="text-emerald-400">{events.length} events loaded</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GradientBadge variant="purple" dot>Anthropic API</GradientBadge>
              <button
                onClick={() => setMessages(INITIAL_CHAT_MESSAGES)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-surface-1"
              >
                <RefreshCw className="size-3.5" /> Clear
              </button>
            </div>
          </motion.div>

          {/* API error banner */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-destructive/10 border-b border-destructive/20 text-xs text-destructive"
              >
                <AlertCircle className="size-3.5 shrink-0" />
                {apiError}
                <button onClick={() => setApiError(null)} className="ml-auto hover:opacity-70">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5">
              {messages.map(msg => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  isStreaming={msg.id === streamingMsgId}
                  streamContent={msg.id === streamingMsgId ? streamBuffer : undefined}
                />
              ))}
            </motion.div>

            {isGenerating && streamingMsgId === null && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="shrink-0 flex gap-2 overflow-x-auto px-5 py-2 border-t border-glass/50 no-scrollbar">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.label}
                onClick={() => sendMessage(qp.text)}
                disabled={isGenerating}
                className="shrink-0 rounded-full border border-glass px-3 py-1.5 text-xs text-muted-foreground hover:border-purple/30 hover:text-foreground hover:bg-purple/5 transition-all disabled:opacity-40"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="shrink-0 px-5 py-4 border-t border-glass">
            <div className="relative flex items-end gap-3 rounded-2xl border border-glass bg-surface-1 px-4 py-3 focus-within:border-purple/35 focus-within:bg-purple/3 transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the content you need… (Shift+Enter for new line)"
                disabled={isGenerating}
                rows={2}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none disabled:opacity-50"
              />
              <motion.button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isGenerating}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-xl transition-all',
                  input.trim() && !isGenerating
                    ? 'bg-gradient-to-br from-purple to-cyan text-white shadow-[0_0_16px_oklch(0.560_0.268_279/30%)]'
                    : 'bg-surface-2 text-muted-foreground',
                )}
              >
                {isGenerating
                  ? <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="size-4" />
                    </motion.div>
                  : <Send className="size-4" />
                }
              </motion.button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-muted-foreground/50">
              Enter to send · Shift+Enter for newline · Using <span className="text-purple">claude-sonnet-4-6</span>
            </p>
          </div>
        </div>

        {/* ── Controls panel ── */}
        <div className="hidden w-72 shrink-0 border-l border-glass lg:flex flex-col">
          <div className="p-4 border-b border-glass">
            <p className="text-xs font-semibold text-foreground">Generation Controls</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Configure AI output parameters</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ControlsPanel
              platform={platform} setPlatform={v => setPlatform(v as 'linkedin' | 'whatsapp' | 'email')}
              tone={tone} setTone={setTone}
              events={events} eventsLoading={eventsLoading}
              selectedEventId={selectedEventId} setSelectedEventId={setSelectedEventId}
              onTemplate={text => setInput(text)}
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
