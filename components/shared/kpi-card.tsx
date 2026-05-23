'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerItem } from '@/lib/animations'
import type { KPICardData, AccentColor } from '@/types'

const ACCENT_STYLES: Record<AccentColor, {
  icon: string
  glow: string
  bg: string
  border: string
  sparkline: string
  sparkFill: string
  hoverShadow: string
}> = {
  purple: {
    icon:        'text-purple',
    glow:        'group-hover:shadow-[0_0_32px_oklch(0.560_0.268_279/22%)]',
    bg:          'bg-purple/8',
    border:      'border-purple/15',
    sparkline:   'oklch(0.660 0.240 279)',
    sparkFill:   'oklch(0.660 0.240 279)',
    hoverShadow: '0 0 24px oklch(0.560 0.268 279 / 18%)',
  },
  cyan: {
    icon:        'text-cyan',
    glow:        'group-hover:shadow-[0_0_32px_oklch(0.720_0.154_218/22%)]',
    bg:          'bg-cyan/8',
    border:      'border-cyan/15',
    sparkline:   'oklch(0.760 0.140 218)',
    sparkFill:   'oklch(0.760 0.140 218)',
    hoverShadow: '0 0 24px oklch(0.720 0.154 218 / 18%)',
  },
  blue: {
    icon:        'text-blue-accent',
    glow:        'group-hover:shadow-[0_0_32px_oklch(0.596_0.224_261/22%)]',
    bg:          'bg-blue-accent/8',
    border:      'border-blue-accent/15',
    sparkline:   'oklch(0.680 0.200 261)',
    sparkFill:   'oklch(0.680 0.200 261)',
    hoverShadow: '0 0 24px oklch(0.596 0.224 261 / 18%)',
  },
  pink: {
    icon:        'text-pink',
    glow:        'group-hover:shadow-[0_0_32px_oklch(0.650_0.274_339/22%)]',
    bg:          'bg-pink/8',
    border:      'border-pink/15',
    sparkline:   'oklch(0.710 0.250 339)',
    sparkFill:   'oklch(0.710 0.250 339)',
    hoverShadow: '0 0 24px oklch(0.650 0.274 339 / 18%)',
  },
}

function MiniSparkline({ data, accentColor }: { data: number[]; accentColor: AccentColor }) {
  const w = 84
  const h = 34
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const styles = ACCENT_STYLES[accentColor]

  const pts = data.map((v, i) => ({
    x: i * step,
    y: h - 4 - ((v - min) / range) * (h - 8),
  }))

  const linePts = pts.map(p => `${p.x},${p.y}`).join(' ')

  // Closed filled area path: left edge → line → right edge → bottom close
  const areaD = [
    `M0,${h}`,
    pts.map(p => `L${p.x},${p.y}`).join(' '),
    `L${w},${h}`,
    'Z',
  ].join(' ')

  const gradId = `spark-grad-${accentColor}`
  const fillId = `spark-fill-${accentColor}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={styles.sparkline} stopOpacity="0.6" />
          <stop offset="100%" stopColor={styles.sparkFill}  stopOpacity="1"   />
        </linearGradient>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={styles.sparkFill} stopOpacity="0.20" />
          <stop offset="100%" stopColor={styles.sparkFill} stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Filled area */}
      <path d={areaD} fill={`url(#${fillId})`} />

      {/* Line */}
      <polyline
        points={linePts}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Terminal dot */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r="2.5"
        fill={styles.sparkline}
        opacity="0.9"
      />
    </svg>
  )
}

interface KPICardProps {
  data: KPICardData
  index?: number
}

export function KPICard({ data, index = 0 }: KPICardProps) {
  const accent = ACCENT_STYLES[data.accentColor]
  const isPositive = data.changeType === 'positive'
  const isNegative = data.changeType === 'negative'
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  const trendColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-destructive' : 'text-muted-foreground'
  const defaultSparkline = [38, 44, 36, 58, 48, 66, 57, 74, 68, 82]

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5',
        'glass transition-all duration-300',
        'hover:border-glass-strong hover:-translate-y-1',
        accent.border,
        accent.glow,
      )}
      style={{ '--hover-shadow': accent.hoverShadow } as React.CSSProperties}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Radial glow blob — appears on hover */}
      <div
        className={cn(
          'absolute -right-8 -top-8 size-28 rounded-full opacity-0 blur-2xl',
          'transition-opacity duration-500 group-hover:opacity-100',
          accent.bg,
        )}
      />

      {/* Top-edge highlight stripe */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.sparkline}60, transparent)`,
        }}
      />

      {/* Icon + sparkline row */}
      <div className="relative flex items-start justify-between">
        <div className={cn('flex size-10 items-center justify-center rounded-xl', accent.bg)}>
          <data.icon className={cn('size-5', accent.icon)} />
        </div>
        <motion.div
          initial={{ opacity: 0.5 }}
          whileInView={{ opacity: 1 }}
          className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
        >
          <MiniSparkline
            data={data.sparkline ?? defaultSparkline}
            accentColor={data.accentColor}
          />
        </motion.div>
      </div>

      {/* Value */}
      <div className="relative mt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          {data.value}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{data.title}</p>
      </div>

      {/* Trend */}
      <div className="relative mt-3 flex items-center gap-2">
        <span className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
          <TrendIcon className="size-3.5" />
          {data.change}
        </span>
        {data.description && (
          <span className="text-xs text-muted-foreground">{data.description}</span>
        )}
      </div>
    </motion.div>
  )
}
