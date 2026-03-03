'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useInteractionStore } from '@/components/InteractionStore'

const INTERACT_DISTANCE = 3
const raycaster = new THREE.Raycaster()
const center = new THREE.Vector2(0, 0) // screen centre

/**
 * Invisible component that, every frame, casts a ray from the camera
 * centre and checks if it hits a mesh whose `userData.interactive` is set.
 *
 * To make a mesh interactive, set on it:
 *   mesh.userData = {
 *     interactive: true,
 *     interactionId: 'some-unique-id',
 *     interactionLabel: 'Ouvrir la porte',
 *     interactionKey: 'E',
 *   }
 */
export function InteractionRaycaster() {
  const { scene, camera } = useThree()
  const store = useInteractionStore()

  useFrame(() => {
    raycaster.setFromCamera(center, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    for (const hit of intersects) {
      if (hit.distance > INTERACT_DISTANCE) break

      // Walk up the parent chain — the userData may be on a parent group
      let obj: THREE.Object3D | null = hit.object
      while (obj) {
        if (obj.userData?.interactive) {
          store.set({
            id: obj.userData.interactionId as string,
            label: obj.userData.interactionLabel as string,
            key: obj.userData.interactionKey as string ?? 'E',
          })
          return
        }
        obj = obj.parent
      }
    }

    // Nothing interactive under the crosshair
    store.set(null)
  })

  return null
}
