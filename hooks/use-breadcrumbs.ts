'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'
import type { BreadcrumbItem } from '@/types'

export function useBreadcrumbs(items: BreadcrumbItem[]) {
  const setBreadcrumbs = useUIStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs(items)
    return () => setBreadcrumbs([{ label: 'Overview' }])
  }, [setBreadcrumbs])
}
