'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronDown, Zap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, BOTTOM_NAV_ITEMS, APP_SHORT_NAME } from '@/lib/constants'
import { useSidebar } from '@/hooks/use-sidebar'
import { useUIStore } from '@/store/ui-store'
import { WorkspaceSwitcher } from '@/components/shared/workspace-switcher'
import { UserProfile } from '@/components/shared/user-profile'
import {
  sidebarVariants,
  sidebarItemLabelVariants,
  staggerContainer,
  staggerItem,
} from '@/lib/animations'
import type { NavItem } from '@/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/* ─── Logo ─────────────────────────────────────────────────── */
function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-1">
      <div
        className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple to-cyan"
        style={{ boxShadow: '0 0 0 1px oklch(0.560 0.268 279 / 30%), 0 0 16px oklch(0.560 0.268 279 / 22%), inset 0 1px 0 oklch(1 0 0 / 20%)' }}
      >
        <Sparkles className="size-4 text-white" />
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="whitespace-nowrap text-sm font-bold tracking-tight text-foreground">
              {APP_SHORT_NAME}
            </p>
            <p className="text-label whitespace-nowrap text-muted-foreground leading-none">
              Intelligence Engine
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Single nav item ───────────────────────────────────────── */
function NavItemButton({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
  onClick?: () => void
}) {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5',
        'transition-all duration-200',
        active
          ? 'bg-purple/10 text-foreground'
          : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-purple/12 ring-1 ring-purple/30"
          style={{ boxShadow: 'inset 0 1px 0 oklch(0.560 0.268 279 / 18%), 0 0 12px oklch(0.560 0.268 279 / 12%)' }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Icon */}
      <span
        className={cn(
          'relative z-10 flex size-5 shrink-0 items-center justify-center transition-colors',
          active ? 'text-purple' : 'text-muted-foreground group-hover:text-foreground/80',
        )}
      >
        <item.icon className="size-[18px]" />
      </span>

      {/* Label */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            variants={sidebarItemLabelVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="relative z-10 flex-1 truncate text-left text-sm font-medium"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge */}
      {item.badge && !collapsed && (
        <span className="relative z-10 rounded-md bg-purple/20 px-1.5 py-0.5 text-label text-purple">
          {item.badge}
        </span>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="right" sideOffset={8}>
          <p className="text-xs font-medium">{item.label}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

/* ─── Nav group (parent with children) ─────────────────────── */
function NavGroup({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem
  collapsed: boolean
  pathname: string
}) {
  const { toggleNavGroup, isNavGroupExpanded } = useUIStore()
  const expanded = isNavGroupExpanded(item.id)
  const isActive = pathname.startsWith(item.href)
  const isChildActive = item.children?.some((c) => pathname === c.href) ?? false

  return (
    <div>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={() => toggleNavGroup(item.id)}
                className={cn(
                  'group relative flex w-full items-center justify-center rounded-xl px-2 py-2.5',
                  'transition-all duration-200',
                  isActive || isChildActive
                    ? 'bg-purple/10 text-purple'
                    : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
                )}
              >
                {(isActive || isChildActive) && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-purple/10 ring-1 ring-purple/25"
                  />
                )}
                <item.icon className="relative z-10 size-[18px]" />
              </button>
            }
          />
          <TooltipContent side="right" sideOffset={8}>
            <p className="text-xs font-medium">{item.label}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <>
          <button
            onClick={() => toggleNavGroup(item.id)}
            className={cn(
              'group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5',
              'transition-all duration-200',
              isActive || isChildActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:bg-surface-1 hover:text-foreground',
            )}
          >
            <item.icon
              className={cn(
                'size-[18px] shrink-0 transition-colors',
                isActive || isChildActive ? 'text-purple' : 'text-muted-foreground group-hover:text-foreground/80',
              )}
            />
            <span className="flex-1 truncate text-left text-sm font-medium">{item.label}</span>
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180',
              )}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-0.5 border-l border-glass pl-3 pb-1 space-y-0.5">
                  {item.children?.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-2 py-2',
                          'text-sm transition-colors duration-150',
                          childActive
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground/80',
                        )}
                      >
                        <child.icon className="size-4 shrink-0" />
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

/* ─── Featured AI item ──────────────────────────────────────── */
function AINavItem({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const button = (
    <Link
      href={item.href}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2.5',
        'transition-all duration-200',
        'bg-gradient-to-r from-purple/15 to-cyan/10',
        'border border-purple/20 hover:border-purple/35',
        'hover:from-purple/20 hover:to-cyan/15',
        collapsed && 'justify-center px-2',
      )}
    >
      <div className="relative flex size-5 shrink-0 items-center justify-center">
        <item.icon className="size-[18px] text-purple" />
        <div className="absolute inset-0 rounded-full bg-purple/20 blur-md" />
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            variants={sidebarItemLabelVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="flex-1 truncate text-left text-sm font-semibold text-foreground"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {item.badge && !collapsed && (
        <span className="rounded-md bg-gradient-to-r from-purple/30 to-cyan/20 px-1.5 py-0.5 text-label text-cyan">
          {item.badge}
        </span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="right" sideOffset={8}>
          <p className="text-xs font-medium">{item.label}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

/* ─── Sidebar root ──────────────────────────────────────────── */
export function Sidebar() {
  const { collapsed, toggle } = useSidebar()
  const pathname = usePathname()

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      initial={false}
      className={cn(
        'sidebar-glow-line',
        'relative flex h-full flex-col',
        'glass border-r border-glass',
        'overflow-hidden',
      )}
    >
      {/* Toggle button */}
      <button
        suppressHydrationWarning
        onClick={toggle}
        className={cn(
          'absolute -right-3.5 top-20 z-20',
          'flex size-7 items-center justify-center rounded-full',
          'glass border border-glass-strong shadow-xl',
          'text-muted-foreground hover:text-foreground',
          'transition-all duration-200 hover:scale-105',
        )}
      >
        {collapsed
          ? <ChevronRight className="size-3.5" />
          : <ChevronLeft className="size-3.5" />
        }
      </button>

      {/* Header */}
      <div className="flex-none border-b border-glass p-3 space-y-3">
        <SidebarLogo collapsed={collapsed} />
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            if (item.children) {
              return (
                <NavGroup
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              )
            }

            const active = pathname === item.href
            return (
              <Link key={item.id} href={item.href}>
                <NavItemButton
                  item={item}
                  collapsed={collapsed}
                  active={active}
                />
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="my-3 border-t border-glass" />

        {/* Bottom nav items */}
        <nav className="space-y-0.5">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            if (item.featured) {
              return <AINavItem key={item.id} item={item} collapsed={collapsed} active={active} />
            }
            return (
              <Link key={item.id} href={item.href}>
                <NavItemButton item={item} collapsed={collapsed} active={active} />
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="flex-none border-t border-glass p-3">
        <UserProfile collapsed={collapsed} />
      </div>
    </motion.aside>
  )
}
