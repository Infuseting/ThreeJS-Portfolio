'use client'

import { createContext, useContext, useCallback, useRef, useSyncExternalStore } from 'react'
import { APP_REGISTRY } from '../contexts/appRegistry'

/* ═══════════════════════════════════════════════
 *  XP Window Manager
 *
 *  Manages multiple windows with z-ordering,
 *  minimize / maximize / close / move / resize.
 *  Drives the taskbar items.
 * ═══════════════════════════════════════════════ */

export type AppType = 'file-explorer' | 'internet-explorer' | 'vscode' | 'minesweeper' | 'slitherio' | 'notepad' | 'cmd' | 'mediaplayer' | 'paint' | 'pinball' | 'cv' | 'taskmgr' | 'outlook' | 'control-panel' | 'git-tracker' | 'recycle-bin' | 'volume-mixer' | 'datetime' | 'tetris' | 'achievements'

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
  isFixedSize?: boolean
  /** App-specific payload (initial path, url, etc.) */
  payload?: Record<string, unknown>
}

interface WMState {
  windows: XPWindowState[]
  nextZ: number
  /** id of the window that has focus (topmost non-minimized) */
  focusedId: string | null
  /** Optional global cursor override, e.g. for resizing */
  overrideCursor?: 'default' | 'nwse' | 'nesw' | 'ns' | 'ew'
}

type Listener = () => void

function createWindowManager(desktopW: number, desktopH: number) {
  let state: WMState = { windows: [], nextZ: 1, focusedId: null, overrideCursor: 'default' }
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
    x?: number
    y?: number
    isFixedSize?: boolean
    payload?: Record<string, unknown>
  }) {
    const id = nextId()
    const config = APP_REGISTRY[appType]
    const w = opts?.w ?? config?.w ?? 700
    const h = opts?.h ?? config?.h ?? 500
    // Cascade offset based on number of existing windows
    const cascade = (state.windows.length % 8) * 30

    const rawX = opts?.x ?? (40 + cascade)
    const rawY = opts?.y ?? (40 + cascade)
    const x = clamp(rawX, -w + 60, desktopW - 60)
    const y = clamp(rawY, 0, desktopH - 70)
    const zIndex = state.nextZ

    const title = opts?.title ?? config?.title ?? appType
    const icon = opts?.icon ?? config?.icon ?? '📄'

    const win: XPWindowState = {
      id, appType, title, icon, x, y, w, h,
      minW: 250, minH: 180,
      minimized: false, maximized: false,
      zIndex,
      isFixedSize: opts?.isFixedSize,
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
      windows: state.windows.map((w) => {
        if (w.id !== id) return w

        // Clamp to prevent the title bar from going completely off-screen
        // Allow the window to be dragged partially off-screen horizontally,
        // but keep at least 60px visible.
        const clampX = clamp(x, -w.w + 60, desktopW - 60)

        // Prevent the top from going above the screen (y=0)
        // Prevent the title bar from going below the taskbar (desktopH - taskbarH - titlebarH)
        // Taskbar is 40px tall, title bar is ~30px. So max Y is desktopH - 70.
        const clampY = clamp(y, 0, desktopH - 70)

        return { ...w, x: clampX, y: clampY, maximized: false }
      }),
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

  function setOverrideCursor(cursor: 'default' | 'nwse' | 'nesw' | 'ns' | 'ew') {
    if (state.overrideCursor === cursor) return
    state = { ...state, overrideCursor: cursor }
    emit()
  }

  const wm = {
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
    setOverrideCursor,
  }

  // Open Notepad by default
  wm.openWindow('notepad')

  return wm
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
