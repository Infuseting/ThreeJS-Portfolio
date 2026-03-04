'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import { WMProvider, useWM, useWMState, type XPWindowState } from './xp/WindowManager'
import { XPWindow } from './xp/XPWindow'
import { FileExplorer } from './xp/FileExplorer'
import { InternetExplorer } from './xp/InternetExplorer'
import { VSCodeApp } from './xp/VSCodeApp'
import { MinesweeperApp } from './xp/MinesweeperApp'
import { NotepadApp } from './xp/NotepadApp'
import { CmdApp } from './xp/CmdApp'
import { MediaPlayerApp } from './xp/MediaPlayerApp'
import { DesktopIcon } from './xp/DesktopIcon'
import { StartMenu } from './xp/StartMenu'
import { Taskbar } from './xp/Taskbar'
import { XPCursor } from './xp/XPCursor'

/* ═══════════════════════════════════════════════
 *  WindowsXP Desktop
 *
 *  Renders inside drei's <Html> on the 3D monitor.
 * ═══════════════════════════════════════════════ */

interface WindowsXPDesktopProps {
  width?: number
  height?: number
  active?: boolean
}

export function WindowsXPDesktop({
  width = 800,
  height = 600,
  active = false,
}: WindowsXPDesktopProps) {
  return (
    <WMProvider desktopW={width} desktopH={height}>
      <DesktopInner width={width} height={height} active={active} />
    </WMProvider>
  )
}

/* ── The actual desktop, inside the WMProvider ── */

const TASKBAR_H = 40

function DesktopInner({ width, height, active }: { width: number; height: number; active: boolean }) {
  const wm = useWM()
  const wmState = useWMState()
  const [cursorPos, setCursorPos] = useState({ x: width / 2, y: height / 2 })
  const [startOpen, setStartOpen] = useState(false)
  const [clock, setClock] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useClock(setClock)
  useHideNativeCursor(active)
  useVirtualCursorTracking(active, containerRef, width, height, setCursorPos)

  /* ── Open app helpers ── */
  const openFileExplorer = useCallback(() => {
    wm.openWindow('file-explorer', { title: 'Poste de travail', icon: '📁', w: 700, h: 500 })
    setStartOpen(false)
  }, [wm])

  const openMinesweeper = useCallback(() => {
    wm.openWindow('minesweeper', { title: 'Démineur', icon: '💣', w: 200, h: 300 })
    setStartOpen(false)
  }, [wm])

  const openSlitherio = useCallback(() => {
    wm.openWindow('slitherio', { title: 'Slither.io', icon: '🐍', w: 1000, h: 700 })
    setStartOpen(false)
  }, [wm])

  const openNotepad = useCallback(() => {
    wm.openWindow('notepad', { title: 'Bloc-notes', icon: '📝', w: 600, h: 400 })
    setStartOpen(false)
  }, [wm])

  const openCmd = useCallback(() => {
    wm.openWindow('cmd', { title: 'Invite de commandes', icon: '📟', w: 600, h: 400 })
    setStartOpen(false)
  }, [wm])

  const openMediaPlayer = useCallback(() => {
    wm.openWindow('mediaplayer', { title: 'Lecteur Windows Media', icon: '🎵', w: 320, h: 240 })
    setStartOpen(false)
  }, [wm])

  const openPaint = useCallback(() => {
    wm.openWindow('paint', { title: 'Paint', icon: '🎨', w: 800, h: 600 })
    setStartOpen(false)
  }, [wm])

  const openPinball = useCallback(() => {
    wm.openWindow('pinball', { title: '3D Pinball - Space Cadet', icon: '🪐', w: 600, h: 446, isFixedSize: true })
    setStartOpen(false)
  }, [wm])

  const openIE = useCallback((url?: string) => {
    wm.openWindow('internet-explorer', {
      title: 'Internet Explorer',
      icon: '🌐',
      w: 900,
      h: 650,
      payload: url ? { url } : undefined,
    })
    setStartOpen(false)
  }, [wm])

  const openVSCode = useCallback(() => {
    wm.openWindow('vscode', { title: 'VS Code', icon: '💻', w: 950, h: 700 })
    setStartOpen(false)
  }, [wm])

  return (
    <div
      ref={containerRef}
      onClick={() => setStartOpen(false)}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        cursor: active ? 'none' : 'default',
        userSelect: 'none',
        background: 'linear-gradient(180deg, #245EDC 0%, #3A8FE8 30%, #5DBF4C 55%, #4CA33B 100%)',
        fontFamily: '"Tahoma", "Segoe UI", sans-serif',
        fontSize: 14,
        color: '#000',
      }}
    >
      {/* ─── Desktop icons ─── */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignContent: 'flex-start', gap: 10, position: 'absolute', top: 0, left: 0, bottom: TASKBAR_H }}>
        <DesktopIcon label="Poste de travail" icon="💻" onDoubleClick={openFileExplorer} />
        <DesktopIcon label="Internet Explorer" icon="🌐" onDoubleClick={() => openIE()} />
        <DesktopIcon label="VS Code" icon="📝" onDoubleClick={openVSCode} />
        <DesktopIcon label="Démineur" icon="💣" onDoubleClick={openMinesweeper} />
        <DesktopIcon label="Slither.io" icon="🐍" onDoubleClick={openSlitherio} />
        <DesktopIcon label="Bloc-notes" icon="📝" onDoubleClick={openNotepad} />
        <DesktopIcon label="Invite de cmd" icon="📟" onDoubleClick={openCmd} />
        <DesktopIcon label="Lofi Radio" icon="🎵" onDoubleClick={openMediaPlayer} />
        <DesktopIcon label="Paint" icon="🎨" onDoubleClick={openPaint} />
        <DesktopIcon label="Pinball" icon="🪐" onDoubleClick={openPinball} />
        <DesktopIcon label="Mes documents" icon="📁" onDoubleClick={openFileExplorer} />
        <DesktopIcon label="Corbeille" icon="🗑️" onDoubleClick={() => { }} />
      </div>

      {/* ─── Windows ─── */}
      {wmState.windows.map((win) => (
        <XPWindow
          key={win.id}
          id={win.id}
          desktopW={width}
          desktopH={height}
          taskbarH={TASKBAR_H}
          containerRef={containerRef}
        >
          <AppContent win={win} />
        </XPWindow>
      ))}

      {/* ─── Start menu ─── */}
      {startOpen && (
        <StartMenu
          taskbarH={TASKBAR_H}
          onOpenIE={() => openIE()}
          onOpenVSCode={openVSCode}
          onOpenMinesweeper={openMinesweeper}
          onOpenSlitherio={openSlitherio}
          onOpenNotepad={openNotepad}
          onOpenCmd={openCmd}
          onOpenMediaPlayer={openMediaPlayer}
          onOpenPaint={openPaint}
          onOpenPinball={openPinball}
          onOpenFileExplorer={openFileExplorer}
          onClose={() => setStartOpen(false)}
        />
      )}

      {/* ─── Taskbar ─── */}
      <Taskbar
        taskbarH={TASKBAR_H}
        startOpen={startOpen}
        onToggleStart={() => setStartOpen((p) => !p)}
        clock={clock}
      />

      {/* ─── Custom cursor ─── */}
      <XPCursor x={cursorPos.x} y={cursorPos.y} />
    </div>
  )
}

/* ── App content router ── */

function AppContent({ win }: { win: XPWindowState }) {
  switch (win.appType) {
    case 'file-explorer':
      return <FileExplorer windowId={win.id} initialPath={(win.payload?.path as string) ?? ''} />
    case 'internet-explorer':
      return <InternetExplorer windowId={win.id} initialUrl={(win.payload?.url as string) ?? undefined} />
    case 'slitherio':
      return <iframe src="https://slither.io" title="Slither.io" style={{ width: '100%', height: '100%', border: 'none' }} />
    case 'paint':
      return <iframe src="https://jspaint.app" title="Paint" style={{ width: '100%', height: '100%', border: 'none' }} />
    case 'pinball':
      return <iframe src="/pinball/index.html" title="Space Cadet Pinball" style={{ width: '100%', height: '100%', border: 'none' }} />
    case 'minesweeper':
      return <MinesweeperApp windowId={win.id} />
    case 'notepad':
      return <NotepadApp windowId={win.id} />
    case 'cmd':
      return <CmdApp windowId={win.id} />
    case 'mediaplayer':
      return <MediaPlayerApp windowId={win.id} />
    case 'vscode':
      return (
        <VSCodeApp
          windowId={win.id}
          repo={(win.payload?.repo as string) ?? undefined}
          filePath={(win.payload?.filePath as string) ?? undefined}
        />
      )
    default:
      return <div style={{ padding: 12, color: '#666' }}>Application inconnue</div>
  }
}

/* ── Extracted hooks (each does one thing) ── */

/** Tick the clock every 10s. */
function useClock(setClock: (v: string) => void) {
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [setClock])
}

/** Hide the native cursor globally when the XP desktop is active. */
function useHideNativeCursor(active: boolean) {
  useEffect(() => {
    if (!active) return
    const style = document.createElement('style')
    style.textContent = '* { cursor: none !important; }'
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [active])
}

/** Track real mouse → virtual XP cursor coordinates. */
function useVirtualCursorTracking(
  active: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
  width: number,
  height: number,
  setCursorPos: (pos: { x: number; y: number }) => void,
) {
  useEffect(() => {
    if (!active) return

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vx = ((e.clientX - rect.left) / rect.width) * width
      const vy = ((e.clientY - rect.top) / rect.height) * height
      setCursorPos({
        x: Math.max(0, Math.min(width - 1, vx)),
        y: Math.max(0, Math.min(height - 1, vy)),
      })
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [active, width, height, containerRef, setCursorPos])
}
