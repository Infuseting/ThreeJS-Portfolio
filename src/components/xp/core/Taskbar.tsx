'use client'

import { useEffect, useRef } from 'react'
import { useWM, useWMState } from './WindowManager'
import { TaskbarButton } from './TaskbarButton'
import { unlockAchievement } from '@/components/stores/AchievementStore'

interface TaskbarProps {
  taskbarH: number
  startOpen: boolean
  onToggleStart: () => void
  onOpenVolumeMixer: () => void
  onOpenDateTime: () => void
  clock: string
}

/** The XP-style taskbar at the bottom of the desktop. */
export function Taskbar({ taskbarH, startOpen, onToggleStart, onOpenVolumeMixer, onOpenDateTime, clock }: TaskbarProps) {
  const wm = useWM()
  const wmState = useWMState()

  // Start/Stop achievement tracker
  const toggleCounter = useRef(0)
  const toggleTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    toggleCounter.current += 1
    if (toggleCounter.current >= 20) {
      unlockAchievement('start-stop')
      toggleCounter.current = 0
    }
    if (toggleTimeout.current) clearTimeout(toggleTimeout.current)
    toggleTimeout.current = setTimeout(() => {
      toggleCounter.current = 0
    }, 2000)
  }, [startOpen])

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: taskbarH,
        background: 'linear-gradient(180deg, #245EDC 0%, #1A4BB5 40%, #1842A0 100%)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 9998,
      }}
    >
      {/* Start button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStart() }}
        style={{
          background: startOpen
            ? 'linear-gradient(180deg, #2D8F2D, #1E6B1E)'
            : 'linear-gradient(180deg, #3C9D3C, #2D8F2D)',
          color: '#fff', border: 'none',
          borderRadius: '0 8px 8px 0',
          padding: '2px 14px 2px 8px',
          height: taskbarH - 6,
          fontWeight: 'bold', fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 4,
          cursor: 'pointer', letterSpacing: 0.3,
        }}
      >
        <span style={{ fontSize: 16 }}>🪟</span> démarrer
      </button>

      {/* Window buttons */}
      <div
        className="xp-taskbar-scroll"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', padding: '0 6px', gap: 3,
          overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', scrollbarWidth: 'none'
        }}
      >
        {wmState.windows.map((win) => (
          <TaskbarButton
            key={win.id}
            win={win}
            taskbarH={taskbarH}
            onClick={() => {
              if (win.minimized) {
                wm.focusWindow(win.id)
              } else if (wmState.focusedId === win.id) {
                wm.minimizeWindow(win.id)
              } else {
                wm.focusWindow(win.id)
              }
            }}
            isFocused={wmState.focusedId === win.id && !win.minimized}
          />
        ))}
      </div>

      {/* System tray */}
      <div style={{
        background: 'linear-gradient(180deg, #0F8BEE, #0066CC)',
        height: '100%', display: 'flex', alignItems: 'center',
        padding: '0 10px', gap: 6, fontSize: 13, color: '#fff',
        borderLeft: '1px solid #0053AA',
      }}>
        <span onClick={(e) => { e.stopPropagation(); onOpenVolumeMixer() }} style={{ cursor: 'pointer' }}>🔊</span>
        <span onClick={(e) => { e.stopPropagation(); onOpenDateTime() }} style={{ cursor: 'pointer' }}>{clock}</span>
      </div>
    </div>
  )
}
