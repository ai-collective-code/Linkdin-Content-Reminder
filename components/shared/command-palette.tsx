'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { COMMAND_GROUPS } from '@/lib/constants'
import { useCommandPalette } from '@/hooks/use-command'

export function CommandPalette() {
  const router = useRouter()
  const { open, setOpen } = useCommandPalette()
  const [query, setQuery] = useState('')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          'overflow-hidden p-0 shadow-2xl',
          'glass-strong border-glass-strong',
          'max-w-lg rounded-2xl',
          '[&>button]:hidden',
        )}
      >
        <Command
          className="bg-transparent"
          shouldFilter={true}
        >
          <div className="flex items-center gap-3 border-b border-glass px-4">
            <CommandInput
              placeholder="Search commands, pages, actions..."
              value={query}
              onValueChange={setQuery}
              className="h-12 border-0 bg-transparent text-sm placeholder:text-muted-foreground focus:ring-0"
            />
            <kbd className="hidden shrink-0 items-center gap-1 rounded-lg border border-glass bg-surface-1 px-2 py-1 text-label text-muted-foreground sm:flex">
              esc
            </kbd>
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto p-2">
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>

            {COMMAND_GROUPS.map((group, i) => (
              <CommandGroup
                key={group.label}
                heading={group.label}
                className="[&>*[cmdk-group-heading]]:text-label [&>*[cmdk-group-heading]]:text-muted-foreground [&>*[cmdk-group-heading]]:px-2 [&>*[cmdk-group-heading]]:py-1.5"
              >
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => {
                      if (item.href) router.push(item.href)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5',
                      'aria-selected:bg-surface-2 aria-selected:text-foreground',
                      'text-foreground/80 transition-colors',
                    )}
                  >
                    {item.icon && (
                      <div className="flex size-7 items-center justify-center rounded-lg bg-surface-2">
                        <item.icon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.shortcut && (
                      <div className="flex items-center gap-1">
                        {item.shortcut.map((key, ki) => (
                          <kbd
                            key={ki}
                            className="rounded-md border border-glass bg-surface-1 px-1.5 py-0.5 text-label text-muted-foreground"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>

          <div className="border-t border-glass px-4 py-2.5">
            <div className="flex items-center gap-4 text-label text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-glass bg-surface-1 px-1.5 py-0.5">↵</kbd>
                Open
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-glass bg-surface-1 px-1.5 py-0.5">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-glass bg-surface-1 px-1.5 py-0.5">esc</kbd>
                Close
              </span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
