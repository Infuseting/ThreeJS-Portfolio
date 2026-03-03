'use client'

import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier'
import { useComputerFocus, useComputerFocusActions } from '@/components/ComputerFocusStore'

const SPEED = 5.0
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

export function Player() {
  const rigidBody = useRef<RapierRigidBody>(null)
  const [, get] = useKeyboardControls()
  const { rapier, world } = useRapier()
  const pointerControlsRef = useRef<any>(null)

  // Computer focus
  const focusState = useComputerFocus()
  const { exit: exitFocus } = useComputerFocusActions()
  const isFocused = focusState.focused
  
  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Track time since last footstep
  const lastFootstepTime = useRef(0)

  useEffect(() => {
    // Initialize Audio element
    audioRef.current = new Audio('/sound/feet/footstep.mp3')
    audioRef.current.volume = 0.5
    audioRef.current.loop = true
  }, [])

  // Escape key exits computer focus and re-locks pointer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isFocused) {
        e.preventDefault()
        document.exitPointerLock?.()
        exitFocus()
        setTimeout(() => {
          pointerControlsRef.current?.lock?.()
        }, 200)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, exitFocus])

  const handleFootsteps = (isMoving: boolean, isGrounded: boolean) => {
    if (!audioRef.current) return

    if (isMoving && isGrounded) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e))
      }
    } else {
      if (!audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }

  useFrame((state) => {
    if (!rigidBody.current) return

    // When focused on a computer, freeze the player and stop footsteps
    if (isFocused) {
      const velocity = rigidBody.current.linvel()
      rigidBody.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)
      handleFootsteps(false, false)
      return
    }

    const { forward, backward, left, right, jump } = get()
    const velocity = rigidBody.current.linvel()

    // Update camera to match player body position (eyes level)
    const translation = rigidBody.current.translation()
    state.camera.position.set(translation.x, translation.y + 0.75, translation.z)

    // Calculate movement direction relative to camera
    frontVector.set(0, 0, Number(backward) - Number(forward))
    sideVector.set(Number(left) - Number(right), 0, 0)
    
    // Normalize and apply rotation from camera
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(state.camera.rotation)

    // Apply movement
    rigidBody.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)

    // Jumping & Ground check via raycast
    // Start ray at the center of the player, cast downwards
    const rayOrigin = { x: translation.x, y: translation.y, z: translation.z }
    const rayDir = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    const hit = world.castRay(ray, 1.025, true, undefined, undefined, undefined, rigidBody.current as any)
    const isGrounded = hit !== null

    if (jump && isGrounded) {
      rigidBody.current.setLinvel({ x: velocity.x, y: 5, z: velocity.z }, true)
    }

    // Footsteps
    const isMoving = Math.abs(velocity.x) > 0.5 || Math.abs(velocity.z) > 0.5
    handleFootsteps(isMoving, isGrounded)
    
    // Void Reset
    if (translation.y < -10) {
      rigidBody.current.setTranslation({ x: 1, y: 1, z: 0 }, true)
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <>
      {!isFocused && <PointerLockControls ref={pointerControlsRef} />}
      <RigidBody
        ref={rigidBody}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[1, 1, 0]}
        enabledRotations={[false, false, false]}
      >
        {/* CapsuleCollider args: [halfHeight, radius]. Total height = 2 * (halfHeight + radius)
            We want total height = 1.95. If radius = 0.5, then halfHeight = (1.95 - 2*0.5)/2 = 0.475 */}
        <CapsuleCollider args={[0.475, 0.5]} />
        
      </RigidBody>
    </>
  )
}
