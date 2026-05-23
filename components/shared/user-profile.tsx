'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, User, CreditCard, Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { panelVariants } from '@/lib/animations'

const USER = {
  name: 'Mahi Bajaj',
  email: 'tech@aicollective.agency',
  role: 'Admin',
  initials: 'MB',
}

interface UserProfileProps {
  collapsed?: boolean
}

export function UserProfile({ collapsed = false }: UserProfileProps) {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { icon: User,       label: 'Profile',       desc: 'View your profile' },
    { icon: Settings,   label: 'Settings',      desc: 'App preferences' },
    { icon: CreditCard, label: 'Billing',       desc: 'Plans & usage' },
    { icon: Bell,       label: 'Notifications', desc: 'Alert preferences' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-2.5 py-2',
          'glass-hover transition-all duration-200',
        )}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-purple to-pink text-xs font-semibold text-white">
            {USER.initials}
          </div>
          <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-400" />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="flex min-w-0 flex-1 items-center justify-between overflow-hidden"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground/90">{USER.name}</p>
                <p className="truncate text-xs text-muted-foreground">{USER.email}</p>
              </div>
              <ChevronDown
                className={cn(
                  'size-4 text-muted-foreground transition-transform duration-200',
                  open && 'rotate-180',
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'absolute bottom-full left-0 z-50 mb-1 min-w-[220px] overflow-hidden rounded-2xl',
                'glass-strong border border-glass-strong shadow-2xl',
              )}
            >
              {/* Header */}
              <div className="border-b border-glass px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-purple to-pink text-sm font-semibold text-white">
                    {USER.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{USER.name}</p>
                    <p className="text-xs text-muted-foreground">{USER.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-surface-1 hover:text-foreground"
                  >
                    <item.icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-glass p-1.5">
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
