'use client'

import Image from 'next/image'

export type KeyName =
  | 'Z' | 'Q' | 'S' | 'D'
  | 'W' | 'A'
  | 'E'
  | 'Space'
  | 'Escape'
  | 'MouseLeft'
  | 'MouseRight'
  | 'MouseMove'
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'

const keyMap: Record<KeyName, string> = {
  Z: '/inputs/Keyboard & Mouse/Default/keyboard_z.png',
  Q: '/inputs/Keyboard & Mouse/Default/keyboard_q.png',
  S: '/inputs/Keyboard & Mouse/Default/keyboard_s.png',
  D: '/inputs/Keyboard & Mouse/Default/keyboard_d.png',
  W: '/inputs/Keyboard & Mouse/Default/keyboard_w.png',
  A: '/inputs/Keyboard & Mouse/Default/keyboard_a.png',
  E: '/inputs/Keyboard & Mouse/Default/keyboard_e.png',
  Space: '/inputs/Keyboard & Mouse/Default/keyboard_space_icon.png',
  Escape: '/inputs/Keyboard & Mouse/Default/keyboard_escape.png',
  MouseLeft: '/inputs/Keyboard & Mouse/Default/mouse_left.png',
  MouseRight: '/inputs/Keyboard & Mouse/Default/mouse_right.png',
  MouseMove: '/inputs/Keyboard & Mouse/Default/mouse_move.png',
  ArrowUp: '/inputs/Keyboard & Mouse/Default/keyboard_arrow_up.png',
  ArrowDown: '/inputs/Keyboard & Mouse/Default/keyboard_arrow_down.png',
  ArrowLeft: '/inputs/Keyboard & Mouse/Default/keyboard_arrow_left.png',
  ArrowRight: '/inputs/Keyboard & Mouse/Default/keyboard_arrow_right.png',
}

interface KeyIconProps {
  keyName: KeyName
  size?: number
  className?: string
}

/**
 * Renders a specific key icon using the assets from public/inputs
 */
export function KeyIcon({ keyName, size = 32, className = '' }: KeyIconProps) {
  const src = keyMap[keyName]
  
  if (!src) return null

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 drop-shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      {/* We use standard img to avoid next/image strict path requirements or unoptimized static issues for generic assets, 
          though next/image could work if configured. Regular img is safe for local public assets. */}
      <img 
        src={src} 
        alt={`Touche ${keyName}`}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }} // Optional: gives a nice crisp look if they are pixel art
      />
    </div>
  )
}
