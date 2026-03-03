'use client'

import * as THREE from 'three'
import { useRef, useState, useCallback, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useInteractable } from '@/hooks/useInteractable'

interface DoorProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  depth?: number
  color?: string
  openAngle?: number
  speed?: number
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
  children,
  onToggle,
  interactionId,
  interactionLabel,
}: DoorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pivotRef = useRef<THREE.Group>(null)
  const currentAngle = useRef(0)

  const label = interactionLabel ?? (isOpen ? 'Fermer la porte' : 'Ouvrir la porte')

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      onToggle?.(next)
      return next
    })
  }, [onToggle])

  const { interactiveRef, isHighlighted } = useInteractable({
    position,
    interactionId,
    interactionLabel: label,
    onInteract: toggle,
  })

  const targetAngle = isOpen ? THREE.MathUtils.degToRad(openAngle) : 0

  useFrame((_state, delta) => {
    if (!pivotRef.current) return
    const diff = targetAngle - currentAngle.current
    if (Math.abs(diff) > 0.001) {
      const step = Math.sign(diff) * Math.min(Math.abs(diff), speed * delta)
      currentAngle.current += step
      pivotRef.current.rotation.y = currentAngle.current
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

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[width / 2, height / 2, depth / 2]}
            position={[width / 2, height / 2, 0]}
          />
        </RigidBody>
      </group>

      {/* Door frame */}
      <DoorFrame width={width} height={height} depth={depth} />
    </group>
  )
}

/* ── Door frame (static decoration) ── */

function DoorFrame({ width, height, depth }: { width: number; height: number; depth: number }) {
  const frameColor = '#5C3A1E'
  return (
    <group>
      <mesh position={[width / 2, height + 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.2, 0.1, depth + 0.05]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[-0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height + 0.1, depth + 0.05]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[width + 0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height + 0.1, depth + 0.05]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
    </group>
  )
}
