'use client'

import * as THREE from 'three'
import { useRef, useCallback, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useInteractionTarget } from '@/components/InteractionStore'

/** Default interaction distance shared across all interactable objects. */
export const INTERACT_DISTANCE = 3

interface UseInteractableOptions {
  /** World position of the object (used for distance check). */
  position: [number, number, number]
  /** Unique interaction id (auto-generated if omitted). */
  interactionId?: string
  /** Label displayed on the HUD when looking at the object. */
  interactionLabel: string
  /** Key hint shown on the HUD (default "E"). */
  interactionKey?: string
  /** Called on rising-edge of E press when within range & targeted. */
  onInteract: () => void
  /** Custom max distance (defaults to INTERACT_DISTANCE). */
  maxDistance?: number
}

interface UseInteractableReturn {
  /** Ref callback — assign to the group that should be considered interactive. */
  interactiveRef: (node: THREE.Group | null) => void
  /** Whether the raycaster is currently targeting this object. */
  isHighlighted: boolean
  /** The stable id used for this interactable. */
  id: string
}

/**
 * Shared hook that encapsulates the boilerplate common to every interactive
 * 3D object (Door, LightSwitch, Computer):
 *
 *   1. Generates / stores a stable unique id.
 *   2. Sets `userData` on the interactive group so the raycaster can pick it up.
 *   3. Keeps `userData` in sync across re-renders.
 *   4. Detects a rising-edge press of the E key while the player is within range
 *      and the raycaster is targeting this object, then calls `onInteract`.
 *   5. Exposes `isHighlighted` for emissive feedback.
 */
export function useInteractable({
  position,
  interactionId,
  interactionLabel,
  interactionKey = 'E',
  onInteract,
  maxDistance = INTERACT_DISTANCE,
}: UseInteractableOptions): UseInteractableReturn {
  /* ── Stable id ── */
  const idRef = useRef(interactionId ?? `interactable-${Math.random().toString(36).slice(2, 9)}`)
  const id = idRef.current

  /* ── Raycaster highlight ── */
  const target = useInteractionTarget()
  const isHighlighted = target?.id === id

  /* ── Group ref ── */
  const groupRef = useRef<THREE.Group | null>(null)

  const userData = {
    interactive: true,
    interactionId: id,
    interactionLabel,
    interactionKey,
  }

  const interactiveRef = useCallback(
    (node: THREE.Group | null) => {
      (groupRef as MutableRefObject<THREE.Group | null>).current = node
      if (node) node.userData = { ...userData }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, interactionLabel, interactionKey],
  )

  // Keep userData in sync on re-renders where the node hasn't changed
  if (groupRef.current) {
    groupRef.current.userData = { ...userData }
  }

  /* ── Rising-edge E key detection ── */
  const [, get] = useKeyboardControls()
  const prevInteract = useRef(false)

  useFrame((state) => {
    const { interact } = get() as { interact: boolean }
    if (interact && !prevInteract.current) {
      if (groupRef.current) {
        const objPos = new THREE.Vector3()
        groupRef.current.getWorldPosition(objPos)
        const dist = state.camera.position.distanceTo(objPos)
        if (dist < maxDistance && target?.id === id) {
          onInteract()
        }
      }
    }
    prevInteract.current = interact
  })

  return { interactiveRef, isHighlighted, id }
}
