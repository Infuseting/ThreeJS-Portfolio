'use client'

import { ReactNode } from 'react'
import { useLightChannel } from '@/components/LightNetwork'

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
}: SwitchableLightProps) {
  const isOn = useLightChannel(channel)
  const currentIntensity = isOn ? intensity : offIntensity

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

      {/* Default fixture visual (small emissive sphere) */}
      {children ?? (
        <mesh position={position}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={isOn ? color : '#333333'}
            emissive={isOn ? color : '#000000'}
            emissiveIntensity={isOn ? 1 : 0}
          />
        </mesh>
      )}
    </group>
  )
}
