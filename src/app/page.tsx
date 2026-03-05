'use client'

import Scene from '@/components/Scene'
import { InteractionProvider } from '@/components/InteractionStore'
import { ComputerFocusProvider } from '@/components/ComputerFocusStore'
import { InteractionHUD } from '@/components/InteractionHUD'
import { InstructionPanel } from '@/components/InstructionPanel'
import { Crosshair } from '@/components/Crosshair'
import { AchievementToast } from '@/components/xp/AchievementToast'
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { useMemo } from 'react'

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  interact = 'interact',
}

export default function Home() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(() => [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW', 'KeyZ'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA', 'KeyQ'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
    { name: Controls.interact, keys: ['KeyE'] },
  ], [])

  return (
    <KeyboardControls map={map}>
      <InteractionProvider>
        <ComputerFocusProvider>
          <main className="w-full h-screen bg-black overflow-hidden relative" style={{ isolation: 'isolate' }}>
            <Scene />


            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
              <InstructionPanel />
              <Crosshair />
              <InteractionHUD />
              <AchievementToast />
            </div>
          </main>
        </ComputerFocusProvider>
      </InteractionProvider>
    </KeyboardControls>
  )
}
