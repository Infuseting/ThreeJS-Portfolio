'use client'

interface XPCursorProps {
  x: number
  y: number
  type?: 'default' | 'nwse' | 'nesw' | 'ns' | 'ew'
}

/** Custom XP-style pointer cursor rendered as an SVG overlay. */
export function XPCursor({ x, y, type = 'default' }: XPCursorProps) {
  let content

  switch (type) {
    case 'nwse':
    case 'nesw':
    case 'ns':
    case 'ew':
      // Basic arrows for resize, rotated with CSS
      const rotates: Record<string, string> = {
        'ns': 'rotate(0deg)',
        'nesw': 'rotate(45deg)',
        'ew': 'rotate(90deg)',
        'nwse': 'rotate(135deg)'
      }
      content = (
        <svg width="22" height="22" viewBox="0 0 22 22" style={{ transform: rotates[type], filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.4))' }}>
          <path d="M11 0 L15 5 L12 5 L12 17 L15 17 L11 22 L7 17 L10 17 L10 5 L7 5 Z" fill="#fff" stroke="#000" strokeWidth="1" />
        </svg>
      )
      break
    case 'default':
    default:
      content = (
        <svg width="20" height="28" viewBox="0 0 16 22" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
          <path d="M0 0 L0 18 L4 14 L7 21 L10 20 L7 13 L13 13 Z" fill="#fff" stroke="#000" strokeWidth="1" />
        </svg>
      )
      break
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x, top: y,
        width: 0, height: 0,
        pointerEvents: 'none', zIndex: 10000,
        // center the resize cursors, keep standard cursor top-left
        transform: type === 'default' ? 'translate(-1px, -1px)' : 'translate(-11px, -11px)',
      }}
    >
      {content}
    </div>
  )
}
