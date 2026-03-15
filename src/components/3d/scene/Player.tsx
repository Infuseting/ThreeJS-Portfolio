'use client'

import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier'
import { useComputerFocus, useComputerFocusActions } from '@/components/stores/ComputerFocusStore'
import { useInfoPanel } from '@/components/stores/InfoPanelStore'
import { unlockAchievement } from '@/components/stores/AchievementStore'
import { PlayerModel, PlayerAnimation } from '@/components/3d/models/PlayerModel'

const SPEED = 2
const RUN_SPEED = 1.6
const FIRST_PERSON_HEAD_Y_OFFSET = -0.12
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
const rotationMatrix = new THREE.Matrix4()
const targetQuaternion = new THREE.Quaternion()

export function Player() {
  const rigidBody = useRef<RapierRigidBody>(null)
  const [, get] = useKeyboardControls()
  const { rapier, world } = useRapier()
  const pointerControlsRef = useRef<any>(null)
  
  // Player state
  const [animation, setAnimation] = useState<PlayerAnimation>('Man_Idle')
  const [rotationY, setRotationY] = useState(0)

  // Computer focus
  const focusState = useComputerFocus()
  const { exit: exitFocus } = useComputerFocusActions()
  const { panel } = useInfoPanel()
  const isFocused = focusState.focused
  const isBlocked = isFocused || panel !== null

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

  const headRef = useRef<THREE.Object3D>(null)
  const headPosition = new THREE.Vector3()

  useFrame((state) => {
    if (!rigidBody.current) return

    // When focused on a computer or info panel is open, freeze the player and stop footsteps
    if (isBlocked) {
      const velocity = rigidBody.current.linvel()
      rigidBody.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)
      handleFootsteps(false, false)
      setAnimation(isFocused ? 'Man_Sitting' : 'Man_Idle')
      return
    }

    const { forward, backward, left, right, jump } = get()
    const velocity = rigidBody.current.linvel()
    const translation = rigidBody.current.translation()

    // ─── Achievement Tracking ───
    if (!isBlocked && !isFocused) {
      const distToComputer = Math.hypot(translation.x - 9, translation.z - (-0.25))
      if (distToComputer > 15) {
        const dirToComputer = new THREE.Vector3(9 - translation.x, 0, -0.25 - translation.z).normalize()
        const camDir = new THREE.Vector3()
        state.camera.getWorldDirection(camDir)
        camDir.y = 0
        camDir.normalize()
        const dot = dirToComputer.dot(camDir)
        if (dot > 0.8) {
          unlockAchievement('zoom-zoom')
        }
      }
    }

    // ─── Camera Setup (1st Person) ───
    if (headRef.current) {
        headRef.current.getWorldPosition(headPosition)
        state.camera.position.copy(headPosition)
      state.camera.position.y += FIRST_PERSON_HEAD_Y_OFFSET
        // Offset forward slightly to avoid seeing the inside of the face
        const viewDir = new THREE.Vector3()
        state.camera.getWorldDirection(viewDir)
        state.camera.position.addScaledVector(viewDir, 0.0)
    } else {
        state.camera.position.set(translation.x, translation.y + 0.35, translation.z)
    }

    // ─── Movement Calculation ───
    frontVector.set(0, 0, Number(backward) - Number(forward))
    sideVector.set(Number(left) - Number(right), 0, 0)

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(state.camera.rotation)

    // Apply movement
    rigidBody.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)

    // ─── Jumping & Ground Check ───
    const rayOrigin = { x: translation.x, y: translation.y + 0.05, z: translation.z }
    const rayDir = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    const hit = world.castRay(ray, 0.75, true, undefined, undefined, undefined, rigidBody.current as any)
    const isGrounded = hit !== null && hit.timeOfImpact <= 0.55

    if (jump && isGrounded) {
      rigidBody.current.setLinvel({ x: velocity.x, y: 7, z: velocity.z }, true)
    }

    // ─── Animation & Rotation Logic ───
    const horizVelocity = Math.hypot(velocity.x, velocity.z)
    const isMoving = horizVelocity > 0.1 

    let nextAnimation: PlayerAnimation = 'Man_Idle'
    if (!isGrounded) {
      nextAnimation = isMoving ? 'Man_RunningJump' : 'Man_Jump'
    } else if (isMoving) {
      nextAnimation = horizVelocity > SPEED * 1.2 ? 'Man_Run' : 'Man_Walk'
    } else {
      nextAnimation = 'Man_Idle'
    }

    // Always rotate character to face the camera direction (horizontal only)
    const camDir = new THREE.Vector3()
    state.camera.getWorldDirection(camDir)
    const angle = Math.atan2(camDir.x, camDir.z)
    setRotationY(angle)

    if (nextAnimation !== animation) {
      setAnimation(nextAnimation)
    }

    handleFootsteps(isMoving, isGrounded)

    // Void Reset
    if (translation.y < -10) {
      rigidBody.current.setTranslation({ x: 2, y: 1, z: -2 }, true)
      rigidBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  // Keyboard events for actions like Punch or SwordSlash
  useEffect(() => {
    const handleMouseDown = () => {
      if (!isBlocked) {
        setAnimation('Man_Punch') // Default click action
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [isBlocked])

  return (
    <>
      {!isBlocked && <PointerLockControls ref={pointerControlsRef} />}
      <RigidBody
        ref={rigidBody}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[2, 1, -2]}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider args={[0.16, 0.20]} />
        <PlayerModel 
          animation={animation} 
          rotationY={rotationY} 
          position={[0, 0, 0]} 
          scale={0.085}
          headRef={headRef}
          isSelf={true}
        />
      </RigidBody>
    </>
  )
}
