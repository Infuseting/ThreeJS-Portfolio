'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import { WMProvider, useWM, useWMState, type AppType, type XPWindowState } from './xp/WindowManager'
import { XPWindow } from './xp/XPWindow'
import { FileExplorer } from './xp/FileExplorer'
import { InternetExplorer } from './xp/InternetExplorer'

/* ═══════════════════════════════════════════════
 *  WindowsXP Desktop
 *
 *  Renders inside drei's <Html> on the 3D monitor.
 *  Features:
 *    • Bliss wallpaper (CSS gradient)
 *    • Desktop icons that open apps
 *    • Taskbar with start menu + window buttons + clock
 *    • Full window manager (open/close/min/max/resize/move)
 *    • Custom virtual cursor (pointer-lock driven)
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

  // ── Clock ──
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 10_000)
    return () => clearInterval(id)
  }, [])

  // ── Hide native cursor globally when active ──
  useEffect(() => {
    if (!active) return
    const style = document.createElement('style')
    style.textContent = '* { cursor: none !important; }'
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [active])

  // ── Track real mouse → virtual XP cursor ──
  // The container is inside drei <Html> which is CSS-transformed.
  // We listen on document for mousemove and convert to local coords.
  useEffect(() => {
    if (!active) return

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // Map real page position → virtual XP coords
      const vx = ((e.clientX - rect.left) / rect.width) * width
      const vy = ((e.clientY - rect.top) / rect.height) * height
      setCursorPos({
        x: Math.max(0, Math.min(width - 1, vx)),
        y: Math.max(0, Math.min(height - 1, vy)),
      })
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [active, width, height])

  // ── Open apps ──
  const openFileExplorer = useCallback(() => {
    wm.openWindow('file-explorer', { title: 'Poste de travail', icon: '📁', w: 700, h: 500 })
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
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, position: 'absolute', top: 0, left: 0 }}>
        <DesktopIcon label="Poste de travail" icon="💻" onDoubleClick={openFileExplorer} />
        <DesktopIcon label="Internet Explorer" icon="🌐" onDoubleClick={() => openIE()} />
        <DesktopIcon label="Mes documents" icon="📁" onDoubleClick={openFileExplorer} />
        <DesktopIcon label="Corbeille" icon="🗑️" onDoubleClick={() => {}} />
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
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: TASKBAR_H,
            left: 0,
            width: 320,
            background: 'linear-gradient(180deg, #1F5DBF 0%, #3078D9 2%, #fff 2%, #fff 100%)',
            border: '2px solid #0054E3',
            borderRadius: '8px 8px 0 0',
            boxShadow: '2px 2px 10px rgba(0,0,0,0.4)',
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(180deg, #1F5DBF, #3078D9)',
            color: '#fff', padding: '8px 12px', fontWeight: 'bold', fontSize: 15,
            borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 22 }}>👤</span> Infuseting
          </div>
          <div style={{ padding: '6px 0' }}>
            <MenuItem icon="🌐" label="Internet Explorer" onClick={() => openIE()} />
            <MenuItem icon="📁" label="Poste de travail" onClick={openFileExplorer} />
            <div style={{ borderTop: '1px solid #ccc', margin: '4px 12px' }} />
            <MenuItem icon="📁" label="Mes documents" onClick={openFileExplorer} />
          </div>
          <div style={{
            borderTop: '2px solid #0054E3', padding: '6px 12px',
            display: 'flex', justifyContent: 'flex-end', background: '#D6DFF7',
          }}>
            <button
              onClick={() => setStartOpen(false)}
              style={{
                background: 'linear-gradient(180deg, #FE8A3A, #E34F0C)',
                color: '#fff', border: '1px solid #933509', borderRadius: 3,
                padding: '3px 16px', fontSize: 12, fontWeight: 'bold', cursor: 'pointer',
              }}
            >
              Arrêter...
            </button>
          </div>
        </div>
      )}

      {/* ─── Taskbar ─── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: TASKBAR_H,
          background: 'linear-gradient(180deg, #245EDC 0%, #1A4BB5 40%, #1842A0 100%)',
          display: 'flex',
          alignItems: 'center',
          zIndex: 9998,
        }}
      >
        {/* Start button */}
        <button
          onClick={(e) => { e.stopPropagation(); setStartOpen((p) => !p) }}
          style={{
            background: startOpen
              ? 'linear-gradient(180deg, #2D8F2D, #1E6B1E)'
              : 'linear-gradient(180deg, #3C9D3C, #2D8F2D)',
            color: '#fff', border: 'none',
            borderRadius: '0 8px 8px 0',
            padding: '2px 14px 2px 8px',
            height: TASKBAR_H - 6,
            fontWeight: 'bold', fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 4,
            cursor: 'pointer', letterSpacing: 0.3,
          }}
        >
          <span style={{ fontSize: 16 }}>🪟</span> démarrer
        </button>

        {/* ── Window buttons ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 6px', gap: 3, overflow: 'hidden' }}>
          {wmState.windows.map((win) => (
            <TaskbarButton key={win.id} win={win} onClick={() => {
              if (win.minimized) {
                wm.focusWindow(win.id)
              } else if (wmState.focusedId === win.id) {
                wm.minimizeWindow(win.id)
              } else {
                wm.focusWindow(win.id)
              }
            }} isFocused={wmState.focusedId === win.id && !win.minimized} />
          ))}
        </div>

        {/* System tray */}
        <div style={{
          background: 'linear-gradient(180deg, #0F8BEE, #0066CC)',
          height: '100%', display: 'flex', alignItems: 'center',
          padding: '0 10px', gap: 6, fontSize: 13, color: '#fff',
          borderLeft: '1px solid #0053AA',
        }}>
          <span>🔊</span>
          <span>{clock}</span>
        </div>
      </div>

      {/* ─── Custom cursor ─── */}
      <div
        style={{
          position: 'absolute',
          left: cursorPos.x, top: cursorPos.y,
          width: 0, height: 0,
          pointerEvents: 'none', zIndex: 10000,
          transform: 'translate(-1px, -1px)',
        }}
      >
        <svg width="20" height="28" viewBox="0 0 16 22" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
          <path d="M0 0 L0 18 L4 14 L7 21 L10 20 L7 13 L13 13 Z" fill="#fff" stroke="#000" strokeWidth="1" />
        </svg>
      </div>
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
    default:
      return <div style={{ padding: 12, color: '#666' }}>Application inconnue</div>
  }
}

/* ── Desktop icon ── */

function DesktopIcon({ icon, label, onDoubleClick }: { icon: string; label: string; onDoubleClick: () => void }) {
  const [selected, setSelected] = useState(false)
  return (
    <div
      onClick={() => setSelected(true)}
      onDoubleClick={onDoubleClick}
      onBlur={() => setSelected(false)}
      tabIndex={0}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 80, gap: 2, cursor: 'pointer', outline: 'none',
        padding: 4, borderRadius: 3,
        background: selected ? 'rgba(49, 106, 197, 0.4)' : 'transparent',
      }}
    >
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={{
        color: '#fff', fontSize: 12, textAlign: 'center',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)', lineHeight: 1.2,
        wordBreak: 'break-word',
      }}>
        {label}
      </span>
    </div>
  )
}

/* ── Start menu item ── */

function MenuItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8,
        background: hover ? '#2F71CD' : 'transparent',
        color: hover ? '#fff' : '#000',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  )
}

/* ── Taskbar button ── */

function TaskbarButton({ win, onClick, isFocused }: { win: XPWindowState; onClick: () => void; isFocused: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '2px 8px',
        height: TASKBAR_H - 8,
        background: isFocused
          ? 'linear-gradient(180deg, #fff, #D6DFF7)'
          : 'linear-gradient(180deg, #3C7DD4, #2A5FA3)',
        border: isFocused ? '1px solid #0054E3' : '1px solid #1A4BB5',
        borderRadius: 2,
        color: isFocused ? '#000' : '#fff',
        fontSize: 13,
        cursor: 'pointer',
        maxWidth: 160,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 14 }}>{win.icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</span>
    </button>
  )
}

const TASKBAR_H_VAR = TASKBAR_H // re-export for module-scoped usage
