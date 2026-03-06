'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Player } from '@/components/3d/scene/Player'
import { Door } from '@/components/3d/scene/Door'
import { Apartment } from '@/components/3d/scene/Apartment'
import { SwitchableLight } from '@/components/3d/lighting/SwitchableLight'
import { LightSwitch } from '@/components/3d/lighting/LightSwitch'
import { LightNetworkProvider } from '@/components/3d/lighting/LightNetwork'
import { InteractionRaycaster } from '@/components/interaction/InteractionRaycaster'
import { Computer } from '@/components/ui/Computer'


export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ fov: 45 }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      <ambientLight intensity={0.02} />

      <InteractionRaycaster />

      <LightNetworkProvider defaults={{ room1: false }}>
        <Physics gravity={[0, -30, 0]}>
          <Player />
          <Apartment />

          {/* ──────── Chambre ──────── */}

          <Door
            position={[0.95, 0, -0.35]}
            rotation={[0, Math.PI / 2, 0]}
            height={2.85}
            width={1.80}
            color="#8B5A2B"
            lock={true}
            openAngle={-90}
          />

          <SwitchableLight
            channel="bedroom1"
            position={[6, 2.6, -3]}
            intensity={20}
            color="#ffe4b5"
          />
          <LightSwitch
            channels="bedroom1"
            position={[1.30, 1.5, -2.50]}
            rotation={[0, Math.PI / 2, 0]}
          />

          <Computer
            position={[9, 0, -0.25]}
            rotation={[0, Math.PI, 0]}
          />
        </Physics>
      </LightNetworkProvider>
    </Canvas>
  )
}
