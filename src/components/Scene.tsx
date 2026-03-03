'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Player } from '@/components/Player'
import { Door } from '@/components/Door'
import { DemoRoom } from '@/components/DemoRoom'
import { SwitchableLight } from '@/components/SwitchableLight'
import { LightSwitch } from '@/components/LightSwitch'
import { LightNetworkProvider } from '@/components/LightNetwork'
import { InteractionRaycaster } from '@/components/InteractionRaycaster'
import { Computer } from '@/components/Computer'
import { Sky, Environment } from '@react-three/drei'

export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ fov: 45 }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.3} />
      <Environment preset="apartment" />

      <InteractionRaycaster />

      <LightNetworkProvider defaults={{ room1: true, room2: false }}>
        <Physics gravity={[0, -30, 0]}>
          <Player />
          <DemoRoom />

          {/* ──────── Door ──────── */}
          <Door
            position={[-0.6, 0, -3]}
            color="#8B5A2B"
            openAngle={90}
          />

          {/* ──────── Lights + Switches (room 1 — front) ──────── */}
          <SwitchableLight
            channel="room1"
            position={[0, 3.5, 2]}
            intensity={4}
            color="#ffe4b5"
          />
          <LightSwitch
            channels="room1"
            position={[-9.7, 1.2, 1]}
            rotation={[0, Math.PI / 2, 0]}
          />

          {/* ──────── Lights + Switches (room 2 — back) ──────── */}
          <SwitchableLight
            channel="room2"
            position={[0, 3.5, -6]}
            intensity={4}
            color="#b5d4ff"
          />
          <LightSwitch
            channels={['room2']}
            position={[-9.7, 1.2, -5]}
            rotation={[0, Math.PI / 2, 0]}
          />

          {/* ──────── Computer ──────── */}
          <Computer
            position={[5, 0, -7]}
            rotation={[0, Math.PI, 0]}
          />
        </Physics>
      </LightNetworkProvider>
    </Canvas>
  )
}
