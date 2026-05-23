'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, BOTTOM_NAV_ITEMS, APP_SHORT_NAME } from '@/lib/constants'
import { useUIStore } from '@/store/ui-store'
import { drawerVariants, overlayVariants } from '@/lib/animations'
import { WorkspaceSwitcher } from '@/components/shared/workspace-switcher'
import { UserProfile } from '@/components/shared/user-profile'

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useUIStore()
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col lg:hidden',
              'glass border-r border-glass',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-glass px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple to-cyan">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{APP_SHORT_NAME}</p>
                  <p className="text-label text-muted-foreground">Intelligence Engine</p>
                </div>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-1 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Workspace switcher */}
            <div className="border-b border-glass px-3 py-3">
              <WorkspaceSwitcher collapsed={false} />
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto p-3">
              <nav className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href ||
                    (item.children?.some((c) => pathname === c.href) ?? false)
                  return (
                    <div key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
                          'transition-colors duration-150',
                          active
                            ? 'bg-purple/10 font-medium text-foreground ring-1 ring-purple/20'
                            : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
                        )}
                      >
                        <item.icon
                          className={cn('size-[18px] shrink-0', active ? 'text-purple' : '')}
                        />
                        {item.label}
                      </Link>
                      {item.children && active && (
                        <div className="ml-4 mt-0.5 border-l border-glass pl-3 pb-1 space-y-0.5">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              onClick={() => setMobileNavOpen(false)}
                              className={cn(
                                'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm',
                                pathname === child.href
                                  ? 'font-medium text-foreground'
                                  : 'text-muted-foreground hover:text-foreground/80',
                              )}
                            >
                              <child.icon className="size-4 shrink-0" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>

              <div className="my-3 border-t border-glass" />

              <nav className="space-y-0.5">
                {BOTTOM_NAV_ITEMS.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
                        'transition-colors duration-150',
                        item.featured
                          ? 'bg-gradient-to-r from-purple/15 to-cyan/10 border border-purple/20 font-semibold text-foreground'
                          : active
                          ? 'bg-purple/10 font-medium text-foreground'
                          : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
                      )}
                    >
                      <item.icon
                        className={cn('size-[18px] shrink-0', item.featured && 'text-purple')}
                      />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto rounded-md bg-purple/20 px-1.5 py-0.5 text-label text-purple">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-glass p-3">
              <UserProfile collapsed={false} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
