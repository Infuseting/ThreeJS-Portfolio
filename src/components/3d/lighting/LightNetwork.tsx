'use client'

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useState,
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

// Config context to control display options for light fixtures (e.g. hide 3D fixtures)
const LightConfigContext = createContext<{ showFixtures: boolean } | null>(null)

/** Wrap your scene (or part of it) with this provider to enable the light / switch network. */
export function LightNetworkProvider({
  defaults,
  showFixtures = true,
  children,
}: {
  /** Optionally set initial on/off values per channel, e.g. `{ hallway: false }` */
  defaults?: Record<string, boolean>
  /** Whether to render 3D fixtures (bulbs, cables) by default inside SwitchableLight */
  showFixtures?: boolean
  children: React.ReactNode
}) {
  // Create store once using useState initializer to avoid ref access during render
  const [store] = useState<LightStore>(() => createLightStore(defaults))

  return (
    <LightStoreContext.Provider value={store}>
      <LightConfigContext.Provider value={{ showFixtures }}>
        {children}
      </LightConfigContext.Provider>
    </LightStoreContext.Provider>
  )
}

/** Hook – read light system configuration (e.g. showFixtures) */
export function useLightConfig() {
  const cfg = useContext(LightConfigContext)
  if (!cfg) throw new Error('useLightConfig must be used inside <LightNetworkProvider>')
  return cfg
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
