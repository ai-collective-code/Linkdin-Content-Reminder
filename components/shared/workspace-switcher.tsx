'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace-store'
import { panelVariants } from '@/lib/animations'
import type { Workspace } from '@/types'

const AVATAR_COLORS: Record<string, string> = {
  purple: 'from-purple to-pink',
  cyan:   'from-cyan to-blue-accent',
  blue:   'from-blue-accent to-cyan',
}

function WorkspaceAvatar({ workspace, size = 'md' }: { workspace: Workspace; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'size-6 text-xs' : 'size-8 text-sm'
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br font-semibold text-white shrink-0',
        sz,
        AVATAR_COLORS[workspace.color] ?? 'from-purple to-cyan',
      )}
    >
      {workspace.avatar}
    </div>
  )
}

interface WorkspaceSwitcherProps {
  collapsed?: boolean
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false)
  const { workspaces, currentWorkspaceId, setCurrentWorkspace, currentWorkspace } =
    useWorkspaceStore()
  const current = currentWorkspace()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-2.5 py-2',
          'glass-hover transition-all duration-200',
          'group',
        )}
      >
        <WorkspaceAvatar workspace={current} />

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="flex min-w-0 flex-1 items-center justify-between overflow-hidden"
            >
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-foreground/90">{current.name}</p>
                <p className="text-label text-muted-foreground">{current.plan}</p>
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
                'absolute top-full left-0 z-50 mt-1 min-w-[220px] overflow-hidden rounded-2xl',
                'glass-strong border border-glass-strong shadow-2xl',
              )}
            >
              <div className="p-1.5">
                <p className="text-label px-3 py-2 text-muted-foreground">Workspaces</p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws.id)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
                      'transition-colors duration-150',
                      ws.id === currentWorkspaceId
                        ? 'bg-surface-2 text-foreground'
                        : 'text-foreground/80 hover:bg-surface-1',
                    )}
                  >
                    <WorkspaceAvatar workspace={ws} size="sm" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium">{ws.name}</p>
                      <p className="text-label text-muted-foreground">{ws.plan}</p>
                    </div>
                    {ws.id === currentWorkspaceId && (
                      <Check className="size-4 text-purple" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-glass p-1.5">
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground">
                  <div className="flex size-6 items-center justify-center rounded-lg border border-glass bg-surface-1">
                    <Plus className="size-3.5" />
                  </div>
                  Add workspace
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
