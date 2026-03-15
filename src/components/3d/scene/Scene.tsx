'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Player } from '@/components/3d/scene/Player'
import { Apartment } from '@/components/3d/scene/Apartment'
import { LightNetworkProvider } from '@/components/3d/lighting/LightNetwork'
import { DayNightCycle } from '@/components/3d/lighting/DayNightCycle'
import { InteractionRaycaster } from '@/components/interaction/InteractionRaycaster'


export default function Scene() {
  const [showPhysicsDebug, setShowPhysicsDebug] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'F3') {
        event.preventDefault()
        setShowPhysicsDebug((prev) => !prev)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Canvas
      shadows
      camera={{ fov: 45 }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      <DayNightCycle />

      <InteractionRaycaster />

      <LightNetworkProvider defaults={{ room1: false }}>
        <Physics gravity={[0, -30, 0]} debug={showPhysicsDebug}>
          <Player />
          <Apartment />
        </Physics>
      </LightNetworkProvider>
    </Canvas>
  )
}
