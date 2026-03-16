'use client'

import { ReactNode } from 'react'
import { useLightChannel, useLightConfig } from '@/components/3d/lighting/LightNetwork'

/* ─────────────────────────────────────────────
 *  SwitchableLight
 *
 *  A Three.js light that is controlled by the
 *  light‑network channel it subscribes to.
 *  When the channel is OFF the light intensity
 *  drops to 0 (or a configurable dim level).
 * ───────────────────────────────────────────── */

type LightType = 'point' | 'spot' | 'directional'

interface SwitchableLightProps {
  /** Channel id this light listens to */
  channel: string
  /** World position */
  position?: [number, number, number]
  /** Light type (default: point) */
  type?: LightType
  /** Base intensity when ON */
  intensity?: number
  /** Intensity when OFF (default 0) */
  offIntensity?: number
  /** Light colour */
  color?: string
  /** Distance (pointLight / spotLight) */
  distance?: number
  /** Cast shadow */
  castShadow?: boolean
  /** Spot‑light angle (radians) */
  angle?: number
  /** Spot‑light penumbra */
  penumbra?: number
  /** Optional children to visually represent the light fixture */
  children?: ReactNode
  /** If false, do not render the default 3D fixture (bulb, cable). Falls back to provider config when undefined. */
  showFixture?: boolean
}

export function SwitchableLight({
  channel,
  position = [0, 3, 0],
  type = 'point',
  intensity = 2,
  offIntensity = 0,
  color = '#ffffff',
  distance = 15,
  castShadow = true,
  angle = Math.PI / 4,
  penumbra = 0.5,
  children,
  showFixture,
}: SwitchableLightProps) {
  const isOn = useLightChannel(channel)
  const currentIntensity = isOn ? intensity : offIntensity
  const { showFixtures: providerShowFixtures } = useLightConfig()
  const showFixtureFinal = showFixture ?? providerShowFixtures

  const lightElement = (() => {
    switch (type) {
      case 'spot':
        return (
          <spotLight
            position={position}
            intensity={currentIntensity}
            color={color}
            distance={distance}
            castShadow={castShadow}
            angle={angle}
            penumbra={penumbra}
          />
        )
      case 'directional':
        return (
          <directionalLight
            position={position}
            intensity={currentIntensity}
            color={color}
            castShadow={castShadow}
          />
        )
      case 'point':
      default:
        return (
          <pointLight
            position={position}
            intensity={currentIntensity}
            color={color}
            distance={distance}
            castShadow={castShadow}
          />
        )
    }
  })()

  return (
    <group>
      {lightElement}

      {/* Render fixture visuals only when enabled (provider or prop) */}
      {showFixtureFinal ? (children ?? (
        <group position={position}>
          {/* Cable / Wire (extends upwards into the ceiling) */}
          <mesh position={[0, 2.52, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 5, 8]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>

          {/* Socket / Base */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
            <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.2} />
          </mesh>

          {/* Glass Bulb */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.07, 32, 32]} />
            <meshStandardMaterial
              color={isOn ? color : '#ffffff'}
              emissive={isOn ? color : '#000000'}
              emissiveIntensity={isOn ? 2 : 0}
              transparent={!isOn}
              opacity={isOn ? 1 : 0.4}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        </group>
      )) : null}
    </group>
  )
}
