'use client'

import { useComputerFocus } from './ComputerFocusStore'

/**
 * Crosshair dot displayed at the centre of the viewport.
 * Uses `mix-blend-difference` so it stays visible on any background.
 * Hidden when the player is focused on the computer.
 */
export function Crosshair() {
  const { focused } = useComputerFocus()

  if (focused) return null

  return (
    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white border border-black rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
  )
}
