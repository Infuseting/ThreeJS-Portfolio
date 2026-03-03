'use client'

import Scene from '@/components/Scene'
import { InteractionProvider } from '@/components/InteractionStore'
import { ComputerFocusProvider } from '@/components/ComputerFocusStore'
import { InteractionHUD } from '@/components/InteractionHUD'
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
            {/* 3D Scene — z-index 0, behind all HTML overlays */}
            <Scene />

            {/* ── HTML overlays — always on top, above drei Html (zIndex 2) ── */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>

              {/* Instruction panel */}
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

              {/* Crosshair */}
              <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white border border-black rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />

              {/* Interaction / focus HUD */}
              <InteractionHUD />

            </div>
          </main>
        </ComputerFocusProvider>
      </InteractionProvider>
    </KeyboardControls>
  )
}
