import {
  LayoutDashboard,
  Globe,
  Sparkles,
  FileText,
  Bot,
  Settings,
  Zap,
  Search,
} from 'lucide-react'
import type { NavItem, Workspace, CommandItem } from '@/types'

export const APP_NAME = 'Cultural Intelligence Engine'
export const APP_SHORT_NAME = 'CIE'

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'events',
    label: 'Campaign Status',
    icon: Globe,
    href: '/intelligence',
  },
  {
    id: 'prompt-lab',
    label: 'Prompt Lab',
    icon: Sparkles,
    href: '/intelligence/analysis',
  },
  {
    id: 'saved',
    label: 'Saved Content',
    icon: FileText,
    href: '/content/calendar',
  },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: 'ai-generator',
    label: 'AI Generator',
    icon: Bot,
    href: '/ai',
    featured: true,
    badge: 'LIVE',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

export const DEFAULT_WORKSPACES: Workspace[] = [
  { id: '1', name: 'AI Collective',   plan: 'Enterprise', avatar: 'A', color: 'purple' },
  { id: '2', name: 'Cultural Lab',    plan: 'Pro',        avatar: 'C', color: 'cyan'   },
  { id: '3', name: 'Global Insights', plan: 'Pro',        avatar: 'G', color: 'blue'   },
]

export const COMMAND_GROUPS: { label: string; items: CommandItem[] }[] = [
  {
    label: 'Navigation',
    items: [
      { id: 'nav-workspace', label: 'Go to Workspace',    icon: LayoutDashboard, href: '/',                       group: 'Navigation' },
      { id: 'nav-events',    label: 'Campaign Status',    icon: Globe,           href: '/intelligence',           group: 'Navigation' },
      { id: 'nav-prompts',   label: 'Prompt Lab',         icon: Sparkles,        href: '/intelligence/analysis',  group: 'Navigation' },
      { id: 'nav-saved',     label: 'Saved Content',      icon: FileText,        href: '/content/calendar',       group: 'Navigation' },
      { id: 'nav-ai',        label: 'AI Generator',       icon: Bot,             href: '/ai',                     group: 'Navigation' },
    ],
  },
  {
    label: 'Actions',
    items: [
      { id: 'action-generate', label: 'Generate LinkedIn Post', icon: Zap,    group: 'Actions' },
      { id: 'action-search',   label: 'Search Events',          icon: Search, group: 'Actions' },
    ],
  },
]

export const NOTIFICATION_SAMPLES = [
  {
    id: '1',
    title: 'New event available',
    description: 'Diwali 2026 has been added to your event sheet with campaign intelligence.',
    time: '2m ago',
    read: false,
    type: 'ai' as const,
  },
  {
    id: '2',
    title: 'Content generated',
    description: 'LinkedIn post for Eid ul-Adha generated and ready to copy.',
    time: '1h ago',
    read: false,
    type: 'success' as const,
  },
  {
    id: '3',
    title: 'Sheet sync complete',
    description: 'Google Sheets data refreshed — 12 events loaded.',
    time: '3h ago',
    read: true,
    type: 'info' as const,
  },
]
