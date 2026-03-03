'use client'

import * as THREE from 'three'
import { useRef, useCallback, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, Html } from '@react-three/drei'
import { useInteractionTarget } from '@/components/InteractionStore'
import { useComputerFocus, useComputerFocusActions } from '@/components/ComputerFocusStore'
import { WindowsXPDesktop } from '@/components/WindowsXPDesktop'

const INTERACT_DISTANCE = 3

/* ── Virtual screen resolution ──
   Change these two values to adjust the XP desktop resolution.
   The distanceFactor is auto-computed so it always fits the 3D monitor. */
const SCREEN_W = 1200
const SCREEN_H = 900
/** Base distanceFactor calibrated for a 400×300 Html element */
const BASE_DF = 0.635
const BASE_W = 400
const SCREEN_DISTANCE_FACTOR = BASE_DF * (BASE_W / SCREEN_W)

interface ComputerProps {
  /** Position of the computer desk group */
  position?: [number, number, number]
  /** Y rotation of the whole setup */
  rotation?: [number, number, number]
  /** Unique interaction id */
  interactionId?: string
  /** Label shown on HUD */
  interactionLabel?: string
  /** Camera offset when focused: how far in front of the screen */
  cameraDistance?: number
}

/**
 * A 3D computer with desk, tower and monitor.
 * When the player presses E while looking at it, the camera focuses on the
 * screen and a Windows XP desktop is rendered via `<Html>`.
 * Pressing Escape exits back to normal FPS controls.
 */
export function Computer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  interactionId,
  interactionLabel = 'Utiliser l\'ordinateur',
  cameraDistance = 0.72,
}: ComputerProps) {
  /* ── Refs ── */
  const screenGroupRef = useRef<THREE.Group>(null)
  const interactiveRef = useRef<THREE.Group>(null)
  const screenMeshRef = useRef<THREE.Mesh>(null)

  /* ── Stable id ── */
  const idRef = useRef(interactionId ?? `computer-${Math.random().toString(36).slice(2, 9)}`)
  const id = idRef.current

  /* ── Interaction highlight ── */
  const target = useInteractionTarget()
  const isHighlighted = target?.id === id

  /* ── Focus state ── */
  const focusState = useComputerFocus()
  const { enter, exit } = useComputerFocusActions()
  const isFocused = focusState.focused

  /* ── Keyboard ── */
  const [, get] = useKeyboardControls()
  const prevInteract = useRef(false)

  /* ── Camera lerp targets ── */
  const { camera } = useThree()

  // Compute world‑space camera position & target for the focus view
  const getCameraFocusPoints = useCallback((): {
    camPos: [number, number, number]
    camTarget: [number, number, number]
  } => {
    if (!screenMeshRef.current) {
      return {
        camPos: [position[0], position[1] + 1.3, position[2] + cameraDistance],
        camTarget: [position[0], position[1] + 1.3, position[2]],
      }
    }
    // Get world position of the screen centre
    const screenWorld = new THREE.Vector3()
    screenMeshRef.current.getWorldPosition(screenWorld)

    // Get the screen's world forward direction (local +Z)
    const forward = new THREE.Vector3(0, 0, 1)
    screenMeshRef.current.getWorldDirection(forward)

    const camPos: [number, number, number] = [
      screenWorld.x + forward.x * cameraDistance,
      screenWorld.y,
      screenWorld.z + forward.z * cameraDistance,
    ]
    const camTarget: [number, number, number] = [
      screenWorld.x,
      screenWorld.y,
      screenWorld.z,
    ]
    return { camPos, camTarget }
  }, [position, cameraDistance])

  /* ── Register interactive userData ── */
  const interactiveRefCb = useCallback(
    (node: THREE.Group | null) => {
      (interactiveRef as MutableRefObject<THREE.Group | null>).current = node
      if (!node) return
      node.userData = {
        interactive: true,
        interactionId: id,
        interactionLabel: interactionLabel,
        interactionKey: 'E',
      }
    },
    [id, interactionLabel],
  )
  // Keep in sync on re‑renders
  if (interactiveRef.current) {
    interactiveRef.current.userData = {
      interactive: true,
      interactionId: id,
      interactionLabel: interactionLabel,
      interactionKey: 'E',
    }
  }

  /* ── Per‑frame logic ── */
  useFrame((state) => {
    const { interact } = get() as { interact: boolean }

    // Enter focus
    if (interact && !prevInteract.current && !isFocused) {
      const dist = state.camera.position.distanceTo(new THREE.Vector3(...position))
      if (dist < INTERACT_DISTANCE && target?.id === id) {
        const { camPos, camTarget } = getCameraFocusPoints()
        enter(camPos, camTarget)

        // Release pointer lock from FPS controls;
        // the XP desktop will re-acquire it on its own container after a short delay
        document.exitPointerLock?.()
      }
    }
    prevInteract.current = interact

    // Camera lerp when focused
    if (isFocused && focusState.cameraPosition) {
      const tp = new THREE.Vector3(...focusState.cameraPosition)
      const tt = new THREE.Vector3(...focusState.cameraTarget)
      state.camera.position.lerp(tp, 0.08)
      state.camera.lookAt(tt)
    }
  })

  /* ── Dimensions ── */
  const deskW = 1.4
  const deskD = 0.7
  const deskH = 0.75
  const legR = 0.04
  const monitorW = 0.62
  const monitorH = 0.46
  const monitorD = 0.05
  const bezelW = monitorW + 0.08
  const bezelH = monitorH + 0.08

  /* Distance factor is auto-computed from SCREEN_W at the top of the file. */

  const highlightEmissive = isHighlighted ? '#ffffff' : '#000000'
  const highlightIntensity = isHighlighted ? 0.12 : 0

  return (
    <group position={position} rotation={rotation}>
      <group ref={interactiveRefCb}>
        {/* ── Desk ── */}
        <mesh castShadow receiveShadow position={[0, deskH, 0]}>
          <boxGeometry args={[deskW, 0.05, deskD]} />
          <meshStandardMaterial color="#B08050" emissive={highlightEmissive} emissiveIntensity={highlightIntensity} />
        </mesh>
        {/* Legs */}
        {[
          [-deskW / 2 + 0.06, deskH / 2, -deskD / 2 + 0.06],
          [deskW / 2 - 0.06, deskH / 2, -deskD / 2 + 0.06],
          [-deskW / 2 + 0.06, deskH / 2, deskD / 2 - 0.06],
          [deskW / 2 - 0.06, deskH / 2, deskD / 2 - 0.06],
        ].map((pos, i) => (
          <mesh key={i} castShadow position={pos as [number, number, number]}>
            <cylinderGeometry args={[legR, legR, deskH, 8]} />
            <meshStandardMaterial color="#666" emissive={highlightEmissive} emissiveIntensity={highlightIntensity} />
          </mesh>
        ))}

        {/* ── Tower (on floor, under desk) ── */}
        <mesh castShadow receiveShadow position={[deskW / 2 - 0.2, 0.25, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.45]} />
          <meshStandardMaterial color="#d0d0d0" emissive={highlightEmissive} emissiveIntensity={highlightIntensity} />
        </mesh>
        {/* Power LED */}
        <mesh position={[deskW / 2 - 0.1, 0.35, 0.226]}>
          <circleGeometry args={[0.015, 16]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
        </mesh>

        {/* ── Monitor ── */}
        <group ref={screenGroupRef} position={[0, deskH + 0.025 + bezelH / 2 + 0.12, -deskD / 2 + 0.14]}>
          {/* Bezel */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[bezelW, bezelH, 0.04]} />
            <meshStandardMaterial color="#222" emissive={highlightEmissive} emissiveIntensity={highlightIntensity} />
          </mesh>

          {/* Screen surface (slightly in front of bezel) */}
          <mesh ref={screenMeshRef} position={[0, 0, 0.021]}>
            <planeGeometry args={[monitorW, monitorH]} />
            <meshStandardMaterial color="#000" emissive="#112244" emissiveIntensity={0.3} />
          </mesh>

          {/* Html overlay — always rendered so the screen stays visible from outside */}
          <Html
            transform
            occlude
            position={[0, 0, 0.022]}
            style={{
              width: SCREEN_W,
              height: SCREEN_H,
              pointerEvents: isFocused ? 'auto' : 'none',
              cursor: isFocused ? 'none' : 'default',
              overflow: 'hidden',
            }}
            distanceFactor={SCREEN_DISTANCE_FACTOR}
            zIndexRange={[1, 0]}
          >
            {/* Stop all mouse events from bubbling to the Canvas / PointerLockControls */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => { e.stopPropagation(); e.preventDefault() }}
            >
              <WindowsXPDesktop
                width={SCREEN_W}
                height={SCREEN_H}
                active={isFocused}
              />
            </div>
          </Html>

          {/* Monitor stand */}
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

        {/* ── Keyboard ── */}
        <mesh castShadow receiveShadow position={[0, deskH + 0.035, 0.08]}>
          <boxGeometry args={[0.4, 0.015, 0.15]} />
          <meshStandardMaterial color="#333" emissive={highlightEmissive} emissiveIntensity={highlightIntensity} />
        </mesh>

        {/* ── Mouse ── */}
        <mesh castShadow receiveShadow position={[0.28, deskH + 0.03, 0.08]}>
          <boxGeometry args={[0.06, 0.02, 0.1]} />
          <meshStandardMaterial color="#333" emissive={highlightEmissive} emissiveIntensity={highlightIntensity} />
        </mesh>
      </group>
    </group>
  )
}
