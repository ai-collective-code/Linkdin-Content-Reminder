'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  fadeIn,
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  slideInLeft,
  slideInRight,
} from '@/lib/animations'
import type { Variants } from 'framer-motion'

type AnimationVariant =
  | 'fadeIn'
  | 'fadeInUp'
  | 'scaleIn'
  | 'slideInLeft'
  | 'slideInRight'
  | 'staggerContainer'
  | 'staggerItem'

const VARIANTS: Record<AnimationVariant, Variants> = {
  fadeIn,
  fadeInUp,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
}

interface AnimatedContainerProps {
  children: React.ReactNode
  animation?: AnimationVariant
  delay?: number
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

export function AnimatedContainer({
  children,
  animation = 'fadeInUp',
  delay = 0,
  className,
  as = 'div',
}: AnimatedContainerProps) {
  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div
  const variants = VARIANTS[animation]

  return (
    <MotionComponent
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </MotionComponent>
  )
}

/* ── Stagger children wrapper ───────────────────────────────── */
export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}
