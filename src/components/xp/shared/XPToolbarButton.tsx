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
  // Compute border display/colors to avoid mixing shorthand and non-shorthand props
  const showBorder = hover && !disabled
  const activeBorder = { top: '#ACA899', right: '#FFF', bottom: '#FFF', left: '#ACA899' }
  const inactiveBorder = { top: '#FFF', right: '#ACA899', bottom: '#ACA899', left: '#FFF' }
  const chosenBorder = active ? activeBorder : inactiveBorder
  const borderTopColor = showBorder ? chosenBorder.top : 'transparent'
  const borderRightColor = showBorder ? chosenBorder.right : 'transparent'
  const borderBottomColor = showBorder ? chosenBorder.bottom : 'transparent'
  const borderLeftColor = showBorder ? chosenBorder.left : 'transparent'

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
        borderWidth: '1px',
        borderStyle: 'solid',
        borderTopColor,
        borderRightColor,
        borderBottomColor,
        borderLeftColor,
        backgroundColor: showBorder ? '#ECE9D8' : 'transparent',
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
