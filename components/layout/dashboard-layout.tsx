'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CommandPalette } from '@/components/shared/command-palette'
import { useCommandPalette } from '@/hooks/use-command'
import { pageTransition } from '@/lib/animations'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

/* Cinematic ambient orbs — fixed behind all content */
function AmbientAtmosphere() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Primary purple orb — top-left */}
      <div className="ambient-orb-1 absolute -top-72 -left-48 h-[680px] w-[680px] rounded-full bg-purple opacity-[0.055] blur-[130px]" />
      {/* Secondary cyan orb — right-center */}
      <div className="ambient-orb-2 absolute top-[35%] -right-56 h-[540px] w-[540px] rounded-full bg-cyan opacity-[0.040] blur-[110px]" />
      {/* Accent pink orb — bottom */}
      <div className="ambient-orb-3 absolute -bottom-64 left-[28%] h-[480px] w-[480px] rounded-full bg-pink opacity-[0.030] blur-[100px]" />
      {/* Subtle blue — mid-left */}
      <div className="absolute top-[55%] -left-32 h-[320px] w-[320px] rounded-full bg-blue-accent opacity-[0.025] blur-[90px]" />
    </div>
  )
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  useCommandPalette()

  return (
    <div className={cn('relative flex h-screen overflow-hidden bg-background bg-mesh-dark', className)}>
      {/* Living ambient background */}
      <AmbientAtmosphere />

      {/* Desktop sidebar — above atmosphere */}
      <div className="relative z-10 hidden lg:flex lg:flex-none">
        <Sidebar />
      </div>

      {/* Mobile nav drawer */}
      <MobileNav />

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            key="page-content"
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Global command palette */}
      <CommandPalette />
    </div>
  )
}
