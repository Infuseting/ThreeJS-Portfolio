'use client'

import { useInteractionTarget } from '@/components/InteractionStore'
import { useComputerFocus } from '@/components/ComputerFocusStore'

/**
 * HTML overlay displayed at the centre of the screen when the player
 * looks at an interactive object. Shows the key to press and a label.
 * When focused on a computer, shows an "Escape" hint instead.
 */
export function InteractionHUD() {
  const target = useInteractionTarget()
  const { focused } = useComputerFocus()

  if (focused) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2 select-none">
        <span className="inline-flex items-center justify-center px-2 h-7 rounded-md bg-white/90 text-black text-xs font-bold shadow-md border border-gray-300">
          Échap
        </span>
        <span className="text-white text-sm font-medium drop-shadow-lg">
          pour quitter
        </span>
      </div>
    )
  }

  if (!target) return null

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 z-50 pointer-events-none flex items-center gap-2 select-none">
      {/* Key badge */}
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/90 text-black text-sm font-bold shadow-md border border-gray-300">
        {target.key}
      </span>
      {/* Label */}
      <span className="text-white text-sm font-medium drop-shadow-lg">
        {target.label}
      </span>
    </div>
  )
}
