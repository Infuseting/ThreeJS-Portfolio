'use client'

import React from 'react'
import { RigidBody } from '@react-three/rapier'
import { GLTFModel } from '@/components/3d/models/GLTFModel'
import { Door } from '@/components/3d/scene/Door'
import { Furniture } from '@/components/3d/scene/Furniture'
import { Computer } from '@/components/ui/Computer'

export function Apartment() {
    return (
        <>
            <RigidBody type="fixed" colliders="trimesh">
                <GLTFModel
                    url="/model/element/Appart.glb"
                    receiveShadow
                    castShadow
                />
            </RigidBody>
            
            {/* Doors */}
            <Door url="/model/element/doorway.glb" width={0.48} height={1} depth={0.02} position={[5, -0.50, -2.70]} rotation={[0, - Math.PI / 2, 0]} withFrame={false} openAngle={-110}/>
            <Door url="/model/element/doorway.glb" width={0.48} height={1} depth={0.02} position={[6, -0.50, -2.70]} rotation={[0, - Math.PI / 2, 0]} withFrame={false} openAngle={110}/>
            <Door url="/model/element/doorway.glb" width={0.48} height={1} depth={0.02} position={[6, -0.50, -3.70]} rotation={[0, - Math.PI / 2, 0]} withFrame={false} openAngle={110} lock={true}/>
            <Door url="/model/element/doorway.glb" width={0.48} height={1} depth={0.02} position={[5.30, -0.50, 0]} rotation={[0, 0, 0]} withFrame={false} openAngle={110} lock={true}/>


            {/* Bedroom */}
            
            <Furniture url="/model/element/desk.glb" position={[0.3, 0, -2.6]} />
            <Furniture url="/model/element/computerScreen.glb" rotation={[0, 0, 0]} position={[0.6, 0.40, -2.8]}></Furniture>
            <Furniture url="/model/element/computerMouse.glb" rotation={[0, 0, 0]} position={[0.95, 0.4, -2.6]}></Furniture>
            <Furniture url="/model/element/computerKeyboard.glb" rotation={[0, 0, 0]} position={[0.6, 0.4, -2.6]}></Furniture>
            <Furniture url="/model/element/plantSmall1.glb" position={[0.35, 0.4, -2.85]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/chairDesk.glb" rotation={[0, Math.PI * 5 / 8, 0]} position={[0.8, 0.06, -2.3]}></Furniture>

            <Furniture url="/model/element/bedDouble.glb" position={[3, 0, -1.2]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/cabinetBedDrawerTable.glb" position={[3.3, 0, -0.3]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/cabinetBedDrawerTable.glb" position={[2.0, 0, -0.3]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/bookcaseOpen.glb" position={[1.5, 0, -2.6]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/books.glb" position={[1.7, 0.61, -2.70]} rotation={[0, 0, 0]} />

            <Furniture url="/model/element/bookcaseClosedWide.glb" position={[4.5, 0, -0.3]} rotation={[0, Math.PI, 0]} />
        </>
    )
}
