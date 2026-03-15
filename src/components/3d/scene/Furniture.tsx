'use client'

import { RigidBody } from '@react-three/rapier'
import type { ThreeElements } from '@react-three/fiber'
import type * as THREE from 'three'
import { GLTFModel, preloadModel } from '@/components/3d/models/GLTFModel'

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
}: FurnitureProps) {
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

  if (!withPhysics) {
    return model
  }

  return (
    <RigidBody type={rigidBodyType} colliders={colliders}>
      {model}
    </RigidBody>
  )
}

export function preloadFurniture(url: string) {
  preloadModel(url)
}
