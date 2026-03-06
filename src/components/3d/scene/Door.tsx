'use client'

import * as THREE from 'three'
import { useRef, useState, useCallback, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, type RapierRigidBody } from '@react-three/rapier'
import { useInteractable } from '@/hooks/3d/useInteractable'

interface DoorProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  depth?: number
  color?: string
  openAngle?: number
  speed?: number
  lock?: boolean
  children?: ReactNode
  onToggle?: (isOpen: boolean) => void
  interactionId?: string
  interactionLabel?: string
}

/**
 * Interactive door that opens / closes when the player presses E nearby.
 * The door pivots around its left edge (hinge side).
 */
export function Door({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1.2,
  height = 2.4,
  depth = 0.1,
  color = '#8B5A2B',
  openAngle = 90,
  speed = 3,
  lock = false,
  children,
  onToggle,
  interactionId,
  interactionLabel,
}: DoorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pivotRef = useRef<THREE.Group>(null)
  const doorColliderRef = useRef<RapierRigidBody>(null)
  const colliderAnchorRef = useRef<THREE.Group>(null)
  const currentAngle = useRef(0)

  const label = interactionLabel ?? (isOpen ? 'Fermer la porte' : 'Ouvrir la porte')

  const toggle = useCallback(() => {
    if (lock) return
    setIsOpen((prev) => {
      const next = !prev
      onToggle?.(next)
      return next
    })
  }, [onToggle, lock])

  const { interactiveRef, isHighlighted } = useInteractable({
    position,
    interactionId,
    interactionLabel: label,
    onInteract: toggle,
    disabled: lock,
  })

  const targetAngle = isOpen ? THREE.MathUtils.degToRad(openAngle) : 0

  // Temp objects to avoid GC pressure
  const _worldPos = useRef(new THREE.Vector3())
  const _worldQuat = useRef(new THREE.Quaternion())

  useFrame((_state, delta) => {
    if (!pivotRef.current) return
    const diff = targetAngle - currentAngle.current
    if (Math.abs(diff) > 0.001) {
      const step = Math.sign(diff) * Math.min(Math.abs(diff), speed * delta)
      currentAngle.current += step
      pivotRef.current.rotation.y = currentAngle.current
    }

    // Sync the kinematic collider to follow the door's visual position
    if (doorColliderRef.current && colliderAnchorRef.current) {
      colliderAnchorRef.current.getWorldPosition(_worldPos.current)
      colliderAnchorRef.current.getWorldQuaternion(_worldQuat.current)
      doorColliderRef.current.setNextKinematicTranslation(_worldPos.current)
      doorColliderRef.current.setNextKinematicRotation(_worldQuat.current)
    }
  })

  return (
    <group position={position} rotation={rotation}>
      <group ref={pivotRef}>
        <group ref={interactiveRef} position={[width / 2, height / 2, 0]}>
          {children ?? (
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={color}
                emissive={isHighlighted ? '#ffffff' : '#000000'}
                emissiveIntensity={isHighlighted ? 0.15 : 0}
              />
            </mesh>
          )}
        </group>

        {/* Invisible anchor that follows the pivot rotation (used to read world transform) */}
        <group ref={colliderAnchorRef} position={[width / 2, height / 2, 0]} />
      </group>

      {/* Kinematic collider for the door panel — synced each frame */}
      <RigidBody ref={doorColliderRef} type="kinematicPosition" colliders={false}>
        <CuboidCollider
          args={[width / 2, height / 2, depth / 2]}
        />
      </RigidBody>

      {/* Door frame */}
      <DoorFrame width={width} height={height} depth={depth} />
    </group>
  )
}

/* ── Door frame (static decoration + collision) ── */

function DoorFrame({ width, height, depth }: { width: number; height: number; depth: number }) {
  const frameColor = '#5C3A1E'
  const frameThickness = 0.1
  return (
    <group>
      {/* Lintel (top bar) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[(width + 0.2) / 2, frameThickness / 2, (depth + 0.05) / 2]}
          position={[width / 2, height + 0.05, 0]}
        />
        <mesh position={[width / 2, height + 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.2, frameThickness, depth + 0.05]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      </RigidBody>

      {/* Left post */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[frameThickness / 2, (height + 0.1) / 2, (depth + 0.05) / 2]}
          position={[-0.05, height / 2, 0]}
        />
        <mesh position={[-0.05, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[frameThickness, height + 0.1, depth + 0.05]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      </RigidBody>

      {/* Right post */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[frameThickness / 2, (height + 0.1) / 2, (depth + 0.05) / 2]}
          position={[width + 0.05, height / 2, 0]}
        />
        <mesh position={[width + 0.05, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[frameThickness, height + 0.1, depth + 0.05]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      </RigidBody>
    </group>
  )
}
