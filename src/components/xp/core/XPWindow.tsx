'use client'

import {
  useCallback,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { useWM, useWindowState, type WindowManager, type XPWindowState } from './WindowManager'
import { useWindowDrag } from '@/hooks/ui/useWindowDrag'
import { useWindowResize } from '@/hooks/ui/useWindowResize'

/* ═══════════════════════════════════════════════
 *  XP Window
 *
 *  Chrome: title-bar with icon + title + min/max/close,
 *  resize handles on all edges/corners, drag by title.
 *  Luna blue theme.
 *
 *  Drag/resize logic extracted into useWindowDrag
 *  and useWindowResize hooks (SRP).
 * ═══════════════════════════════════════════════ */

interface XPWindowProps {
  id: string
  desktopW: number
  desktopH: number
  taskbarH?: number
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

  const screenToVirtual = useCallback(
    (dxScreen: number, dyScreen: number): { dx: number; dy: number } => {
      const el = containerRef?.current
      if (!el) return { dx: dxScreen, dy: dyScreen }
      const rect = el.getBoundingClientRect()
      return {
        dx: (dxScreen / rect.width) * desktopW,
        dy: (dyScreen / rect.height) * desktopH,
      }
    },
    [containerRef, desktopW, desktopH],
  )

  if (!win) return null

  const { minimized, maximized } = win
  const x = maximized ? 0 : win.x
  const y = maximized ? 0 : win.y
  const w = maximized ? desktopW : win.w
  const h = maximized ? desktopH - taskbarH : win.h

  if (minimized) return null

  return (
    <XPWindowChrome
      id={id}
      win={win}
      x={x} y={y} w={w} h={h}
      maximized={maximized}
      screenToVirtual={screenToVirtual}
      wm={wm}
    >
      {children}
    </XPWindowChrome>
  )
}

/* ── Inner chrome (hooks must be at top level) ── */

interface XPWindowChromeProps {
  id: string
  win: XPWindowState
  x: number; y: number; w: number; h: number
  maximized: boolean
  screenToVirtual: (dx: number, dy: number) => { dx: number; dy: number }
  wm: WindowManager
  children: ReactNode
}

function XPWindowChrome({ id, win, x, y, w, h, maximized, screenToVirtual, wm, children }: XPWindowChromeProps) {
  const onTitlePointerDown = useWindowDrag({
    windowId: id,
    winX: win.x, winY: win.y, winW: win.w, winH: win.h,
    maximized, isFixedSize: win.isFixedSize,
    focus: wm.focusWindow, move: wm.moveWindow,
    screenToVirtual,
  })

  const onResizePointerDown = useWindowResize({
    windowId: id,
    winX: win.x, winY: win.y, winW: win.w, winH: win.h,
    minW: win.minW, minH: win.minH,
    focus: wm.focusWindow, move: wm.moveWindow, resize: wm.resizeWindow,
    screenToVirtual, setOverrideCursor: wm.setOverrideCursor,
  })

  const HANDLE = 6
  const handleStyle = (cursor: string, pos: CSSProperties): CSSProperties => ({
    position: 'absolute', ...pos, cursor, zIndex: 10,
  })

  return (
    <div
      onMouseDown={() => wm.focusWindow(id)}
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h,
        zIndex: win.zIndex, display: 'flex', flexDirection: 'column',
        border: '2px solid #0054E3',
        borderRadius: maximized ? 0 : '4px 4px 0 0',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.35)',
        overflow: 'hidden', background: '#ECE9D8',
      }}
    >
      <TitleBar
        win={win} maximized={maximized}
        onPointerDown={onTitlePointerDown}
        onDoubleClick={() => !win.isFixedSize && wm.toggleMaximize(id)}
        onMinimize={() => wm.minimizeWindow(id)}
        onToggleMaximize={() => wm.toggleMaximize(id)}
        onClose={() => wm.closeWindow(id)}
      />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
      {!maximized && !win.isFixedSize && (
        <ResizeHandles
          handle={HANDLE}
          handleStyle={handleStyle}
          onResizePointerDown={onResizePointerDown}
          setOverrideCursor={wm.setOverrideCursor}
        />
      )}
    </div>
  )
}

/* ── Title bar ── */

interface TitleBarProps {
  win: XPWindowState
  maximized: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onDoubleClick: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
}

function TitleBar({ win, maximized, onPointerDown, onDoubleClick, onMinimize, onToggleMaximize, onClose }: TitleBarProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{
        background: 'linear-gradient(180deg, #0A246A 0%, #3A6EA5 8%, #3A6EA5 92%, #0A246A 100%)',
        height: 30, minHeight: 30,
        display: 'flex', alignItems: 'center', padding: '0 4px', gap: 4,
        cursor: maximized ? 'default' : 'move', userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 16, marginRight: 3 }}>{win.icon}</span>
      <span style={{
        flex: 1, color: '#fff', fontSize: 14, fontWeight: 'bold',
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
      }}>
        {win.title}
      </span>
      <TitleBtn label="🗕" bg="linear-gradient(180deg, #3C8FD8, #2070B0)" onClick={onMinimize} />
      {!win.isFixedSize && (
        <TitleBtn label={maximized ? '🗗' : '🗖'} bg="linear-gradient(180deg, #3C8FD8, #2070B0)" onClick={onToggleMaximize} />
      )}
      <TitleBtn label="✕" bg="linear-gradient(180deg, #E06050, #C03020)" onClick={onClose} />
    </div>
  )
}

/* ── Title-bar button ── */

function TitleBtn({ label, bg, onClick }: { label: string; bg: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        width: 24, height: 22,
        border: '1px solid rgba(0,0,0,0.3)', borderRadius: 3,
        background: hover ? 'linear-gradient(180deg, #FFD080, #FFB030)' : bg,
        color: '#fff', fontSize: 12, lineHeight: '20px', textAlign: 'center',
        padding: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {label}
    </button>
  )
}

/* ── Resize handles ── */

function ResizeHandles({
  handle,
  handleStyle,
  onResizePointerDown,
  setOverrideCursor,
}: {
  handle: number
  handleStyle: (cursor: string, pos: CSSProperties) => CSSProperties
  onResizePointerDown: (edge: string) => (e: React.PointerEvent) => void
  setOverrideCursor: (cursor: 'default' | 'nwse' | 'nesw' | 'ns' | 'ew') => void
}) {
  const mkProps = (edge: string, cursor: 'nwse' | 'nesw' | 'ns' | 'ew') => ({
    onPointerDown: onResizePointerDown(edge),
    onMouseEnter: () => setOverrideCursor(cursor),
    onMouseLeave: () => setOverrideCursor('default'),
  })

  return (
    <>
      <div {...mkProps('n', 'ns')} style={handleStyle('ns-resize', { top: 0, left: handle, right: handle, height: handle })} />
      <div {...mkProps('s', 'ns')} style={handleStyle('ns-resize', { bottom: 0, left: handle, right: handle, height: handle })} />
      <div {...mkProps('w', 'ew')} style={handleStyle('ew-resize', { left: 0, top: handle, bottom: handle, width: handle })} />
      <div {...mkProps('e', 'ew')} style={handleStyle('ew-resize', { right: 0, top: handle, bottom: handle, width: handle })} />
      <div {...mkProps('nw', 'nwse')} style={handleStyle('nwse-resize', { top: 0, left: 0, width: handle, height: handle })} />
      <div {...mkProps('ne', 'nesw')} style={handleStyle('nesw-resize', { top: 0, right: 0, width: handle, height: handle })} />
      <div {...mkProps('sw', 'nesw')} style={handleStyle('nesw-resize', { bottom: 0, left: 0, width: handle, height: handle })} />
      <div {...mkProps('se', 'nwse')} style={handleStyle('nwse-resize', { bottom: 0, right: 0, width: handle, height: handle })} />
    </>
  )
}
