import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  badge?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SectionHeader({
  title,
  description,
  actions,
  badge,
  className,
  size = 'md',
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1
            className={cn(
              'font-bold tracking-tight text-foreground',
              {
                'text-xl':    size === 'sm',
                'text-2xl lg:text-3xl': size === 'md',
                'text-3xl lg:text-4xl': size === 'lg',
              },
            )}
          >
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className={cn('text-muted-foreground', size === 'sm' ? 'text-sm' : 'text-base')}>
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {actions}
        </div>
      )}
    </div>
  )
}

/* ── Sub-section label ──────────────────────────────────────── */
export function SubSectionLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-label text-muted-foreground', className)}>
      {children}
    </p>
  )
}
