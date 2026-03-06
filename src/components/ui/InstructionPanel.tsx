'use client'

/**
 * Instruction panel shown at the top-left of the screen
 * explaining the controls to the user.
 */
export function InstructionPanel() {
  return (
    <div className="absolute top-4 left-4 text-white font-mono bg-black/50 p-4 rounded-lg pointer-events-none">
      <h1 className="text-xl font-bold mb-2">Infuseting Portfolio</h1>
      <ul className="text-sm space-y-1">
        <li>Click to lock pointer</li>
        <li>ZQSD / WASD to move</li>
        <li>Mouse to look</li>
        <li>Space to jump</li>
        <li>E to interact</li>
        <li>Escape to exit computer</li>
      </ul>
    </div>
  )
}
