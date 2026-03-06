'use client'

import { useState } from 'react'

interface MenuItemProps {
  icon: string
  label: string
  onClick: () => void
}

/** A single row inside the XP Start menu. */
export function MenuItem({ icon, label, onClick }: MenuItemProps) {
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
