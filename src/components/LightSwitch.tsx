'use client'

import * as THREE from 'three'
import { useRef, useCallback, type MutableRefObject, ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useLightChannel, useToggleLight } from '@/components/LightNetwork'
import { useInteractionTarget } from '@/components/InteractionStore'

const INTERACT_DISTANCE = 3

interface LightSwitchProps {
  /** One or more channel ids this switch controls */
  channels: string | string[]
  /** World position */
  position?: [number, number, number]
  /** Rotation */
  rotation?: [number, number, number]
  /** Size of the switch plate */
  size?: [number, number, number]
  /** Colour of the plate */
  color?: string
  /** Optional custom visual (overrides default box) */
  children?: ReactNode
  /** Unique id for interaction highlight */
  interactionId?: string
  /** Label shown on the HUD */
  interactionLabel?: string
}

/**
 * An interactive wall‑switch that toggles one **or several** light channels
 * when the player presses E nearby.
 *
 * The default visual is a small wall plate with a toggleable lever.
 * Pass `children` to replace with your own mesh / model.
 */
export function LightSwitch({
  channels,
  position = [0, 1.2, 0],
  rotation = [0, 0, 0],
  size = [0.15, 0.25, 0.05],
  color = '#e0e0e0',
  children,
  interactionId,
  interactionLabel,
}: LightSwitchProps) {
  const channelArray = Array.isArray(channels) ? channels : [channels]

  // We read the first channel to determine visual state
  const isOn = useLightChannel(channelArray[0])

  // Build togglers for every channel
  const togglers = channelArray.map((ch) => useToggleLight(ch))

  const [, get] = useKeyboardControls()
  const prevInteract = useRef(false)
  const groupRef = useRef<THREE.Group>(null)

  // Stable unique id
  const idRef = useRef(interactionId ?? `switch-${Math.random().toString(36).slice(2, 9)}`)
  const id = idRef.current
  const label = interactionLabel ?? (isOn ? 'Éteindre la lumière' : 'Allumer la lumière')

  // Read what the raycaster is currently targeting
  const target = useInteractionTarget()
  const isHighlighted = target?.id === id

  // Register interactive userData synchronously so the raycaster always reads the latest label.
  const groupRefCallback = useCallback(
    (node: THREE.Group | null) => {
      (groupRef as MutableRefObject<THREE.Group | null>).current = node
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

  // Keep userData in sync on re-renders where the ref node hasn't changed
  if (groupRef.current) {
    groupRef.current.userData = {
      interactive: true,
      interactionId: id,
      interactionLabel: label,
      interactionKey: 'E',
    }
  }

  const toggleAll = () => {
    // We toggle based on the first channel's current state so all channels stay in sync
    togglers.forEach((t) => t(!isOn))
  }

  useFrame((state) => {
    const { interact } = get() as { interact: boolean }
    if (interact && !prevInteract.current) {
      const switchPos = new THREE.Vector3(...position)
      if (state.camera.position.distanceTo(switchPos) < INTERACT_DISTANCE) {
        toggleAll()
      }
    }
    prevInteract.current = interact
  })

  return (
    <group position={position} rotation={rotation}>
      <group ref={groupRefCallback}>
        {children ?? (
          <group>
            {/* Back plate */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial
                color={color}
                emissive={isHighlighted ? '#ffffff' : '#000000'}
                emissiveIntensity={isHighlighted ? 0.25 : 0}
              />
            </mesh>

            {/* Toggle lever */}
            <mesh
              position={[0, isOn ? 0.04 : -0.04, size[2] / 2 + 0.015]}
              castShadow
            >
              <boxGeometry args={[0.04, 0.08, 0.03]} />
              <meshStandardMaterial
                color={isOn ? '#4ade80' : '#888'}
                emissive={isHighlighted ? '#ffffff' : '#000000'}
                emissiveIntensity={isHighlighted ? 0.25 : 0}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}
