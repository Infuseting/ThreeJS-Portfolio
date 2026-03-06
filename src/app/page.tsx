'use client'

import Scene from '@/components/3d/scene/Scene'
import { InteractionProvider } from '@/components/stores/InteractionStore'
import { ComputerFocusProvider } from '@/components/stores/ComputerFocusStore'
import { InteractionHUD } from '@/components/interaction/InteractionHUD'
import { InstructionPanel } from '@/components/ui/InstructionPanel'
import { Crosshair } from '@/components/interaction/Crosshair'
import { AchievementToast } from '@/components/xp/contexts/AchievementToast'
import { InfoPanel } from '@/components/ui/InfoPanel'
import { showInfoPanel, hideInfoPanel } from '@/components/stores/InfoPanelStore'
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { useMemo, useEffect } from 'react'

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

  const openBaseWebsite = () => {
    window.open('https://base.infuseting.fr', '_blank')
  }

  // Show welcome panel on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      showInfoPanel({
        columns: [
          {
            sections: [
              { type: 'title', text: 'Bienvenue 👋', gradient: 'linear-gradient(135deg, #fff 0%, #8b9cf7 40%, #6c5ce7 100%)' },
              { type: 'subtitle', text: 'Portfolio interactif - SERRET Arthur' },
              { type: 'text', content: 'Explorez cet environment pour en apprendre plus sur moi.' },
            ]
          },
          {
            sections: [
              { type: 'title', text: 'Technologies', gradient: 'linear-gradient(135deg, #fff 0%, #67e8f9 50%, #06b6d4 100%)' },
              { type: 'text', content: 'Ce portfolio a été construit avec les technologies suivantes :' },
              {
                type: 'chips', items: [
                  { label: 'React', icon: '⚛️' },
                  { label: 'Three.js', icon: '🎮' },
                  { label: 'Next.js', icon: '▲' },
                  { label: 'TypeScript', icon: '📘' },
                  { label: 'Node.js', icon: '🟢' },
                  { label: 'Rapier', icon: '⚡' },
                ]
              },
              { type: 'divider' },
              { type: 'text', content: 'Interagissez avec les objets, allumez les lumières, utilisez l\'ordinateur Windows XP, et débloquez des succès cachés !' },
            ]
          },
          {
            sections: [
              { type: 'title', text: 'Contrôles', gradient: 'linear-gradient(135deg, #fff 0%, #fbbf24 50%, #f97316 100%)' },
              { type: 'text', content: '🕹️ ZQSD — Se déplacer\n🖱️ Souris — Regarder\n🔑 E — Interagir\n🚀 Espace — Sauter\n⎋ Echap — Quitter le PC' },
              { type: 'divider' },
              { type: 'title', text: 'Liens', gradient: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #7c3aed 100%)' },
              {
                type: 'links', items: [
                  { label: 'GitHub', url: 'https://github.com/infuseting/ThreeJS-Portfolio', icon: '🐙' }
                ]
              },
            ]
          },
        ],
        footerButtons: [
          { label: 'Accéder a une version basique', onClick: () => openBaseWebsite(), variant: 'primary', icon: '📄' },
          { label: 'Commencer l\'exploration', onClick: () => hideInfoPanel(), variant: 'primary', icon: '🚀' },
        ],
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [])

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

            {/* Info panel overlay */}
            <InfoPanel />
          </main>
        </ComputerFocusProvider>
      </InteractionProvider>
    </KeyboardControls>
  )
}

