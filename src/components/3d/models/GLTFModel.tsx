'use client'

import React from 'react'
import { useGLTF, Clone } from '@react-three/drei'
import * as THREE from 'three'

import { ThreeElements } from '@react-three/fiber'

export type GLTFModelProps = ThreeElements['group'] & {
    /** 
     * Path to the .glb or .gltf file (e.g., '/models/my-model.glb').
     * Must be located in the `public` folder.
     */
    url: string
    /** Whether the model meshes should cast shadows (default: true) */
    castShadow?: boolean
    /** Whether the model meshes should receive shadows (default: true) */
    receiveShadow?: boolean
    /** 
     * Custom material override. If provided, applies this material
     * to all meshes in the cloned model.
     */
    material?: THREE.Material
}

/**
 * ═══════════════════════════════════════════════
 *  SOLID 3D Model Loader (GLTF / GLB)
 *
 *  - Uses `@react-three/drei`'s `useGLTF` for caching.
 *  - Uses `<Clone>` to safely allow multiple instances
 *    of the same model URL on screen without their
 *    materials/geometries interfering with each other.
 *  - Automatically applies shadow parameters securely
 *    on the cloned instances, not the cached original.
 * ═══════════════════════════════════════════════
 */
export function GLTFModel({
    url,
    castShadow = true,
    receiveShadow = true,
    material,
    ...props
}: GLTFModelProps) {
    // `useGLTF` automatically handles Suspense caching
    const gltf = useGLTF(url)

    // We use <Clone> to render an independent instance of the cached scene.
    // This is crucial in Three.js so modifying one model doesn't affect others.
    return (
        <group {...props}>
            <Clone
                object={gltf.scene}
                castShadow={castShadow}
                receiveShadow={receiveShadow}
                inject={
                    material
                        ? <mesh material={material} /> // Injects material into all copied meshes
                        : undefined
                }
            />
        </group>
    )
}

/**
 * Helper to preload models before they are actually rendered.
 * Call this outside of your components (in module scope) 
 * for assets you know you will definitely need.
 * 
 * @example preloadModel('/models/desk.glb')
 */
export function preloadModel(url: string) {
    useGLTF.preload(url)
}
