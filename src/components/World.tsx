'use client'

import { RigidBody, CuboidCollider } from '@react-three/rapier'

export function World() {
  const floorSize = 500
  const wallHeight = 50
  const wallThickness = 10

  return (
    <group>
      {/* Massive floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[floorSize, 1, floorSize]} />
          <meshStandardMaterial color="#303030" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Grid Helper to give a sense of speed and scale */}
      <gridHelper args={[floorSize, floorSize / 2, '#444444', '#222222']} position={[0, 0.01, 0]} />

      {/* Massive Walls */}
      <group>
        {/* North Wall */}
        <RigidBody type="fixed">
          <mesh position={[0, wallHeight / 2, -floorSize / 2 - wallThickness / 2]}>
            <boxGeometry args={[floorSize + wallThickness * 2, wallHeight, wallThickness]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
        </RigidBody>

        {/* South Wall */}
        <RigidBody type="fixed">
          <mesh position={[0, wallHeight / 2, floorSize / 2 + wallThickness / 2]}>
            <boxGeometry args={[floorSize + wallThickness * 2, wallHeight, wallThickness]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
        </RigidBody>

        {/* East Wall */}
        <RigidBody type="fixed">
          <mesh position={[floorSize / 2 + wallThickness / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
        </RigidBody>

        {/* West Wall */}
        <RigidBody type="fixed">
          <mesh position={[-floorSize / 2 - wallThickness / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[wallThickness, wallHeight, floorSize]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
        </RigidBody>
      </group>
    </group>
  )
}
