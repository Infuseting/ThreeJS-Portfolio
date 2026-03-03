'use client'

import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Player } from '@/components/Player'
import { Door } from '@/components/Door'
import { SwitchableLight } from '@/components/SwitchableLight'
import { LightSwitch } from '@/components/LightSwitch'
import { LightNetworkProvider } from '@/components/LightNetwork'
import { InteractionRaycaster } from '@/components/InteractionRaycaster'
import { Computer } from '@/components/Computer'
import { Sky, Environment } from '@react-three/drei'

/** Simple floor + walls demo room */
function DemoRoom() {
  const wallColor = '#cccccc'
  const floorSize = 20
  const wallHeight = 4
  const wallThickness = 0.2

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[floorSize, 0.2, floorSize]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </RigidBody>

      {/* Back wall (Z-) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow castShadow position={[0, wallHeight / 2, -floorSize / 2]}>
          <boxGeometry args={[floorSize, wallHeight, wallThickness]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      </RigidBody>

      {/* Front wall (Z+) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow castShadow position={[0, wallHeight / 2, floorSize / 2]}>
          <boxGeometry args={[floorSize, wallHeight, wallThickness]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      </RigidBody>

      {/* Left wall (X-) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow castShadow position={[-floorSize / 2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      </RigidBody>

      {/* Right wall (X+) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow castShadow position={[floorSize / 2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      </RigidBody>

      {/* Interior dividing wall with a door opening */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* Left part of the wall */}
        <mesh receiveShadow castShadow position={[-4, wallHeight / 2, -3]}>
          <boxGeometry args={[6, wallHeight, wallThickness]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        {/* Right part of the wall (after door gap) */}
        <mesh receiveShadow castShadow position={[4.5, wallHeight / 2, -3]}>
          <boxGeometry args={[5, wallHeight, wallThickness]} />
          <meshStandardMaterial color={wallColor} />
        </mesh>
      </RigidBody>
    </group>
  )
}

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

      {/* Raycaster for interaction detection */}
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
