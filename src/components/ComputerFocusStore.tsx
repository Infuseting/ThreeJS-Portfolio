'use client'

import React, {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  useCallback,
} from 'react'

/* ─────────────────────────────────────────────
 *  Computer‑focus store
 *
 *  When the player interacts with a computer the
 *  camera locks in front of the screen and the
 *  player controls are disabled.
 *
 *  Any component can read `isFocused` and the
 *  Computer component (or Escape key) can call
 *  `enter` / `exit`.
 * ───────────────────────────────────────────── */

type Listener = () => void

export interface FocusState {
  /** Is the player currently focused on a computer? */
  focused: boolean
  /** World position the camera should lerp to */
  cameraPosition: [number, number, number]
  /** World point the camera should look at */
  cameraTarget: [number, number, number]
}

interface FocusStore {
  get: () => FocusState
  enter: (cameraPosition: [number, number, number], cameraTarget: [number, number, number]) => void
  exit: () => void
  subscribe: (listener: Listener) => () => void
}

const DEFAULT: FocusState = {
  focused: false,
  cameraPosition: [0, 0, 0],
  cameraTarget: [0, 0, 0],
}

function createFocusStore(): FocusStore {
  let state: FocusState = { ...DEFAULT }
  const listeners = new Set<Listener>()
  const notify = () => listeners.forEach((l) => l())

  return {
    get: () => state,
    enter: (cameraPosition, cameraTarget) => {
      state = { focused: true, cameraPosition, cameraTarget }
      notify()
    },
    exit: () => {
      if (!state.focused) return
      state = { ...DEFAULT }
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/* ── React context ── */

const FocusCtx = createContext<FocusStore | null>(null)

export function ComputerFocusProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<FocusStore | null>(null)
  if (!ref.current) ref.current = createFocusStore()
  return <FocusCtx.Provider value={ref.current}>{children}</FocusCtx.Provider>
}

export function useComputerFocus(): FocusState {
  const store = useContext(FocusCtx)
  if (!store) throw new Error('useComputerFocus must be inside <ComputerFocusProvider>')
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

export function useComputerFocusActions() {
  const store = useContext(FocusCtx)
  if (!store) throw new Error('useComputerFocusActions must be inside <ComputerFocusProvider>')
  const enter = useCallback(
    (pos: [number, number, number], target: [number, number, number]) => store.enter(pos, target),
    [store],
  )
  const exit = useCallback(() => store.exit(), [store])
  return { enter, exit }
}
