'use client'

import { useInteractionTarget } from '@/components/stores/InteractionStore'
import { useComputerFocus } from '@/components/stores/ComputerFocusStore'
import { KeyIcon, KeyName } from '@/components/ui/KeyIcon'
import { motion, AnimatePresence } from 'motion/react'

/**
 * HTML overlay displayed at the centre of the screen when the player
 * looks at an interactive object. Shows the key to press and a label.
 * When focused on a computer, shows an "Escape" hint instead.
 */
export function InteractionHUD() {
  const target = useInteractionTarget()
  const { focused } = useComputerFocus()

  return (
    <AnimatePresence>
      {focused && (
        <motion.div 
          key="focused-hud"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-3 select-none bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl"
        >
          <KeyIcon keyName="Escape" size={28} />
          <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
            pour quitter
          </span>
        </motion.div>
      )}

      {target && !focused && (
        <motion.div 
          key="target-hud"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 24 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-3 select-none bg-black/40 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-2xl shadow-xl"
        >
          <KeyIcon keyName={target.key as KeyName} size={28} />
          <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md pr-1">
            {target.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
