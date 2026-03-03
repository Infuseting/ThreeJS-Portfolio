'use client'

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useRef,
} from 'react'

/* ─────────────────────────────────────────────
 *  Light‑network store
 *
 *  A lightweight pub/sub store that maps a
 *  channel id → boolean (on / off).
 *  Both <SwitchableLight> and <LightSwitch>
 *  subscribe to the same channel.
 * ───────────────────────────────────────────── */

type Listener = () => void

interface LightStore {
  /** Get the current state of a channel */
  get: (channel: string) => boolean
  /** Toggle (or explicitly set) a channel */
  set: (channel: string, value?: boolean) => void
  /** Subscribe to any change */
  subscribe: (listener: Listener) => () => void
}

function createLightStore(defaults?: Record<string, boolean>): LightStore {
  let state: Record<string, boolean> = { ...defaults }
  const listeners = new Set<Listener>()

  const notify = () => listeners.forEach((l) => l())

  return {
    get: (channel) => state[channel] ?? true, // on by default
    set: (channel, value) => {
      const current = state[channel] ?? true
      state = { ...state, [channel]: value ?? !current }
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/* ── React context ── */

const LightStoreContext = createContext<LightStore | null>(null)

/** Wrap your scene (or part of it) with this provider to enable the light / switch network. */
export function LightNetworkProvider({
  defaults,
  children,
}: {
  /** Optionally set initial on/off values per channel, e.g. `{ hallway: false }` */
  defaults?: Record<string, boolean>
  children: React.ReactNode
}) {
  // Create store once
  const storeRef = useRef<LightStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createLightStore(defaults)
  }
  return (
    <LightStoreContext.Provider value={storeRef.current}>
      {children}
    </LightStoreContext.Provider>
  )
}

/** Hook – read the on/off value for a given channel (reactive). */
export function useLightChannel(channel: string): boolean {
  const store = useContext(LightStoreContext)
  if (!store) throw new Error('useLightChannel must be used inside <LightNetworkProvider>')
  return useSyncExternalStore(
    store.subscribe,
    () => store.get(channel),
    () => store.get(channel),
  )
}

/** Hook – returns a toggle function for a given channel. */
export function useToggleLight(channel: string): (value?: boolean) => void {
  const store = useContext(LightStoreContext)
  if (!store) throw new Error('useToggleLight must be used inside <LightNetworkProvider>')
  return useCallback((value?: boolean) => store.set(channel, value), [store, channel])
}
