'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui-store'
import type { BreadcrumbItem } from '@/types'

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items: propItems, className }: BreadcrumbProps) {
  const storeBreadcrumbs = useUIStore((s) => s.breadcrumbs)
  const items = propItems ?? storeBreadcrumbs

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-sm', className)}
    >
      <Link
        href="/"
        className="flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
      >
        <Home className="size-3.5" />
      </Link>

      {items.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-muted-foreground/50" />
          {crumb.href && i < items.length - 1 ? (
            <Link
              href={crumb.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className={cn(
                i === items.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
