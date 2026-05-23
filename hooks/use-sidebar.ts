'use client'

import { useUIStore } from '@/store/ui-store'

export function useSidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed)

  return { collapsed, toggle, setCollapsed }
}
