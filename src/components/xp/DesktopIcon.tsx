'use client'

import { useState } from 'react'

interface DesktopIconProps {
  icon: string
  label: string
  onDoubleClick: () => void
}

/** A single clickable icon on the XP desktop. */
export function DesktopIcon({ icon, label, onDoubleClick }: DesktopIconProps) {
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
