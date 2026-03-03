'use client'

import { createContext, useContext, useCallback, useRef, useSyncExternalStore } from 'react'

/* ═══════════════════════════════════════════════
 *  XP Window Manager
 *
 *  Manages multiple windows with z-ordering,
 *  minimize / maximize / close / move / resize.
 *  Drives the taskbar items.
 * ═══════════════════════════════════════════════ */

export type AppType = 'file-explorer' | 'internet-explorer' | 'vscode'

export interface XPWindowState {
  id: string
  appType: AppType
  title: string
  icon: string
  x: number
  y: number
  w: number
  h: number
  minW: number
  minH: number
  minimized: boolean
  maximized: boolean
  zIndex: number
  /** App-specific payload (initial path, url, etc.) */
  payload?: Record<string, unknown>
}

interface WMState {
  windows: XPWindowState[]
  nextZ: number
  /** id of the window that has focus (topmost non-minimized) */
  focusedId: string | null
}

type Listener = () => void

function createWindowManager(desktopW: number, desktopH: number) {
  let state: WMState = { windows: [], nextZ: 1, focusedId: null }
  const listeners = new Set<Listener>()

  function emit() {
    listeners.forEach((l) => l())
  }

  function subscribe(l: Listener) {
    listeners.add(l)
    return () => { listeners.delete(l) }
  }

  function getSnapshot(): WMState {
    return state
  }

  /* ── helpers ── */

  function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v))
  }

  function nextId() {
    return `win-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  }

  /* ── actions ── */

  function openWindow(appType: AppType, opts?: {
    title?: string
    icon?: string
    w?: number
    h?: number
    payload?: Record<string, unknown>
  }) {
    const id = nextId()
    const w = opts?.w ?? 700
    const h = opts?.h ?? 500
    // Cascade offset based on number of existing windows
    const cascade = (state.windows.length % 8) * 30
    const x = clamp(40 + cascade, 0, desktopW - w)
    const y = clamp(40 + cascade, 0, desktopH - 60)
    const zIndex = state.nextZ

    const title = opts?.title ?? (appType === 'file-explorer' ? 'Poste de travail' : 'Internet Explorer')
    const icon = opts?.icon ?? (appType === 'file-explorer' ? '📁' : '🌐')

    const win: XPWindowState = {
      id, appType, title, icon, x, y, w, h,
      minW: 250, minH: 180,
      minimized: false, maximized: false,
      zIndex,
      payload: opts?.payload,
    }

    state = {
      ...state,
      windows: [...state.windows, win],
      nextZ: zIndex + 1,
      focusedId: id,
    }
    emit()
    return id
  }

  function closeWindow(id: string) {
    state = {
      ...state,
      windows: state.windows.filter((w) => w.id !== id),
      focusedId: state.focusedId === id ? null : state.focusedId,
    }
    emit()
  }

  function focusWindow(id: string) {
    const win = state.windows.find((w) => w.id === id)
    if (!win) return

    const zIndex = state.nextZ
    state = {
      ...state,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex, minimized: false } : w
      ),
      nextZ: zIndex + 1,
      focusedId: id,
    }
    emit()
  }

  function minimizeWindow(id: string) {
    state = {
      ...state,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
      focusedId: state.focusedId === id ? null : state.focusedId,
    }
    emit()
  }

  function toggleMaximize(id: string) {
    state = {
      ...state,
      windows: state.windows.map((w) => {
        if (w.id !== id) return w
        if (w.maximized) {
          // Restore
          return { ...w, maximized: false }
        } else {
          // Maximize (full desktop minus taskbar)
          return {
            ...w,
            maximized: true,
            // Store previous position in payload so we can restore
            payload: { ...w.payload, _prevX: w.x, _prevY: w.y, _prevW: w.w, _prevH: w.h },
          }
        }
      }),
    }
    emit()
  }

  function moveWindow(id: string, x: number, y: number) {
    state = {
      ...state,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y, maximized: false } : w
      ),
    }
    emit()
  }

  function resizeWindow(id: string, w: number, h: number) {
    const win = state.windows.find((wn) => wn.id === id)
    if (!win) return

    state = {
      ...state,
      windows: state.windows.map((wn) =>
        wn.id === id
          ? { ...wn, w: Math.max(wn.minW, w), h: Math.max(wn.minH, h), maximized: false }
          : wn
      ),
    }
    emit()
  }

  function updateTitle(id: string, title: string) {
    state = {
      ...state,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, title } : w
      ),
    }
    emit()
  }

  return {
    subscribe,
    getSnapshot,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
    updateTitle,
  }
}

export type WindowManager = ReturnType<typeof createWindowManager>

/* ── React context ── */

const WMContext = createContext<WindowManager | null>(null)

export function WMProvider({
  desktopW,
  desktopH,
  children,
}: {
  desktopW: number
  desktopH: number
  children: React.ReactNode
}) {
  const wmRef = useRef<WindowManager | null>(null)
  if (!wmRef.current) {
    wmRef.current = createWindowManager(desktopW, desktopH)
  }
  return <WMContext.Provider value={wmRef.current}>{children}</WMContext.Provider>
}

export function useWM(): WindowManager {
  const wm = useContext(WMContext)
  if (!wm) throw new Error('useWM must be used inside WMProvider')
  return wm
}

export function useWMState(): WMState {
  const wm = useWM()
  return useSyncExternalStore(wm.subscribe, wm.getSnapshot, wm.getSnapshot)
}

export function useWindowState(id: string): XPWindowState | undefined {
  const { windows } = useWMState()
  return windows.find((w) => w.id === id)
}
