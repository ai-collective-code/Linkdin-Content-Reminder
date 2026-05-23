import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'strong'
  glow?: 'none' | 'purple' | 'cyan' | 'blue' | 'pink'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  highlight?: boolean  // top-edge gradient stripe
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = 'default',
      glow = 'none',
      padding = 'md',
      hoverable = false,
      highlight = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border transition-all duration-300',

          // Variant
          variant === 'default' && 'glass border-glass',
          variant === 'subtle'  && 'glass-subtle border-glass',
          variant === 'strong'  && 'glass-strong border-glass-strong',

          // Glow
          glow === 'purple' && 'glow-purple',
          glow === 'cyan'   && 'glow-cyan',
          glow === 'blue'   && 'glow-blue',
          glow === 'pink'   && 'glow-pink',

          // Padding
          padding === 'none' && '',
          padding === 'sm'   && 'p-4',
          padding === 'md'   && 'p-5 lg:p-6',
          padding === 'lg'   && 'p-6 lg:p-8',

          // Hoverable — lift + deeper shadow
          hoverable && [
            'cursor-pointer',
            'hover:-translate-y-1.5',
            'hover:border-glass-strong',
            'hover:shadow-[0_24px_56px_oklch(0_0_0/32%)]',
          ],

          className,
        )}
        {...props}
      >
        {/* Optional top-edge gradient highlight stripe */}
        {highlight && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, oklch(0.560 0.268 279 / 50%) 40%, oklch(0.720 0.154 218 / 40%) 60%, transparent 100%)',
            }}
          />
        )}

        {children}
      </div>
    )
  },
)

GlassCard.displayName = 'GlassCard'
