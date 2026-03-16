'use client'

import * as THREE from 'three'
import { useRef, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useComputerFocus, useComputerFocusActions } from '@/components/stores/ComputerFocusStore'
import { useComputerPower, useComputerPowerActions } from '@/components/stores/ComputerPowerStore'
import { useInteractable } from '@/hooks/3d/useInteractable'
import { unlockAchievement } from '@/components/stores/AchievementStore'
import { WindowsXPDesktop } from '@/components/ui/WindowsXPDesktop'
import { Furniture } from '@/components/3d/scene/Furniture'

/* ── Virtual screen resolution ── */
const SCREEN_W = 1200
const SCREEN_H = 900
const BASE_DF = 0.635
const BASE_W = 380  
const SCREEN_DISTANCE_FACTOR = BASE_DF * (BASE_W / SCREEN_W)

interface ComputerProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  interactionId?: string
  interactionLabel?: string
  cameraDistance?: number
}

function PowerButton({ position }: { position: [number, number, number] }) {
  const { status } = useComputerPower()
  const { turnOn, turnOff, forceOff } = useComputerPowerActions()

  const handleTogglePower = () => {
    if (status === 'OFF') turnOn()
    else if (status === 'ON') turnOff()
  }

  const handleForceOff = () => {
    if (status !== 'OFF') {
      forceOff()
      unlockAchievement('force-shutdown')
    }
  }

  const { interactiveRef, isHighlighted } = useInteractable({
    position,
    interactionId: 'pc-power-button',
    interactionLabel: status === 'OFF' ? 'Allumer le PC' : 'Éteindre le PC',
    onInteract: handleTogglePower,
    onHoldComplete: handleForceOff,
    holdThreshold: 2.0,
  })

  const buttonEmissive = status === 'ON' || status === 'BOOTING' ? '#00ff00' : '#ff0000'
  const buttonEmissiveIntensity = status === 'OFF' ? 0.3 : 0.8
  const highlightIntensity = isHighlighted ? 0.3 : 0

  return (
    <group position={position} ref={interactiveRef as React.Ref<THREE.Group>}>
      <mesh>
        <circleGeometry args={[0.015, 16]} />
        <meshStandardMaterial 
          color={buttonEmissive} 
          emissive={buttonEmissive} 
          emissiveIntensity={buttonEmissiveIntensity + highlightIntensity} 
        />
      </mesh>
      {/* Hitbox */}
      <mesh visible={false}>
          <boxGeometry args={[0.08, 0.08, 0.05]} />
          <meshBasicMaterial color="red" wireframe />
      </mesh>
    </group>
  )
}

/**
 * A 3D computer interaction group using GLB models.
 * Replaces separate Furniture imports so the power button, screen UI,
 * and interactions work natively together.
 */
export function Computer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  interactionId,
  interactionLabel = 'Utiliser l\'ordinateur',
  cameraDistance = 0.5,
}: ComputerProps) {
  const screenMeshRef = useRef<THREE.Group>(null)

  /* ── Power state (for screen glow) ── */
  const { status: powerStatus } = useComputerPower()
  const screenOn = powerStatus === 'ON' || powerStatus === 'BOOTING' || powerStatus === 'SHUTTING_DOWN'

  /* ── Focus state ── */
  const focusState = useComputerFocus()
  const { enter } = useComputerFocusActions()
  const isFocused = focusState.focused

  /* ── Camera ── */
  // Removed unused `const { camera } = useThree()`

  const getCameraFocusPoints = useCallback(() => {
    // Fallback when screen group isn't ready
    if (!screenMeshRef.current) {
      return {
        camPos: [position[0], position[1] + 0.25, position[2] + cameraDistance] as [number, number, number],
        camTarget: [position[0], position[1] + 0.25, position[2]] as [number, number, number],
      }
    }
    // Compute bounding box of the visual screen (prefer first child mesh)
    const box = new THREE.Box3()
    try {
      const targetObj = screenMeshRef.current.children && screenMeshRef.current.children.length
        ? screenMeshRef.current.children[0]
        : (screenMeshRef.current as unknown as THREE.Object3D)
      box.setFromObject(targetObj)
    } catch {
      const fallback = new THREE.Vector3()
      screenMeshRef.current.getWorldPosition(fallback)
      return {
        camPos: [fallback.x, fallback.y + 0.25, fallback.z + cameraDistance] as [number, number, number],
        camTarget: [fallback.x, fallback.y + 0.05, fallback.z] as [number, number, number],
      }
    }

    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    // Determine forward (screen normal) from the target object
    const forward = new THREE.Vector3(0, 0, 1)
    const forwardSource = screenMeshRef.current.children && screenMeshRef.current.children.length
      ? (screenMeshRef.current.children[0] as THREE.Object3D)
      : screenMeshRef.current
    forwardSource.getWorldDirection(forward)

    // Place the camera in front of the exact center of the screen
    const ZOOM_FACTOR = 1 // 30% closer
    const camPosVec = center.clone().add(forward.clone().multiplyScalar(cameraDistance * ZOOM_FACTOR))

    return {
      camPos: [camPosVec.x, camPosVec.y, camPosVec.z] as [number, number, number],
      camTarget: [center.x, center.y, center.z] as [number, number, number],
    }
  }, [position, cameraDistance])

  /* ── Interaction via shared hook ── */
  const handleInteract = useCallback(() => {
    if (isFocused) return
    const { camPos, camTarget } = getCameraFocusPoints()
    enter(camPos, camTarget)
    document.exitPointerLock?.()
    unlockAchievement('first-boot')
  }, [isFocused, getCameraFocusPoints, enter])

  const { interactiveRef } = useInteractable({
    position,
    interactionId,
    interactionLabel,
    onInteract: handleInteract,
  })

  /* ── Camera lerp when focused ── */
  useFrame((state) => {
    if (isFocused && focusState.cameraPosition) {
      const tp = new THREE.Vector3(...focusState.cameraPosition)
      const tt = new THREE.Vector3(...focusState.cameraTarget)
      // keep camera up vector upright to avoid roll
      state.camera.up.set(0, 1, 0)
      state.camera.position.lerp(tp, 0.08)
      state.camera.lookAt(tt)
    }
  })

  return (
    <group position={position} rotation={rotation}>
      <group ref={interactiveRef}>
        
        {/* Screen / Monitor acts as the root of the interaction (flat procedural screen) */}
        <group ref={screenMeshRef} position={[0.15, 0.05, -0.05]} scale={[0.75, 0.75, 0.75]}>
          <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
            <boxGeometry args={[0.62, 0.44, 0.05]} />
            <meshStandardMaterial color="#222" metalness={0.2} roughness={0.6} />
          </mesh>

          {/* Screen panel (slightly inset) */}
          <mesh castShadow receiveShadow position={[0, 0.12, 0.028]}> 
            <planeGeometry args={[0.56, 0.36]} />
            <meshStandardMaterial
              color={screenOn ? '#0b1220' : '#000000'}
              emissive={screenOn ? '#86b8ff' : '#000000'}
              emissiveIntensity={screenOn ? 0.12 : 0}
            />
          </mesh>

          {/* Power button remains relative to the bezel */}
          <PowerButton position={[0.02, 0.36, 0.03]} />

          {/* HTML overlay + small occluder in front of the panel */}
          <group position={[0, 0.12, 0.03]}>
            {/* Depth-only occluder already ensures proper occlusion for Html */}
            <ScreenOverlay isFocused={isFocused} />
            <ScreenGlow on={screenOn} />
          </group>
        </group>

        {/* Keyboard and Mouse relative to the screen */}
        <group position={[0, 0, 0.2]}>
           <Furniture url="/model/element/computerKeyboard.glb" />
        </group>
        <group position={[0.35, 0, 0.2]}>
           <Furniture url="/model/element/computerMouse.glb" />
        </group>

      </group>
    </group>
  )
}

/* ── Screen Html overlay (extracted for SRP) ── */

function ScreenOverlay({ isFocused }: { isFocused: boolean }) {
  return (
    <Html
      transform
      occlude
      position={[0, 0, 0]}
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        pointerEvents: isFocused ? 'auto' : 'none',
        cursor: 'none',
        overflow: 'hidden',
      }}
      distanceFactor={SCREEN_DISTANCE_FACTOR}
      zIndexRange={[1, 0]}
    >
      {isFocused && <style>{`*, *::before, *::after { cursor: none !important; }`}</style>}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => { e.stopPropagation(); e.preventDefault() }}
        style={{ cursor: 'none' }}
      >
        <WindowsXPDesktop width={SCREEN_W} height={SCREEN_H} active={isFocused} />
      </div>
    </Html>
  )
}

/* ── Screen glow component (proper SpotLight with target) ── */

function ScreenGlow({ on }: { on: boolean }) {
  const lightRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  return (
    <>
      <spotLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={on ? 1.5 : 0}
        angle={Math.PI / 3}
        penumbra={0.8}
        distance={10}
        color="#aaccff"
        castShadow
      />
      {/* Target placed in front of the screen (+Z = forward from monitor) */}
      <object3D ref={targetRef} position={[0, 0, 0.2]} />
    </>
  )
}



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
      {children}
    </group>
  )
}