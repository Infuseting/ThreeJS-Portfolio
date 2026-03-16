'use client'

import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useInteractionStore } from '@/components/stores/InteractionStore'

const INTERACT_DISTANCE = 1
const raycaster = new THREE.Raycaster()
const center = new THREE.Vector2(0, 0) // screen centre

// Set raycaster max distance so it never picks up distant objects
raycaster.far = INTERACT_DISTANCE

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
  const prevId = { current: '' }

  useFrame(() => {
    raycaster.setFromCamera(center, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    for (const hit of intersects) {
      // Skip drei <Html occlude> internal meshes (they use a custom material
      // with colorWrite=false or are tagged by drei)
      const mat = (hit.object as THREE.Mesh).material as THREE.Material | undefined
      if (mat && (mat as any).colorWrite === false) continue

      // Walk up the parent chain — the userData may be on a parent group
      let obj: THREE.Object3D | null = hit.object
      while (obj) {
        if (obj.userData?.interactive) {
          const id = obj.userData.interactionId as string
          store.set({
            id,
            label: obj.userData.interactionLabel as string,
            key: obj.userData.interactionKey as string ?? 'E',
          })
          prevId.current = id
          return
        }
        obj = obj.parent
      }

      // We hit a real (non-occlude) object that is NOT interactive →
      // the crosshair is blocked by something non-interactive, so clear.
      store.set(null)
      prevId.current = ''
      return
    }

    // Nothing hit at all (sky / void) → clear
    store.set(null)
    prevId.current = ''
  })

  return null
}
