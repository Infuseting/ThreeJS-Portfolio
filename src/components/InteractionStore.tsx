'use client'

import React, {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
} from 'react'

/* ─────────────────────────────────────────────
 *  Interaction store
 *
 *  Tracks which interactive object the player
 *  is currently looking at (raycast from camera
 *  centre). Consumed by the HUD and by each
 *  interactive component for highlight.
 * ───────────────────────────────────────────── */

type Listener = () => void

export interface InteractionTarget {
  /** Unique id of the interactive element */
  id: string
  /** Label to show on the HUD, e.g. "Ouvrir la porte" */
  label: string
  /** Key hint, e.g. "E" */
  key: string
}

interface InteractionStore {
  get: () => InteractionTarget | null
  set: (target: InteractionTarget | null) => void
  subscribe: (listener: Listener) => () => void
}

function createInteractionStore(): InteractionStore {
  let current: InteractionTarget | null = null
  const listeners = new Set<Listener>()
  const notify = () => listeners.forEach((l) => l())

  return {
    get: () => current,
    set: (target) => {
      // Notify when anything meaningful changes: id, label or key.
      const same =
        (current === null && target === null) ||
        (current !== null && target !== null &&
          current.id === target.id &&
          current.label === target.label &&
          current.key === target.key)

      if (same) return

      current = target
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/* ── React context ── */

const InteractionCtx = createContext<InteractionStore | null>(null)

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<InteractionStore | null>(null)
  if (!storeRef.current) storeRef.current = createInteractionStore()

  return (
    <InteractionCtx.Provider value={storeRef.current}>
      {children}
    </InteractionCtx.Provider>
  )
}

/** Read the current interaction target (reactive). */
export function useInteractionTarget(): InteractionTarget | null {
  const store = useContext(InteractionCtx)
  if (!store) throw new Error('useInteractionTarget must be inside <InteractionProvider>')
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

/** Get the raw store (for the raycaster to call `.set()`). */
export function useInteractionStore(): InteractionStore {
  const store = useContext(InteractionCtx)
  if (!store) throw new Error('useInteractionStore must be inside <InteractionProvider>')
  return store
}
