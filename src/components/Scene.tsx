'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Player } from '@/components/Player'
import { Door } from '@/components/Door'
import { Apartment } from '@/components/Apartment'
import { SwitchableLight } from '@/components/SwitchableLight'
import { LightSwitch } from '@/components/LightSwitch'
import { LightNetworkProvider } from '@/components/LightNetwork'
import { InteractionRaycaster } from '@/components/InteractionRaycaster'
import { Computer } from '@/components/Computer'


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
            channel="room1"
            position={[6, 2.90, -3]}
            intensity={20}
            color="#ffe4b5"
          />
          <LightSwitch
            channels="room1"
            position={[1.30, 1.5, -2.50]}
            rotation={[0, Math.PI / 2, 0]}
          />


          {/* ──────── Computer ──────── */}
          <Computer
            position={[9, 0, -0.25]}
            rotation={[0, Math.PI, 0]}
          />
        </Physics>
      </LightNetworkProvider>
    </Canvas>
  )
}
