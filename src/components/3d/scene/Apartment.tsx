'use client'

import React from 'react'
import { RigidBody } from '@react-three/rapier'
import { GLTFModel } from '@/components/3d/models/GLTFModel'

/**
 * Apartment component that loads the 'apparts.glb' model.
 * It uses a RigidBody with 'trimesh' colliders for accurate 3D physics.
 */
export function Apartment() {
    return (
        <RigidBody type="fixed" colliders="trimesh">
            <GLTFModel
                url="/model/element/apparts.glb"
                receiveShadow
                castShadow
            />
        </RigidBody>
    )
}
