'use client'

import {
  useRef,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { useWM, useWindowState, type XPWindowState } from './WindowManager'

/* ═══════════════════════════════════════════════
 *  XP Window
 *
 *  Chrome: title-bar with icon + title + min/max/close,
 *  resize handles on all edges/corners, drag by title.
 *  Luna blue theme.
 *
 *  All drag/resize is driven by the virtual cursor
 *  (pointer-lock movementX/Y), so we expose callbacks
 *  that the parent desktop calls on mousemove/mousedown/mouseup.
 * ═══════════════════════════════════════════════ */

interface XPWindowProps {
  id: string
  /** Desktop dimensions for maximize bounds */
  desktopW: number
  desktopH: number
  /** Taskbar height (bottom) */
  taskbarH?: number
  /** Ref to the outer container div so we can compute screen→virtual scale */
  containerRef?: React.RefObject<HTMLDivElement | null>
  children: ReactNode
}

export function XPWindow({
  id,
  desktopW,
  desktopH,
  taskbarH = 30,
  containerRef,
  children,
}: XPWindowProps) {
  const wm = useWM()
  const win = useWindowState(id)

  // Drag / resize state
  const dragRef = useRef<{
    mode: 'move' | 'resize'
    edge?: string
    startX: number
    startY: number
    startWinX: number
    startWinY: number
    startWinW: number
    startWinH: number
  } | null>(null)

  if (!win) return null

  const isFocused = true // will check via parent; for now style always active
  const { minimized, maximized } = win

  // Effective bounds
  const x = maximized ? 0 : win.x
  const y = maximized ? 0 : win.y
  const w = maximized ? desktopW : win.w
  const h = maximized ? desktopH - taskbarH : win.h

  if (minimized) return null

  /** Convert a screen-pixel delta to virtual-desktop-pixel delta */
  const screenToVirtual = (dxScreen: number, dyScreen: number): { dx: number; dy: number } => {
    const el = containerRef?.current
    if (!el) return { dx: dxScreen, dy: dyScreen }
    const rect = el.getBoundingClientRect()
    return {
      dx: (dxScreen / rect.width) * desktopW,
      dy: (dyScreen / rect.height) * desktopH,
    }
  }

  /* ── Drag start (called from onPointerDown on title bar) ── */
  const onTitlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    if (maximized) return
    wm.focusWindow(id)

    // Capture all pointer events on this element until release
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)

    dragRef.current = {
      mode: 'move',
      edge: undefined,
      startX: e.clientX,
      startY: e.clientY,
      startWinX: win.x,
      startWinY: win.y,
      startWinW: win.w,
      startWinH: win.h,
    }

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d || d.mode !== 'move') return
      const { dx, dy } = screenToVirtual(ev.clientX - d.startX, ev.clientY - d.startY)
      wm.moveWindow(id, d.startWinX + dx, d.startWinY + dy)
    }
    const cleanup = () => {
      dragRef.current = null
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', cleanup)
      target.removeEventListener('pointercancel', cleanup)
      try { target.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    }
    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', cleanup)
    target.addEventListener('pointercancel', cleanup)
  }

  /* ── Resize start ── */
  const onResizePointerDown = (edge: string) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    wm.focusWindow(id)

    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)

    dragRef.current = {
      mode: 'resize',
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startWinX: win.x,
      startWinY: win.y,
      startWinW: win.w,
      startWinH: win.h,
    }

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d || d.mode !== 'resize' || !d.edge) return
      const { dx, dy } = screenToVirtual(ev.clientX - d.startX, ev.clientY - d.startY)

      let nx = d.startWinX
      let ny = d.startWinY
      let nw = d.startWinW
      let nh = d.startWinH

      if (d.edge.includes('e')) nw = d.startWinW + dx
      if (d.edge.includes('w')) { nw = d.startWinW - dx; nx = d.startWinX + dx }
      if (d.edge.includes('s')) nh = d.startWinH + dy
      if (d.edge.includes('n')) { nh = d.startWinH - dy; ny = d.startWinY + dy }

      nw = Math.max(win.minW, nw)
      nh = Math.max(win.minH, nh)
      wm.resizeWindow(id, nw, nh)
      wm.moveWindow(id, nx, ny)
    }
    const cleanup = () => {
      dragRef.current = null
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', cleanup)
      target.removeEventListener('pointercancel', cleanup)
      try { target.releasePointerCapture(e.pointerId) } catch { /* already released */ }
    }
    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', cleanup)
    target.addEventListener('pointercancel', cleanup)
  }

  /* ── Resize handles ── */
  const HANDLE = 6
  const handleStyle = (cursor: string, pos: CSSProperties): CSSProperties => ({
    position: 'absolute',
    ...pos,
    cursor,
    zIndex: 10,
  })

  return (
    <div
      onMouseDown={() => wm.focusWindow(id)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: win.zIndex,
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid #0054E3',
        borderRadius: maximized ? 0 : '4px 4px 0 0',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.35)',
        overflow: 'hidden',
        background: '#ECE9D8',
      }}
    >
      {/* ── Title bar ── */}
      <div
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => wm.toggleMaximize(id)}
        style={{
          background: 'linear-gradient(180deg, #0A246A 0%, #3A6EA5 8%, #3A6EA5 92%, #0A246A 100%)',
          height: 30,
          minHeight: 30,
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px',
          gap: 4,
          cursor: maximized ? 'default' : 'move',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 16, marginRight: 3 }}>{win.icon}</span>
        <span
          style={{
            flex: 1,
            color: '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
          }}
        >
          {win.title}
        </span>

        {/* Min */}
        <TitleBtn
          label="🗕"
          bg="linear-gradient(180deg, #3C8FD8, #2070B0)"
          onClick={() => wm.minimizeWindow(id)}
        />
        {/* Max / Restore */}
        <TitleBtn
          label={maximized ? '🗗' : '🗖'}
          bg="linear-gradient(180deg, #3C8FD8, #2070B0)"
          onClick={() => wm.toggleMaximize(id)}
        />
        {/* Close */}
        <TitleBtn
          label="✕"
          bg="linear-gradient(180deg, #E06050, #C03020)"
          onClick={() => wm.closeWindow(id)}
        />
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>

      {/* ── Resize handles (hidden when maximized) ── */}
      {!maximized && (
        <>
          {/* Edges */}
          <div onPointerDown={onResizePointerDown('n')} style={handleStyle('ns-resize', { top: 0, left: HANDLE, right: HANDLE, height: HANDLE })} />
          <div onPointerDown={onResizePointerDown('s')} style={handleStyle('ns-resize', { bottom: 0, left: HANDLE, right: HANDLE, height: HANDLE })} />
          <div onPointerDown={onResizePointerDown('w')} style={handleStyle('ew-resize', { left: 0, top: HANDLE, bottom: HANDLE, width: HANDLE })} />
          <div onPointerDown={onResizePointerDown('e')} style={handleStyle('ew-resize', { right: 0, top: HANDLE, bottom: HANDLE, width: HANDLE })} />
          {/* Corners */}
          <div onPointerDown={onResizePointerDown('nw')} style={handleStyle('nwse-resize', { top: 0, left: 0, width: HANDLE, height: HANDLE })} />
          <div onPointerDown={onResizePointerDown('ne')} style={handleStyle('nesw-resize', { top: 0, right: 0, width: HANDLE, height: HANDLE })} />
          <div onPointerDown={onResizePointerDown('sw')} style={handleStyle('nesw-resize', { bottom: 0, left: 0, width: HANDLE, height: HANDLE })} />
          <div onPointerDown={onResizePointerDown('se')} style={handleStyle('nwse-resize', { bottom: 0, right: 0, width: HANDLE, height: HANDLE })} />
        </>
      )}
    </div>
  )
}

/* ── Title-bar button ── */

function TitleBtn({
  label,
  bg,
  onClick,
}: {
  label: string
  bg: string
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        width: 24,
        height: 22,
        border: '1px solid rgba(0,0,0,0.3)',
        borderRadius: 3,
        background: hover ? 'linear-gradient(180deg, #FFD080, #FFB030)' : bg,
        color: '#fff',
        fontSize: 12,
        lineHeight: '20px',
        textAlign: 'center',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </button>
  )
}
