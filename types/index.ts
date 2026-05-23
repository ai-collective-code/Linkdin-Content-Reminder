import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  children?: NavItem[]
  featured?: boolean
  badge?: string
}

export interface Workspace {
  id: string
  name: string
  plan: 'Free' | 'Pro' | 'Enterprise'
  avatar: string
  color: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface KPICardData {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  description?: string
  icon: LucideIcon
  accentColor: 'purple' | 'cyan' | 'blue' | 'pink'
  sparkline?: number[]
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'ai'
}

export interface CommandGroup {
  label: string
  items: CommandItem[]
}

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: LucideIcon
  shortcut?: string[]
  href?: string
  group: string
}

export type AccentColor = 'purple' | 'cyan' | 'blue' | 'pink'

export interface FeatureModule {
  id: string
  name: string
  description: string
  icon: LucideIcon
  href: string
  accentColor: AccentColor
  status: 'stable' | 'beta' | 'coming-soon'
}
