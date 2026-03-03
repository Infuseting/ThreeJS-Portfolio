'use client'

interface XPCursorProps {
  x: number
  y: number
}

/** Custom XP-style pointer cursor rendered as an SVG overlay. */
export function XPCursor({ x, y }: XPCursorProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x, top: y,
        width: 0, height: 0,
        pointerEvents: 'none', zIndex: 10000,
        transform: 'translate(-1px, -1px)',
      }}
    >
      <svg width="20" height="28" viewBox="0 0 16 22" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
        <path d="M0 0 L0 18 L4 14 L7 21 L10 20 L7 13 L13 13 Z" fill="#fff" stroke="#000" strokeWidth="1" />
      </svg>
    </div>
  )
}
