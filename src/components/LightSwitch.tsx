'use client'

import { useRef, type ReactNode } from 'react'
import { useLightChannel, useToggleLight } from '@/components/LightNetwork'
import { useInteractable } from '@/hooks/useInteractable'
import { unlockAchievement } from '@/components/AchievementStore'

interface LightSwitchProps {
  /** One or more channel ids this switch controls */
  channels: string | string[]
  position?: [number, number, number]
  rotation?: [number, number, number]
  size?: [number, number, number]
  color?: string
  children?: ReactNode
  interactionId?: string
  interactionLabel?: string
}

/**
 * An interactive wall-switch that toggles one or several light channels
 * when the player presses E nearby.
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

  // Read the first channel to determine visual state
  const isOn = useLightChannel(channelArray[0])

  // Build togglers for every channel
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const togglers = channelArray.map((ch) => useToggleLight(ch))

  const label = interactionLabel ?? (isOn ? 'Éteindre la lumière' : 'Allumer la lumière')

  const streakRef = useRef(0)
  const lastToggleTimeRef = useRef(0)

  const toggleAll = () => {
    togglers.forEach((t) => t(!isOn))

    // Achievement logic: 10 toggles in a row with < 1s between each
    const now = performance.now()
    if (now - lastToggleTimeRef.current < 1000) {
      streakRef.current += 1
    } else {
      streakRef.current = 1 // Reset streak if too slow
    }
    lastToggleTimeRef.current = now

    if (streakRef.current >= 10) {
      unlockAchievement('jour-nuit')
    }
  }

  const { interactiveRef, isHighlighted } = useInteractable({
    position,
    interactionId,
    interactionLabel: label,
    onInteract: toggleAll,
  })

  return (
    <group position={position} rotation={rotation}>
      <group ref={interactiveRef}>
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
                emissive={isOn ? '#4ade80' : '#aaaaaa'}
                emissiveIntensity={isHighlighted ? 0.6 : 0.25}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}
