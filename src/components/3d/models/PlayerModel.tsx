'use client'

import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

export type PlayerAnimation = 
    | 'Man_Clapping'
    | 'Man_Death'
    | 'Man_Idle'
    | 'Man_Jump'
    | 'Man_Punch'
    | 'Man_Run'
    | 'Man_RunningJump'
    | 'Man_Sitting'
    | 'Man_Standing'
    | 'Man_SwordSlash'
    | 'Man_Walk'

interface PlayerModelProps {
    animation: PlayerAnimation
    rotationY?: number
    position?: [number, number, number]
    scale?: number
    headRef?: React.RefObject<THREE.Object3D | null>
    isSelf?: boolean
}

/**
 * PlayerModel component that loads the 'player.glb' model
 * and handles its animations based on state.
 */
export function PlayerModel({ animation, rotationY = 0, position = [0, -0.95, 0], scale = 0.75, headRef, isSelf }: PlayerModelProps) {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF('/model/character/player.glb')
    const { actions, names } = useAnimations(animations, group)

    // Find and assign head bone to ref if provided
    useEffect(() => {
        if (headRef && scene) {
            scene.traverse((child) => {
                // Common names for head bones in Mixamo/GLTF characters
                if (child.name.toLocaleLowerCase().includes('head')) {
                    (headRef as any).current = child
                }
            })
        }
    }, [scene, headRef])

    // Debug: log names to verify exact matches
    useEffect(() => {
        console.log("Available animations:", names)
    }, [names])

    // Handle animation transitions
    useEffect(() => {
        // Find exact match or case-insensitive match or inclusion match
        const actualName = names.find(n => n === animation) || 
                          names.find(n => n.toLowerCase() === animation.toLowerCase()) ||
                          names.find(n => n.toLowerCase().includes(animation.toLowerCase()))
        
        const currentAction = actualName ? actions[actualName] : null
        
        if (currentAction) {
            // Fade out all other actions
            Object.values(actions).forEach((action) => {
                if (action && action !== currentAction) {
                    action.fadeOut(0.2)
                }
            })

            // Reset and fade in the target action
            currentAction.reset().fadeIn(0.2).play()
        }

        return () => {
            if (currentAction) currentAction.fadeOut(0.2)
        }
    }, [animation, actions, names])

    // Apply rotation from the player controller
    useEffect(() => {
        if (group.current) {
            group.current.rotation.y = rotationY
        }
    }, [rotationY])

    // Apply shadow settings to all meshes in the scene
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                
                const mesh = child as THREE.Mesh
                if (isSelf) {
                    // Standard Three.js trick: invisible to camera but casts shadows
                    // colorWrite = false prevents rendering to the color buffer
                    // renderOrder = 999 ensures it renders after opaque objects to avoid depth masking
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => {
                            m.colorWrite = !isSelf
                        })
                    } else {
                        mesh.material.colorWrite = !isSelf
                    }
                    mesh.renderOrder = 999
                } else {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => {
                            m.colorWrite = true
                        })
                    } else {
                        mesh.material.colorWrite = true
                    }
                    mesh.renderOrder = 0
                }
            }
        })
    }, [scene, isSelf])

    return (
        <group ref={group} position={position} scale={scale} dispose={null}>
            <primitive object={scene} />
        </group>
    )
}

useGLTF.preload('/model/character/player.glb')
