'use client'

import { type XPWindowState } from './WindowManager'

interface TaskbarButtonProps {
  win: XPWindowState
  onClick: () => void
  isFocused: boolean
  taskbarH: number
}

/** A single window button inside the XP taskbar. */
export function TaskbarButton({ win, onClick, isFocused, taskbarH }: TaskbarButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '2px 8px',
        height: taskbarH - 8,
        background: isFocused
          ? 'linear-gradient(180deg, #fff, #D6DFF7)'
          : 'linear-gradient(180deg, #3C7DD4, #2A5FA3)',
        border: isFocused ? '1px solid #0054E3' : '1px solid #1A4BB5',
        borderRadius: 2,
        color: isFocused ? '#000' : '#fff',
        fontSize: 13,
        cursor: 'pointer',
        flex: '0 1 160px',
        minWidth: 40,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      <span style={{ fontSize: 14 }}>{win.icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</span>
    </button>
  )
}
