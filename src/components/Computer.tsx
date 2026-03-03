'use client'

import * as THREE from 'three'
import { useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useComputerFocus, useComputerFocusActions } from '@/components/ComputerFocusStore'
import { useInteractable } from '@/hooks/useInteractable'
import { WindowsXPDesktop } from '@/components/WindowsXPDesktop'
import {
  Desk3D,
  Tower3D,
  Monitor3D,
  Keyboard3D,
  Mouse3D,
  getHighlightProps,
} from '@/components/computer/ComputerParts'

/* ── Virtual screen resolution ── */
const SCREEN_W = 1200
const SCREEN_H = 900
const BASE_DF = 0.635
const BASE_W = 400
const SCREEN_DISTANCE_FACTOR = BASE_DF * (BASE_W / SCREEN_W)

/* ── Dimension constants ── */
const DESK_W = 1.4
const DESK_D = 0.7
const DESK_H = 0.75
const LEG_R = 0.04
const MONITOR_W = 0.62
const MONITOR_H = 0.46
const BEZEL_W = MONITOR_W + 0.08
const BEZEL_H = MONITOR_H + 0.08

interface ComputerProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  interactionId?: string
  interactionLabel?: string
  cameraDistance?: number
}

/**
 * A 3D computer with desk, tower and monitor.
 * When the player presses E while looking at it, the camera focuses on the
 * screen and a Windows XP desktop is rendered via `<Html>`.
 */
export function Computer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  interactionId,
  interactionLabel = 'Utiliser l\'ordinateur',
  cameraDistance = 0.72,
}: ComputerProps) {
  const screenGroupRef = useRef<THREE.Group>(null)
  const screenMeshRef = useRef<THREE.Mesh>(null)

  /* ── Focus state ── */
  const focusState = useComputerFocus()
  const { enter } = useComputerFocusActions()
  const isFocused = focusState.focused

  /* ── Camera ── */
  const { camera } = useThree()

  const getCameraFocusPoints = useCallback(() => {
    if (!screenMeshRef.current) {
      return {
        camPos: [position[0], position[1] + 1.3, position[2] + cameraDistance] as [number, number, number],
        camTarget: [position[0], position[1] + 1.3, position[2]] as [number, number, number],
      }
    }
    const screenWorld = new THREE.Vector3()
    screenMeshRef.current.getWorldPosition(screenWorld)

    const forward = new THREE.Vector3(0, 0, 1)
    screenMeshRef.current.getWorldDirection(forward)

    return {
      camPos: [
        screenWorld.x + forward.x * cameraDistance,
        screenWorld.y,
        screenWorld.z + forward.z * cameraDistance,
      ] as [number, number, number],
      camTarget: [screenWorld.x, screenWorld.y, screenWorld.z] as [number, number, number],
    }
  }, [position, cameraDistance])

  /* ── Interaction via shared hook ── */
  const handleInteract = useCallback(() => {
    if (isFocused) return
    const { camPos, camTarget } = getCameraFocusPoints()
    enter(camPos, camTarget)
    document.exitPointerLock?.()
  }, [isFocused, getCameraFocusPoints, enter])

  const { interactiveRef, isHighlighted } = useInteractable({
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
      state.camera.position.lerp(tp, 0.08)
      state.camera.lookAt(tt)
    }
  })

  const highlight = getHighlightProps(isHighlighted)
  const monitorY = DESK_H + 0.025 + BEZEL_H / 2 + 0.12

  return (
    <group position={position} rotation={rotation}>
      <group ref={interactiveRef}>
        <Desk3D width={DESK_W} depth={DESK_D} height={DESK_H} legRadius={LEG_R} highlight={highlight} />
        <Tower3D position={[DESK_W / 2 - 0.2, 0.25, 0]} highlight={highlight} />

        <Monitor3D
          screenGroupRef={screenGroupRef}
          screenMeshRef={screenMeshRef}
          position={[0, monitorY, -DESK_D / 2 + 0.14]}
          monitorW={MONITOR_W}
          monitorH={MONITOR_H}
          bezelW={BEZEL_W}
          bezelH={BEZEL_H}
          highlight={highlight}
        >
          <ScreenOverlay isFocused={isFocused} />
        </Monitor3D>

        <Keyboard3D position={[0, DESK_H + 0.035, 0.08]} size={[0.4, 0.015, 0.15]} highlight={highlight} />
        <Mouse3D position={[0.28, DESK_H + 0.03, 0.08]} size={[0.06, 0.02, 0.1]} highlight={highlight} />
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
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => { e.stopPropagation(); e.preventDefault() }}
      >
        <WindowsXPDesktop width={SCREEN_W} height={SCREEN_H} active={isFocused} />
      </div>
    </Html>
  )
}
