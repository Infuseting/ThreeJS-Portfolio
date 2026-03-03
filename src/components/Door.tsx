'use client'

import * as THREE from 'three'
import { useRef, useState, useCallback, type MutableRefObject, ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { useInteractionTarget } from '@/components/InteractionStore'

/** Distance within which the player can interact with the door */
const INTERACT_DISTANCE = 3

interface DoorProps {
  /** World position of the door [x, y, z] */
  position?: [number, number, number]
  /** Rotation of the whole door group (euler) */
  rotation?: [number, number, number]
  /** Width of the door panel */
  width?: number
  /** Height of the door panel */
  height?: number
  /** Depth (thickness) of the door panel */
  depth?: number
  /** Color / material of the door */
  color?: string
  /** How many degrees the door opens (default 90) */
  openAngle?: number
  /** Speed of the door animation (radians/s) */
  speed?: number
  /** If provided, replaces the default box mesh for the door panel */
  children?: ReactNode
  /** Called when the door state changes */
  onToggle?: (isOpen: boolean) => void
  /** Unique id used for interaction highlight (defaults to auto-generated) */
  interactionId?: string
  /** Label shown in the HUD when looking at the door */
  interactionLabel?: string
}

/**
 * Interactive door that opens / closes when the player presses E nearby.
 *
 * The door pivots around its left edge (hinge side).
 * You can customise the visual by passing `children` — they will replace the
 * default box geometry while keeping the same pivot & collider logic.
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
  const doorGroupRef = useRef<THREE.Group>(null)
  const doorMeshRef = useRef<THREE.Mesh>(null)
  const currentAngle = useRef(0)
  const [, get] = useKeyboardControls()
  const prevInteract = useRef(false)

  // Stable unique id
  const idRef = useRef(interactionId ?? `door-${Math.random().toString(36).slice(2, 9)}`)
  const id = idRef.current
  const label = interactionLabel ?? (isOpen ? 'Fermer la porte' : 'Ouvrir la porte')

  // Read what the raycaster is currently targeting
  const target = useInteractionTarget()
  const isHighlighted = target?.id === id

  // Register interactive userData on the door mesh group
  // Updated synchronously so the raycaster always sees the latest label.
  const doorGroupRefCallback = useCallback(
    (node: THREE.Group | null) => {
      (doorGroupRef as MutableRefObject<THREE.Group | null>).current = node
      if (!node) return
      node.userData = {
        interactive: true,
        interactionId: id,
        interactionLabel: label,
        interactionKey: 'E',
      }
    },
    [id, label],
  )

  // Also keep userData in sync on re-renders where the ref node hasn't changed
  if (doorGroupRef.current) {
    doorGroupRef.current.userData = {
      interactive: true,
      interactionId: id,
      interactionLabel: label,
      interactionKey: 'E',
    }
  }

  const targetAngle = isOpen ? THREE.MathUtils.degToRad(openAngle) : 0

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      onToggle?.(next)
      return next
    })
  }, [onToggle])

  useFrame((state, delta) => {
    /* ── Interaction (E key, rising‑edge only) ── */
    const { interact } = get() as { interact: boolean }
    if (interact && !prevInteract.current) {
      // Check distance to the door
      const doorPos = new THREE.Vector3(...position)
      const dist = state.camera.position.distanceTo(doorPos)
      if (dist < INTERACT_DISTANCE) {
        toggle()
      }
    }
    prevInteract.current = interact

    /* ── Animate pivot ── */
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
      {/* Pivot point is at the left edge of the door (hinge) */}
      <group ref={pivotRef}>
        {/* Offset the door so the left edge sits on the pivot */}
        <group ref={doorGroupRefCallback} position={[width / 2, height / 2, 0]}>
          {children ?? (
            <mesh ref={doorMeshRef} castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={color}
                emissive={isHighlighted ? '#ffffff' : '#000000'}
                emissiveIntensity={isHighlighted ? 0.15 : 0}
              />
            </mesh>
          )}
        </group>

        {/* Physics collider matching the door panel */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[width / 2, height / 2, depth / 2]}
            position={[width / 2, height / 2, 0]}
          />
        </RigidBody>
      </group>

      {/* Optional: door frame (static, non‑moving) */}
      {/* Top frame bar */}
      <mesh position={[width / 2, height + 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.2, 0.1, depth + 0.05]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
      {/* Left frame */}
      <mesh position={[-0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height + 0.1, depth + 0.05]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
      {/* Right frame */}
      <mesh position={[width + 0.05, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, height + 0.1, depth + 0.05]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>
    </group>
  )
}
