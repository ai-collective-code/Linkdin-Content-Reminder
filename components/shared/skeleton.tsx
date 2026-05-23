import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('shimmer rounded-xl', className)}
      {...props}
    />
  )
}

export function KPICardSkeleton() {
  return (
    <div className="glass rounded-2xl border border-glass p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-20 rounded-lg" />
    </div>
  )
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="glass rounded-2xl border border-glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <Skeleton className={cn('w-full rounded-xl')} style={{ height }} />
    </div>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export { Skeleton }
