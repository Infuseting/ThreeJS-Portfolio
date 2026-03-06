'use client'

import { RigidBody } from '@react-three/rapier'

/* ── Constants ── */
const FLOOR_SIZE = 20
const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.2
const WALL_COLOR = '#cccccc'

/** A single static wall segment. */
function Wall({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow castShadow position={position}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </RigidBody>
  )
}

/** Simple floor + walls demo room used in the 3D scene. */
export function DemoRoom() {
  const half = FLOOR_SIZE / 2

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.1, 0]}>
          <boxGeometry args={[FLOOR_SIZE, 0.2, FLOOR_SIZE]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </RigidBody>

      {/* Perimeter walls */}
      <Wall position={[0, WALL_HEIGHT / 2, -half]} size={[FLOOR_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[0, WALL_HEIGHT / 2, half]} size={[FLOOR_SIZE, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[-half, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, FLOOR_SIZE]} />
      <Wall position={[half, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, FLOOR_SIZE]} />

      {/* Interior dividing wall with a door opening */}
      <Wall position={[-4, WALL_HEIGHT / 2, -3]} size={[6, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[4.5, WALL_HEIGHT / 2, -3]} size={[5, WALL_HEIGHT, WALL_THICKNESS]} />
    </group>
  )
}
