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
import { TetrisApp } from './xp/TetrisApp'
import { NotepadApp } from './xp/NotepadApp'
import { CmdApp } from './xp/CmdApp'
import { MediaPlayerApp } from './xp/MediaPlayerApp'
import { DesktopIcon } from './xp/DesktopIcon'
import { StartMenu } from './xp/StartMenu'
import { Taskbar } from './xp/Taskbar'
import { XPCursor } from './xp/XPCursor'
import { TaskManagerApp } from './xp/TaskManagerApp'
import { OutlookExpressApp } from './xp/OutlookExpressApp'
import { ControlPanelApp } from './xp/ControlPanelApp'
import { GitTrackerApp } from './xp/GitTrackerApp'
import { DateTimePropApp } from './xp/DateTimePropApp'
import { RecycleBinApp } from './xp/RecycleBinApp'
import { VolumeMixerApp } from './xp/VolumeMixerApp'
import { VolumeProvider } from './xp/VolumeContext'
import { AudioIframe } from './xp/AudioIframe'
import { useOpenApp } from '@/hooks/useOpenApp'
import { useComputerPower, useComputerPowerActions } from '@/components/ComputerPowerStore'
import { AchievementsApp } from './xp/AchievementsApp'
import type { AppType } from './xp/WindowManager'

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
  const { status } = useComputerPower()

  if (status === 'OFF') {
    return (
      <div style={{ width, height, backgroundColor: '#000' }} />
    )
  }

  if (status === 'BOOTING') {
    return (
      <div style={{
        width, height, backgroundColor: '#000', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'
      }}>
        {/* Simple XP boot screen mockup */}
        <div style={{ fontSize: 40, fontWeight: 'bold', fontStyle: 'italic', marginBottom: 20 }}>
          <span style={{ color: '#E53935' }}>Microsoft</span> Windows <span style={{ color: '#FB8C00' }}>XP</span>
        </div>
        <div style={{
          width: 150, height: 10, border: '2px solid #555', borderRadius: 4, overflow: 'hidden'
        }}>
          <div style={{
            width: '30%', height: '100%', background: 'linear-gradient(90deg, #1E88E5, #64B5F6, #1E88E5)',
            animation: 'boot-load 1.5s infinite linear'
          }} />
        </div>
        <style>{`
          @keyframes boot-load {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(330%); }
          }
        `}</style>
      </div>
    )
  }

  if (status === 'SHUTTING_DOWN') {
    return (
      <div style={{
        width, height, backgroundColor: '#1A4D9B', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
        fontFamily: '"Tahoma", "Segoe UI", sans-serif', fontSize: 24
      }}>
        Fermeture de Windows en cours...
      </div>
    )
  }

  return (
    <WMProvider desktopW={width} desktopH={height}>
      <VolumeProvider>
        <DesktopInner width={width} height={height} active={active} />
      </VolumeProvider>
    </WMProvider>
  )
}

/* ── The actual desktop, inside the WMProvider ── */

const TASKBAR_H = 40

function DesktopInner({ width, height, active }: { width: number; height: number; active: boolean }) {
  const wm = useWM()
  const wmState = useWMState()
  const overrideCursor = wmState.overrideCursor || 'default'
  const [cursorPos, setCursorPos] = useState({ x: width / 2, y: height / 2 })
  const [startOpen, setStartOpen] = useState(false)
  const [clock, setClock] = useState('')
  const [desktopBg, setDesktopBg] = useState('linear-gradient(180deg, #245EDC 0%, #3A8FE8 30%, #5DBF4C 55%, #4CA33B 100%)')
  const containerRef = useRef<HTMLDivElement>(null)

  useClock(setClock)
  useHideNativeCursor(active)
  useVirtualCursorTracking(active, containerRef, width, height, setCursorPos)

  const closeStart = useCallback(() => setStartOpen(false), [])
  const openApp = useOpenApp(closeStart)
  const { turnOff } = useComputerPowerActions()

  /* ── Specialized openers for apps needing custom overrides ── */
  const openIE = useCallback((url?: string) => {
    openApp('internet-explorer', url ? { payload: { url } } : undefined)
  }, [openApp])

  const openVolumeMixer = useCallback(() => {
    const existing = wmState.windows.find(w => w.appType === 'volume-mixer')
    if (existing) {
      if (wmState.focusedId === existing.id) wm.closeWindow(existing.id)
      else wm.focusWindow(existing.id)
      return
    }

    const mixerW = 400
    const mixerH = 300
    openApp('volume-mixer', {
      w: mixerW, h: mixerH,
      x: width - mixerW - 4,
      y: height - mixerH - TASKBAR_H - 4,
    })
  }, [openApp, width, height, wmState.windows, wmState.focusedId, wm])

  const openDateTime = useCallback(() => {
    const existing = wmState.windows.find(w => w.appType === 'datetime')
    if (existing) {
      if (wmState.focusedId === existing.id) wm.closeWindow(existing.id)
      else wm.focusWindow(existing.id)
      return
    }

    const dtW = 420
    const dtH = 450
    openApp('datetime', {
      w: dtW, h: dtH,
      x: width - dtW - 4,
      y: height - dtH - TASKBAR_H - 4,
    })
  }, [openApp, width, height, wmState.windows, wmState.focusedId, wm])

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
        background: desktopBg,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: '"Tahoma", "Segoe UI", sans-serif',
        fontSize: 14,
        color: '#000',
      }}
    >
      {/* ─── Desktop icons ─── */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignContent: 'flex-start', gap: 10, position: 'absolute', top: 0, left: 0, bottom: TASKBAR_H }}>
        <DesktopIcon label="Poste de travail" icon="💻" onDoubleClick={() => openApp('file-explorer')} />
        <DesktopIcon label="Internet Explorer" icon="🌐" onDoubleClick={() => openIE()} />
        <DesktopIcon label="Outlook Express" icon="📧" onDoubleClick={() => openApp('outlook')} />
        <DesktopIcon label="Mon CV" icon="📄" onDoubleClick={() => openApp('cv')} />
        <DesktopIcon label="VS Code" icon="💻" onDoubleClick={() => openApp('vscode')} />
        <DesktopIcon label="Git Tracker" icon="🐙" onDoubleClick={() => openApp('git-tracker')} />
        <DesktopIcon label="Gestionnaire des tâches" icon="📊" onDoubleClick={() => openApp('taskmgr')} />
        <DesktopIcon label="Démineur" icon="💣" onDoubleClick={() => openApp('minesweeper')} />
        <DesktopIcon label="Tetris" icon="🧱" onDoubleClick={() => openApp('tetris')} />
        <DesktopIcon label="Slither.io" icon="🐍" onDoubleClick={() => openApp('slitherio')} />
        <DesktopIcon label="Bloc-notes" icon="📝" onDoubleClick={() => openApp('notepad')} />
        <DesktopIcon label="Invite de cmd" icon="📟" onDoubleClick={() => openApp('cmd')} />
        <DesktopIcon label="Lofi Radio" icon="🎵" onDoubleClick={() => openApp('mediaplayer')} />
        <DesktopIcon label="Paint" icon="🎨" onDoubleClick={() => openApp('paint')} />
        <DesktopIcon label="Pinball" icon="🪐" onDoubleClick={() => openApp('pinball')} />
        <DesktopIcon label="Mes documents" icon="📁" onDoubleClick={() => openApp('file-explorer')} />
        <DesktopIcon label="Corbeille" icon="🗑️" onDoubleClick={() => openApp('recycle-bin')} />
        <DesktopIcon label="Succès" icon="🏆" onDoubleClick={() => openApp('achievements')} />
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
          <AppContent
            win={win}
            desktopBg={desktopBg}
            onChangeBg={setDesktopBg}
          />
        </XPWindow>
      ))}

      {/* ─── Start menu ─── */}
      {startOpen && (
        <StartMenu
          taskbarH={TASKBAR_H}
          openApp={openApp}
          onClose={() => setStartOpen(false)}
          onShutdown={turnOff}
        />
      )}

      {/* ─── Taskbar ─── */}
      <Taskbar
        taskbarH={TASKBAR_H}
        startOpen={startOpen}
        onToggleStart={() => setStartOpen((p) => !p)}
        onOpenVolumeMixer={openVolumeMixer}
        onOpenDateTime={openDateTime}
        clock={clock}
      />

      {/* ─── Custom cursor ─── */}
      <XPCursor x={cursorPos.x} y={cursorPos.y} type={overrideCursor} />
    </div>
  )
}

/* ── App content router ── */

interface AppContentProps {
  win: XPWindowState
  desktopBg: string
  onChangeBg: (bg: string) => void
}

function AppContent({
  win,
  desktopBg,
  onChangeBg,
}: {
  win: XPWindowState
  desktopBg: string
  onChangeBg: (v: string) => void
}) {
  switch (win.appType) {
    case 'file-explorer':
      return <FileExplorer windowId={win.id} />
    case 'internet-explorer':
      return <InternetExplorer windowId={win.id} initialUrl={win.payload?.url as string} />
    case 'vscode':
      return <VSCodeApp windowId={win.id} repo={win.payload?.repo as string} filePath={win.payload?.repoPath as string} />
    case 'minesweeper':
      return <MinesweeperApp windowId={win.id} />
    case 'tetris':
      return <TetrisApp windowId={win.id} />
    case 'slitherio':
      return <iframe src="https://slither.io" title="Slither.io" style={{ width: '100%', height: '100%', border: 'none' }} />
    case 'notepad':
      return <NotepadApp windowId={win.id} />
    case 'cmd':
      return <CmdApp windowId={win.id} />
    case 'mediaplayer':
      return <MediaPlayerApp windowId={win.id} />
    case 'paint':
      return <iframe src="https://jspaint.app" title="Paint" style={{ width: '100%', height: '100%', border: 'none' }} />
    case 'pinball':
      return <AudioIframe windowId={win.id} appTitle="3D Pinball" appIcon="🪐" src="https://alula.github.io/SpaceCadetPinball/" title="3D Pinball for Windows - Space Cadet" />
    case 'cv':
      return <iframe src="/CV_SERRET_Arthur.pdf" title="Curriculum Vitae" style={{ width: '100%', height: '100%', border: 'none' }} />
    case 'taskmgr':
      return <TaskManagerApp windowId={win.id} />
    case 'outlook':
      return <OutlookExpressApp windowId={win.id} />
    case 'control-panel':
      return <ControlPanelApp windowId={win.id} currentBg={desktopBg} onChangeBg={onChangeBg} />
    case 'git-tracker':
      return <GitTrackerApp windowId={win.id} />
    case 'recycle-bin':
      return <RecycleBinApp windowId={win.id} />
    case 'volume-mixer':
      return <VolumeMixerApp windowId={win.id} />
    case 'datetime':
      return <DateTimePropApp windowId={win.id} />
    case 'achievements':
      return <AchievementsApp windowId={win.id} />
    default:
      return <div style={{ padding: 20 }}>Application inconnue : {win.appType}</div>
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

    const update = (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vx = ((clientX - rect.left) / rect.width) * width
      const vy = ((clientY - rect.top) / rect.height) * height
      setCursorPos({
        x: Math.max(0, Math.min(width - 1, vx)),
        y: Math.max(0, Math.min(height - 1, vy)),
      })
    }

    const onMouseMove = (e: MouseEvent) => update(e.clientX, e.clientY)
    const onPointerMove = (e: PointerEvent) => update(e.clientX, e.clientY)

    // Listen to both mousemove and pointermove so cursor tracks
    // during setPointerCapture (drag/resize) operations
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointermove', onPointerMove)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointermove', onPointerMove)
    }
  }, [active, width, height, containerRef, setCursorPos])
}
