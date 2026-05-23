'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Bot, CheckCircle2, Info, AlertTriangle, X, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { panelVariants, notifBadgeVariants } from '@/lib/animations'
import { NOTIFICATION_SAMPLES } from '@/lib/constants'
import type { NotificationItem } from '@/types'

const TYPE_CONFIG = {
  ai:      { icon: Bot,           color: 'text-purple',  bg: 'bg-purple/10'  },
  success: { icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  info:    { icon: Info,          color: 'text-cyan',    bg: 'bg-cyan/10'    },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
}

function NotifItem({ item }: { item: NotificationItem }) {
  const cfg = TYPE_CONFIG[item.type]
  return (
    <div
      className={cn(
        'group flex gap-3 rounded-xl p-3 transition-colors',
        item.read ? 'opacity-60' : 'bg-surface-1',
        'hover:bg-surface-2',
      )}
    >
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
        <cfg.icon className={cn('size-4', cfg.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm', item.read ? 'font-normal text-foreground/70' : 'font-medium text-foreground')}>
          {item.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        <p className="mt-1.5 text-label text-muted-foreground/60">{item.time}</p>
      </div>
      {!item.read && (
        <div className="mt-1 size-2 shrink-0 rounded-full bg-purple" />
      )}
    </div>
  )
}

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATION_SAMPLES)
  const unread = items.filter((i) => !i.read).length

  const markAllRead = () =>
    setItems((prev) => prev.map((i) => ({ ...i, read: true })))

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-2xl',
              'glass-strong border border-glass-strong shadow-2xl',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-glass px-4 py-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple px-1 text-xs font-medium text-white">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
                  >
                    <Check className="size-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="max-h-[420px] overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Bell className="size-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">You're all caught up</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NotifItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-glass px-4 py-3">
              <button className="text-xs font-medium text-purple/80 transition-colors hover:text-purple">
                View all notifications →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Bell icon with badge ────────────────────────────────────── */
export function NotificationBell({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex size-9 items-center justify-center rounded-xl',
        'glass-hover border border-glass transition-all duration-200',
        'text-muted-foreground hover:text-foreground',
      )}
    >
      <Bell className="size-4.5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            variants={notifBadgeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-purple px-1 text-[10px] font-bold text-white"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
