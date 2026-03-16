'use client'

import { RigidBody } from '@react-three/rapier'
import type { ThreeElements } from '@react-three/fiber'
import type * as THREE from 'three'
import { GLTFModel, preloadModel } from '@/components/3d/models/GLTFModel'
import { SwitchableLight } from '@/components/3d/lighting/SwitchableLight'

type RigidBodyType = 'fixed' | 'dynamic' | 'kinematicPosition' | 'kinematicVelocity'
type ColliderType = 'cuboid' | 'ball' | 'trimesh' | 'hull' | false

export type FurnitureProps = {
  /** GLTF/GLB path in public folder */
  url: string
  /** Enable physics body around the furniture */
  withPhysics?: boolean
  /** Rapier rigid-body type (used when withPhysics=true) */
  rigidBodyType?: RigidBodyType
  /** Rapier collider shape strategy */
  colliders?: ColliderType
  /** Shadow setup passed to GLTF model */
  castShadow?: boolean
  receiveShadow?: boolean
  /** Optional material override for all meshes */
  material?: THREE.Material
} & Pick<ThreeElements['group'], 'position' | 'rotation' | 'scale' | 'name'>

// Optional light props that can be attached to a furniture item
export type FurnitureLightProps = {
  /** Optional light network channel id — when provided a SwitchableLight is created */
  lightChannel?: string
  /** Light type (point | spot | directional) */
  lightType?: 'point' | 'spot' | 'directional'
  /** Position offset (relative to furniture position) for the light element */
  lightOffset?: [number, number, number]
  /** Base intensity when ON */
  lightIntensity?: number
  /** Intensity when OFF */
  lightOffIntensity?: number
  /** Light color */
  lightColor?: string
  /** Light distance */
  lightDistance?: number
  /** Cast shadow for the light */
  lightCastShadow?: boolean
    /** Whether to show the 3D fixture visuals for this light (overrides provider) */
    lightShowFixture?: boolean
}

/**
 * Generic furniture wrapper for GLTF models with optional Rapier physics.
 */
export function Furniture({
  url,
  withPhysics = true,
  rigidBodyType = 'fixed',
  colliders = 'trimesh',
  castShadow = true,
  receiveShadow = true,
  material,
  position,
  rotation,
  scale,
  name,
  // light props (optional)
  lightChannel,
  lightType = 'point',
  lightOffset,
  lightIntensity = 2,
  lightOffIntensity = 0,
  lightColor = '#ffffff',
  lightDistance = 15,
  lightCastShadow = true,
  lightShowFixture,
}: FurnitureProps & FurnitureLightProps) {
  const model = (
    <GLTFModel
      url={url}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
    />
  )

  const lightElement = lightChannel ? (
    <SwitchableLight
      channel={lightChannel}
      type={lightType}
      intensity={lightIntensity}
      offIntensity={lightOffIntensity}
      color={lightColor}
      distance={lightDistance}
      castShadow={lightCastShadow}
      showFixture={lightShowFixture}
      position={(() => {
        const base = position as unknown as [number, number, number] | undefined
        if (base) {
          return [
            (base[0] ?? 0) + (lightOffset?.[0] ?? 0),
            (base[1] ?? 0) + (lightOffset?.[1] ?? 0),
            (base[2] ?? 0) + (lightOffset?.[2] ?? 0),
          ]
        }
        return lightOffset
      })()}
    />
  ) : null

  if (!withPhysics) {
    return (
      <>
        {model}
        {lightElement}
      </>
    )
  }

  return (
    <RigidBody type={rigidBodyType} colliders={colliders}>
      {model}
      {lightElement}
    </RigidBody>
  )
}

export function preloadFurniture(url: string) {
  preloadModel(url)
}
