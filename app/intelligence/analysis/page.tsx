'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wand2,
  Copy,
  Star,
  ChevronDown,
  ChevronRight,
  Sparkles,
  BarChart3,
  BookOpen,
  Save,
  Play,
  Plus,
  Check,
  RefreshCw,
  Layers,
  Database,
  Loader2,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GlassCard } from '@/components/shared/glass-card'
import { GradientBadge } from '@/components/shared/gradient-badge'
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from '@/lib/animations'
import {
  PROMPT_TEMPLATES,
  PROMPT_VARIABLES,
  type PromptTemplate,
  type PromptVariable,
} from '@/lib/mock-data'
import type { SheetEvent, EventsApiResponse } from '@/types/sheets'

/* ── Map SheetEvent fields onto variable keys ──────────────── */
function eventToVariableValues(event: SheetEvent): Record<string, string> {
  return {
    festival:     event.festival || event.event,
    region:       event.region,
    emotion:      event.emotion,
    industry:     event.industry,
    cta_style:    event.ctaStyle,
    content_type: event.contentType,
    audience:     event.audience,
    tone:         event.tone,
    hook:         event.hook || event.contentHooks[0] || '',
    insight:      event.insight,
    campaign_angle: event.campaignAngle,
    keywords:     event.keywords.join(', '),
  }
}

/* ── Variable chip inline ───────────────────────────────────── */
function VariableChip({ variable }: { variable: PromptVariable }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${variable.color}`}>
      {`{{${variable.key}}}`}
    </span>
  )
}

/* ── Render template with injected values ───────────────────── */
function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`)
}

/* ── Highlight template variables in editor ─────────────────── */
function TemplatePreviewHighlighted({
  template,
  values,
  variables,
}: {
  template: string
  values: Record<string, string>
  variables: PromptVariable[]
}) {
  const varMap = Object.fromEntries(variables.map(v => [v.key, v]))
  const parts = template.split(/(\{\{\w+\}\})/)

  return (
    <pre className="text-xs text-white/70 font-mono leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        const match = part.match(/^\{\{(\w+)\}\}$/)
        if (match) {
          const key = match[1]
          const variable = varMap[key]
          const val = values[key]
          if (val) {
            return (
              <span key={i} className={`rounded px-1 font-semibold ${variable?.color ?? 'bg-white/10 text-white border border-white/20'}`}>
                {val}
              </span>
            )
          }
          return (
            <span key={i} className="text-white/30 bg-white/5 rounded px-1">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </pre>
  )
}

/* ── Template gallery card ──────────────────────────────────── */
const ACCENT_GRADIENT: Record<string, string> = {
  purple: 'from-purple/20 to-purple/5 border-purple/20',
  cyan: 'from-cyan/20 to-cyan/5 border-cyan/20',
  blue: 'from-blue-accent/20 to-blue-accent/5 border-blue-accent/20',
  pink: 'from-pink/20 to-pink/5 border-pink/20',
}

const ACCENT_TEXT: Record<string, string> = {
  purple: 'text-purple-400',
  cyan: 'text-cyan-400',
  blue: 'text-blue-400',
  pink: 'text-pink-400',
}

function TemplateGalleryCard({
  template,
  isActive,
  onClick,
}: {
  template: PromptTemplate
  isActive: boolean
  onClick: () => void
}) {
  const gradient = ACCENT_GRADIENT[template.accentColor] ?? ACCENT_GRADIENT.purple
  const accentText = ACCENT_TEXT[template.accentColor] ?? ACCENT_TEXT.purple

  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        w-full text-left p-3.5 rounded-xl border transition-all
        bg-gradient-to-br ${gradient}
        ${isActive ? 'ring-1 ring-white/25 shadow-lg' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs font-semibold text-white leading-snug">{template.name}</p>
        <div className="flex items-center gap-0.5 shrink-0">
          <Star className={`w-2.5 h-2.5 ${accentText} fill-current`} />
          <span className={`text-[9px] font-semibold ${accentText}`}>{template.rating}</span>
        </div>
      </div>
      <p className="text-[10px] text-white/45 leading-snug mb-2 line-clamp-2">{template.description}</p>
      <div className="flex items-center gap-2">
        <span className={`text-[9px] uppercase font-semibold tracking-wider ${accentText}`}>
          {template.category}
        </span>
        <span className="text-[9px] text-white/30">·</span>
        <span className="text-[9px] text-white/35 flex items-center gap-1">
          <BarChart3 className="w-2 h-2" />
          {template.usageCount.toLocaleString()} uses
        </span>
      </div>
    </motion.button>
  )
}

/* ── Variable control row ───────────────────────────────────── */
function VariableControl({
  variable,
  value,
  onChange,
}: {
  variable: PromptVariable
  value: string
  onChange: (val: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VariableChip variable={variable} />
          <span className="text-[10px] text-white/40">{variable.label}</span>
        </div>
        {variable.type === 'select' && variable.options && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-white/30 hover:text-white/60 flex items-center gap-0.5 transition-colors"
          >
            options
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {variable.type === 'select' && variable.options ? (
        <div>
          <div className="flex flex-wrap gap-1.5">
            {(expanded ? variable.options : variable.options.slice(0, 3)).map(opt => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`
                  text-[10px] px-2.5 py-1 rounded-lg border transition-all font-medium
                  ${value === opt
                    ? `${variable.color} shadow-sm`
                    : 'bg-white/3 text-white/40 border-white/8 hover:border-white/20 hover:text-white/60'}
                `}
              >
                {opt}
              </button>
            ))}
            {!expanded && variable.options.length > 3 && (
              <button
                onClick={() => setExpanded(true)}
                className="text-[10px] px-2.5 py-1 rounded-lg border border-white/8 text-white/30 hover:text-white/50 transition-colors"
              >
                +{variable.options.length - 3} more
              </button>
            )}
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white/4 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
          placeholder={`Enter ${variable.label.toLowerCase()}...`}
        />
      )}
    </div>
  )
}

/* ── Event selector banner ──────────────────────────────────── */
function EventSelectorBanner({
  events,
  selectedId,
  loading,
  onSelect,
}: {
  events: SheetEvent[]
  selectedId: string | null
  loading: boolean
  onSelect: (event: SheetEvent | null) => void
}) {
  const selected = events.find(e => e.id === selectedId) ?? null

  return (
    <div className="px-5 py-2.5 border-b border-white/5 bg-white/1">
      <div className="flex items-center gap-2.5">
        <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider shrink-0">
          Sheet Event
        </span>

        {loading ? (
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading events...
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <select
              value={selectedId ?? ''}
              onChange={e => {
                const ev = events.find(ev => ev.id === e.target.value) ?? null
                onSelect(ev)
              }}
              className="w-full bg-transparent border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-white/70 focus:outline-none focus:border-white/25 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900 text-white/60">— Select sheet event to auto-fill —</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className="bg-gray-900 text-white">
                  {ev.event || ev.festival} {ev.region ? `· ${ev.region}` : ''} {ev.festivalDate ? `· ${ev.festivalDate}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {selected && (
          <div className="flex items-center gap-1.5 shrink-0">
            {selected.priority && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border ${
                selected.priority.toLowerCase() === 'high'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                  : selected.priority.toLowerCase() === 'medium'
                    ? 'bg-purple/15 text-purple-400 border-purple/20'
                    : 'bg-cyan/15 text-cyan-400 border-cyan/20'
              }`}>
                {selected.priority}
              </span>
            )}
            <span className="text-[9px] text-white/30">{selected.daysUntil}d away</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
export default function PromptLabPage() {
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate>(PROMPT_TEMPLATES[0])
  const [customTemplate, setCustomTemplate] = useState<string>(PROMPT_TEMPLATES[0].template)
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROMPT_VARIABLES.map(v => [v.key, v.defaultValue]))
  )
  const [copied, setCopied] = useState(false)
  const [showRawMode, setShowRawMode] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState<string[]>([])

  // Live sheet events
  const [events, setEvents] = useState<SheetEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    fetch('/api/sheets/events')
      .then(r => r.json())
      .then((data: EventsApiResponse) => {
        setEvents(data.events ?? [])
      })
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false))
  }, [])

  const handleEventSelect = useCallback((event: SheetEvent | null) => {
    setSelectedEventId(event?.id ?? null)
    if (event) {
      setVariableValues(prev => ({ ...prev, ...eventToVariableValues(event) }))
    }
  }, [])

  const handleTemplateSelect = useCallback((tpl: PromptTemplate) => {
    setActiveTemplate(tpl)
    setCustomTemplate(tpl.template)
    const newVals = { ...variableValues }
    tpl.variables.forEach(v => {
      if (!newVals[v.key]) newVals[v.key] = v.defaultValue
    })
    setVariableValues(newVals)
  }, [variableValues])

  const renderedOutput = renderTemplate(customTemplate, variableValues)

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setSavedTemplates(prev =>
      prev.includes(activeTemplate.id) ? prev : [...prev, activeTemplate.id]
    )
  }

  const handleReset = () => {
    setCustomTemplate(activeTemplate.template)
    const base = Object.fromEntries(PROMPT_VARIABLES.map(v => [v.key, v.defaultValue]))
    const selected = events.find(e => e.id === selectedEventId)
    setVariableValues(selected ? { ...base, ...eventToVariableValues(selected) } : base)
  }

  const usedVarKeys = Array.from(customTemplate.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1])
  const usedVariables = PROMPT_VARIABLES.filter(v => usedVarKeys.includes(v.key))
  const allVariables = activeTemplate.variables ?? PROMPT_VARIABLES

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Header ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="shrink-0 px-6 pt-6 pb-4 border-b border-white/5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Intelligence</span>
                <ChevronRight className="w-3 h-3 text-white/20" />
                <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Prompt Lab</span>
              </div>
              <h1 className="text-xl font-bold text-white">Prompt Engineering Lab</h1>
              <p className="text-sm text-white/40 mt-0.5">
                Select a sheet event to auto-inject variables, then preview and copy your prompt.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GradientBadge variant="purple" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                {PROMPT_TEMPLATES.length} templates
              </GradientBadge>
              {events.length > 0 && (
                <GradientBadge variant="cyan" className="text-xs">
                  <Database className="w-3 h-3 mr-1.5" />
                  {events.length} events
                </GradientBadge>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Three-panel workspace ── */}
        <div className="flex flex-1 min-h-0 gap-0 divide-x divide-white/5">

          {/* ── Panel 1: Template Gallery ── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="w-56 shrink-0 flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                Templates
              </span>
              <button className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 transition-colors text-white/40">
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {PROMPT_TEMPLATES.map(tpl => (
                  <TemplateGalleryCard
                    key={tpl.id}
                    template={tpl}
                    isActive={activeTemplate.id === tpl.id}
                    onClick={() => handleTemplateSelect(tpl)}
                  />
                ))}
              </motion.div>

              {/* Variable library */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" />
                  Variable Library
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_VARIABLES.map(v => (
                    <VariableChip key={v.key} variable={v} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Panel 2: Editor ── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-0 flex flex-col overflow-hidden"
          >
            {/* Event selector */}
            <EventSelectorBanner
              events={events}
              selectedId={selectedEventId}
              loading={loadingEvents}
              onSelect={handleEventSelect}
            />

            {/* Editor header */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-white/70 truncate">{activeTemplate.name}</span>
                {savedTemplates.includes(activeTemplate.id) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Saved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-white/4 hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"
                  title="Reset to default"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-1.5 rounded-lg bg-white/4 hover:bg-white/8 text-white/40 hover:text-white/70 transition-colors"
                  title="Save template"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Template editor textarea */}
            <div className="flex-1 min-h-0 px-5 py-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex-1 min-h-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Template Body</p>
                  <span className="text-[9px] text-white/20">{customTemplate.length} chars</span>
                </div>
                <textarea
                  value={customTemplate}
                  onChange={e => setCustomTemplate(e.target.value)}
                  className="
                    w-full h-full min-h-[200px] bg-white/3 border border-white/8 rounded-xl
                    px-4 py-3 text-xs font-mono text-white/75 leading-relaxed
                    placeholder-white/20 resize-none
                    focus:outline-none focus:border-white/20 focus:bg-white/4
                    transition-colors
                  "
                  spellCheck={false}
                />
              </div>

              {/* Used variables in this template */}
              {usedVariables.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">
                    Detected Variables ({usedVariables.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {usedVariables.map(v => (
                      <VariableChip key={v.key} variable={v} />
                    ))}
                  </div>
                </div>
              )}

              {/* Variable value controls */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">
                  Variable Values
                  {selectedEventId && (
                    <span className="ml-2 text-[9px] text-cyan-400 normal-case font-normal">
                      auto-filled from sheet
                    </span>
                  )}
                </p>
                <div className="space-y-4">
                  {allVariables.map(variable => (
                    <VariableControl
                      key={variable.key}
                      variable={variable}
                      value={variableValues[variable.key] ?? variable.defaultValue}
                      onChange={val => setVariableValues(prev => ({ ...prev, [variable.key]: val }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Panel 3: Live Preview ── */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="w-80 shrink-0 flex flex-col overflow-hidden"
          >
            {/* Preview header */}
            <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3 h-3 text-emerald-400" />
                Live Preview
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowRawMode(!showRawMode)}
                  className={`text-[9px] px-2 py-1 rounded-md border transition-colors ${
                    showRawMode
                      ? 'bg-white/10 text-white/70 border-white/20'
                      : 'bg-white/3 text-white/30 border-white/8 hover:border-white/15'
                  }`}
                >
                  {showRawMode ? 'Injected' : 'Raw'}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg bg-purple/20 text-purple-300 border border-purple/25 hover:bg-purple/30 transition-colors font-medium"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Preview body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showRawMode ? 'raw' : 'injected'}
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white/3 border border-white/7 rounded-xl p-4"
                >
                  {showRawMode ? (
                    <pre className="text-xs text-white/50 font-mono leading-relaxed whitespace-pre-wrap break-words">
                      {customTemplate}
                    </pre>
                  ) : (
                    <TemplatePreviewHighlighted
                      template={customTemplate}
                      values={variableValues}
                      variables={PROMPT_VARIABLES}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Variables', value: usedVarKeys.length, color: 'text-purple-400' },
                  { label: 'Tokens (est.)', value: Math.round(renderedOutput.split(/\s+/).length * 1.3), color: 'text-cyan-400' },
                  { label: 'Characters', value: renderedOutput.length, color: 'text-amber-400' },
                  { label: 'Rating', value: `${activeTemplate.rating}★`, color: 'text-pink-400' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/3 border border-white/6 rounded-lg p-2.5 text-center">
                    <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[9px] text-white/35 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Run in AI button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  w-full mt-4 py-2.5 rounded-xl text-xs font-semibold
                  bg-gradient-to-r from-purple to-cyan/80
                  text-white hover:opacity-90 transition-opacity
                  flex items-center justify-center gap-2
                "
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run in AI Generator
              </motion.button>

              {/* Template stats */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-2.5">Template Stats</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40">Usage count</span>
                    <span className="text-[10px] font-semibold text-white/60">{activeTemplate.usageCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40">Category</span>
                    <span className="text-[10px] font-semibold text-white/60 capitalize">{activeTemplate.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40">Variables used</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {usedVariables.slice(0, 3).map(v => (
                        <span key={v.key} className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${v.color}`}>
                          {v.key}
                        </span>
                      ))}
                      {usedVariables.length > 3 && (
                        <span className="text-[9px] text-white/30">+{usedVariables.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  )
}
