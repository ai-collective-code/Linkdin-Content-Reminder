import { cn } from '@/lib/utils'
import type { AccentColor } from '@/types'

interface GradientBadgeProps {
  children: React.ReactNode
  variant?: AccentColor | 'outline'
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

const VARIANT_STYLES: Record<string, string> = {
  purple:  'bg-purple/15 text-purple border-purple/25',
  cyan:    'bg-cyan/15 text-cyan border-cyan/25',
  blue:    'bg-blue-accent/15 text-blue-accent border-blue-accent/25',
  pink:    'bg-pink/15 text-pink border-pink/25',
  outline: 'bg-transparent text-muted-foreground border-glass',
}

const DOT_COLORS: Record<string, string> = {
  purple:  'bg-purple',
  cyan:    'bg-cyan',
  blue:    'bg-blue-accent',
  pink:    'bg-pink',
  outline: 'bg-muted-foreground',
}

export function GradientBadge({
  children,
  variant = 'purple',
  size = 'sm',
  className,
  dot = false,
}: GradientBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('size-1.5 rounded-full', DOT_COLORS[variant])} />
      )}
      {children}
    </span>
  )
}

/* ── Status badge with animated dot ────────────────────────── */
export function StatusBadge({
  label,
  status = 'active',
}: {
  label: string
  status?: 'active' | 'inactive' | 'pending' | 'error'
}) {
  const CONFIG = {
    active:   { color: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/25' },
    inactive: { color: 'bg-muted-foreground', text: 'text-muted-foreground', bg: 'bg-surface-1 border-glass' },
    pending:  { color: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/25' },
    error:    { color: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10 border-destructive/25' },
  }
  const cfg = CONFIG[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
      <span className={cn('relative flex size-1.5 rounded-full', cfg.color)}>
        {status === 'active' && (
          <span className={cn('absolute inset-0 animate-ping rounded-full opacity-75', cfg.color)} />
        )}
      </span>
      {label}
    </span>
  )
}
