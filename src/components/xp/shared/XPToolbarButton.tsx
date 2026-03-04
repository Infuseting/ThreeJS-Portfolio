'use client'

import { useState } from 'react'

interface XPToolbarButtonProps {
  icon: string
  label: string
  onClick?: () => void
  disabled?: boolean
  /** Vertical layout (icon on top, label below). Default: false (horizontal). */
  vertical?: boolean
}

/**
 * Shared XP-style toolbar button used in Outlook Express, Recycle Bin, etc.
 */
export function XPToolbarButton({ icon, label, onClick, disabled = false, vertical = false }: XPToolbarButtonProps) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        padding: vertical ? '2px 4px' : '2px 6px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: (hover && !disabled) ? '1px solid' : '1px solid transparent',
        borderColor: active ? '#ACA899 #FFF #FFF #ACA899' : '#FFF #ACA899 #ACA899 #FFF',
        backgroundColor: (hover && !disabled) ? '#ECE9D8' : 'transparent',
        gap: vertical ? 0 : undefined,
      }}
    >
      <div style={{
        fontSize: vertical ? 24 : 18,
        marginRight: vertical ? 0 : 4,
        marginBottom: vertical ? 2 : 0,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 11 }}>{label}</div>
    </div>
  )
}
