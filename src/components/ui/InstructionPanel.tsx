'use client'

import { KeybindHint } from './KeybindHint'
import { motion } from 'motion/react'

/**
 * Instruction panel shown at the top-left of the screen
 * explaining the controls to the user.
 */
export function InstructionPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="absolute top-6 left-6 pointer-events-none z-40 bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      <h1 className="text-xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-sm">
        Portfolio Interactif 3D - SERRET Arthur
      </h1>
      <div className="flex flex-col gap-3.5">
        <KeybindHint keys="MouseLeft" label="Verrouiller la souris" size={24} />
        <KeybindHint keys={['Z', 'Q', 'S', 'D']} layout="cluster" label="Se déplacer" size={22} className="py-1" />
        <KeybindHint keys="MouseMove" label="Regarder" size={24} />
        <KeybindHint keys="Space" label="Sauter" size={26} className="mt-1" />
        <KeybindHint keys="E" label="Interagir" size={24} />
      </div>
    </motion.div>
  )
}
