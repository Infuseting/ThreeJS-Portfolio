'use client'

import * as THREE from 'three'
import { type ReactNode } from 'react'

/* ── Shared highlight props used by all computer sub-components ── */
export interface HighlightProps {
  emissive: string
  emissiveIntensity: number
}

export function getHighlightProps(isHighlighted: boolean): HighlightProps {
  return {
    emissive: isHighlighted ? '#ffffff' : '#000000',
    emissiveIntensity: isHighlighted ? 0.12 : 0,
  }
}

/* ── Desk ── */

interface Desk3DProps {
  width: number
  depth: number
  height: number
  legRadius: number
  highlight: HighlightProps
}

export function Desk3D({ width, depth, height, legRadius, highlight }: Desk3DProps) {
  const legPositions: [number, number, number][] = [
    [-width / 2 + 0.06, height / 2, -depth / 2 + 0.06],
    [width / 2 - 0.06, height / 2, -depth / 2 + 0.06],
    [-width / 2 + 0.06, height / 2, depth / 2 - 0.06],
    [width / 2 - 0.06, height / 2, depth / 2 - 0.06],
  ]

  return (
    <group>
      {/* Table top */}
      <mesh castShadow receiveShadow position={[0, height, 0]}>
        <boxGeometry args={[width, 0.05, depth]} />
        <meshStandardMaterial color="#B08050" {...highlight} />
      </mesh>

      {/* Legs */}
      {legPositions.map((pos, i) => (
        <mesh key={i} castShadow position={pos}>
          <cylinderGeometry args={[legRadius, legRadius, height, 8]} />
          <meshStandardMaterial color="#666" {...highlight} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Tower ── */

interface Tower3DProps {
  position: [number, number, number]
  highlight: HighlightProps
}

export function Tower3D({ position, highlight }: Tower3DProps) {
  return (
    <group>
      <mesh castShadow receiveShadow position={position}>
        <boxGeometry args={[0.2, 0.5, 0.45]} />
        <meshStandardMaterial color="#d0d0d0" {...highlight} />
      </mesh>
      {/* Power LED */}
      <mesh position={[position[0] + 0.1, position[1] + 0.1, position[2] + 0.226]}>
        <circleGeometry args={[0.015, 16]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

/* ── Monitor ── */

interface Monitor3DProps {
  /** Ref forwarded to the screen group */
  screenGroupRef: React.RefObject<THREE.Group | null>
  /** Ref forwarded to the screen mesh (for world-position computation) */
  screenMeshRef: React.RefObject<THREE.Mesh | null>
  position: [number, number, number]
  monitorW: number
  monitorH: number
  bezelW: number
  bezelH: number
  highlight: HighlightProps
  children?: ReactNode
}

export function Monitor3D({
  screenGroupRef,
  screenMeshRef,
  position,
  monitorW,
  monitorH,
  bezelW,
  bezelH,
  highlight,
  children,
}: Monitor3DProps) {
  return (
    <group ref={screenGroupRef} position={position}>
      {/* Bezel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[bezelW, bezelH, 0.04]} />
        <meshStandardMaterial color="#222" {...highlight} />
      </mesh>

      {/* Screen surface */}
      <mesh ref={screenMeshRef} position={[0, 0, 0.021]}>
        <planeGeometry args={[monitorW, monitorH]} />
        <meshStandardMaterial color="#000" emissive="#112244" emissiveIntensity={0.3} />
      </mesh>

      {/* Html overlay slot */}
      {children}

      {/* Stand */}
      <mesh castShadow position={[0, -bezelH / 2 - 0.06, -0.02]}>
        <boxGeometry args={[0.08, 0.24, 0.08]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Stand base */}
      <mesh castShadow receiveShadow position={[0, -bezelH / 2 - 0.18, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}

/* ── Keyboard ── */

interface Peripheral3DProps {
  position: [number, number, number]
  size: [number, number, number]
  highlight: HighlightProps
}

export function Keyboard3D({ position, size, highlight }: Peripheral3DProps) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#333" {...highlight} />
    </mesh>
  )
}

/* ── Mouse ── */

export function Mouse3D({ position, size, highlight }: Peripheral3DProps) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#333" {...highlight} />
    </mesh>
  )
}
