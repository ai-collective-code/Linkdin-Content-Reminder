'use client'

import { create } from 'zustand'
import type { BreadcrumbItem } from '@/types'

interface UIState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  notificationPanelOpen: boolean
  mobileNavOpen: boolean
  breadcrumbs: BreadcrumbItem[]
  expandedNavGroups: string[]

  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (v: boolean) => void
  toggleCommandPalette: () => void
  setNotificationPanelOpen: (v: boolean) => void
  toggleNotificationPanel: () => void
  setMobileNavOpen: (v: boolean) => void
  toggleMobileNav: () => void
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  toggleNavGroup: (id: string) => void
  isNavGroupExpanded: (id: string) => boolean
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notificationPanelOpen: false,
  mobileNavOpen: false,
  breadcrumbs: [{ label: 'Overview' }],
  expandedNavGroups: ['cultural-intelligence'],

  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  setNotificationPanelOpen: (v) => set({ notificationPanelOpen: v }),
  toggleNotificationPanel: () =>
    set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),

  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),

  setBreadcrumbs: (items) => set({ breadcrumbs: items }),

  toggleNavGroup: (id) =>
    set((s) => ({
      expandedNavGroups: s.expandedNavGroups.includes(id)
        ? s.expandedNavGroups.filter((g) => g !== id)
        : [...s.expandedNavGroups, id],
    })),

  isNavGroupExpanded: (id) => get().expandedNavGroups.includes(id),
}))
