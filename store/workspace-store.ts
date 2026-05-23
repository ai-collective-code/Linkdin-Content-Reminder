'use client'

import { create } from 'zustand'
import { DEFAULT_WORKSPACES } from '@/lib/constants'
import type { Workspace } from '@/types'

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspaceId: string
  currentWorkspace: () => Workspace

  setCurrentWorkspace: (id: string) => void
  addWorkspace: (w: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: DEFAULT_WORKSPACES,
  currentWorkspaceId: DEFAULT_WORKSPACES[0].id,

  currentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get()
    return workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0]
  },

  setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),

  addWorkspace: (w) =>
    set((s) => ({ workspaces: [...s.workspaces, w] })),
}))
