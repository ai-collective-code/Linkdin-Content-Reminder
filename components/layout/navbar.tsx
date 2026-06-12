'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Menu, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui-store'
import { useCommandPalette } from '@/hooks/use-command'
import { NotificationBell, NotificationCenter } from '@/components/shared/notification-center'
import { NOTIFICATION_SAMPLES } from '@/lib/constants'
import { fadeInDown } from '@/lib/animations'

export function Navbar() {
  const { toggleMobileNav, breadcrumbs, notificationPanelOpen, setNotificationPanelOpen } =
    useUIStore()
  const { setOpen: setCommandOpen } = useCommandPalette()
  const unreadCount = NOTIFICATION_SAMPLES.filter((n) => !n.read).length
  const [searchHovered, setSearchHovered] = useState(false)

  return (
    <motion.header
      variants={fadeInDown}
      initial={false}
      animate="visible"
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-4 px-4 lg:px-6',
        'glass border-b border-glass',
      )}
    >
      {/* Mobile menu trigger */}
      <button
        onClick={toggleMobileNav}
        className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Breadcrumb — desktop */}
      <div className="hidden items-center gap-1.5 lg:flex">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="size-3 text-muted-foreground/30" />
            )}
            <span
              className={cn(
                'text-sm transition-colors',
                i === breadcrumbs.length - 1
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80 cursor-pointer',
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </div>

      {/* Search bar — center — premium treatment */}
      <div className="flex flex-1 justify-center">
        <motion.button
          onClick={() => setCommandOpen(true)}
          onHoverStart={() => setSearchHovered(true)}
          onHoverEnd={() => setSearchHovered(false)}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.998 }}
          className={cn(
            'relative flex h-9 w-full max-w-[380px] items-center gap-3 rounded-xl px-3.5',
            'border text-sm text-muted-foreground',
            'transition-all duration-200',
            searchHovered
              ? 'border-purple/35 bg-purple/5 text-foreground/70 shadow-[0_0_16px_oklch(0.560_0.268_279/12%)]'
              : 'glass-hover border-glass',
          )}
        >
          <Search className="size-4 shrink-0 transition-colors" />
          <span className="flex-1 text-left text-sm select-none">Search or run a command…</span>
          <div className="flex shrink-0 items-center gap-0.5">
            <kbd className={cn(
              'rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors',
              searchHovered
                ? 'border-purple/30 bg-purple/10 text-purple/80'
                : 'border-glass bg-surface-1 text-muted-foreground',
            )}>
              ⌘K
            </kbd>
          </div>
        </motion.button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <NotificationBell
            count={unreadCount}
            onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
          />
          <NotificationCenter
            open={notificationPanelOpen}
            onClose={() => setNotificationPanelOpen(false)}
          />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-glass-border" />

        {/* Avatar — premium gradient ring */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-purple to-pink text-xs font-semibold text-white"
          style={{
            boxShadow: '0 0 0 2px oklch(0.560 0.268 279 / 22%), 0 0 12px oklch(0.560 0.268 279 / 15%)',
          }}
        >
          MB
        </motion.button>
      </div>
    </motion.header>
  )
}
