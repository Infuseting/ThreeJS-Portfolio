'use client'

import React from 'react'
import { RigidBody } from '@react-three/rapier'
import { GLTFModel } from '@/components/3d/models/GLTFModel'
import { Door } from '@/components/3d/scene/Door'
import { Furniture } from '@/components/3d/scene/Furniture'
import { Computer } from '@/components/ui/Computer'
import { LightSwitch } from '@/components/3d/lighting/LightSwitch'

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
            <Door url="/model/element/doorway.glb" width={0.49} height={1} depth={0.02} position={[5, -0.50, -2.71]} rotation={[0, - Math.PI / 2, 0]} withFrame={false} openAngle={-110}/>
            <Door url="/model/element/doorway.glb" width={0.49} height={1} depth={0.02} position={[6, -0.50, -2.71]} rotation={[0, - Math.PI / 2, 0]} withFrame={false} openAngle={110}/>
            <Door url="/model/element/doorway.glb" width={0.49} height={1} depth={0.02} position={[6, -0.50, -3.71]} rotation={[0, - Math.PI / 2, 0]} withFrame={false} openAngle={110} lock={true}/>
            <Door url="/model/element/doorway.glb" width={0.49} height={1} depth={0.02} position={[5.29, -0.50, 0]} rotation={[0, 0, 0]} withFrame={false} openAngle={110} lock={true}/>


            {/* Bedroom */}
            
            <Furniture url="/model/element/desk.glb" position={[0.3, 0, -2.6]} />
            
            {/* Grouped interactive computer combining screen, keyboard, mouse, and HTML desktop */}
            <Computer position={[0.6, 0.40, -2.8]} />

            <Furniture url="/model/element/plantSmall1.glb" position={[0.35, 0.4, -2.85]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/chairDesk.glb" rotation={[0, Math.PI * 5 / 8, 0]} position={[0.8, 0.06, -2.3]}></Furniture>

            <Furniture url="/model/element/bedDouble.glb" position={[3, 0, -1.2]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/cabinetBedDrawerTable.glb" position={[3.3, 0, -0.3]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/cabinetBedDrawerTable.glb" position={[2.0, 0, -0.3]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/bookcaseOpen.glb" position={[1.5, 0, -2.6]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/books.glb" position={[1.7, 0.61, -2.70]} rotation={[0, 0, 0]} />

            <Furniture url="/model/element/bookcaseClosedWide.glb" position={[4.5, 0, -0.3]} rotation={[0, Math.PI, 0]} />


            {/* Living Room */}
            <Furniture url="/model/element/loungeSofaLong.glb" position={[1.25, 0, -4.75]} rotation={[0, Math.PI, 0]} scale={1.25}/>
            <Furniture url="/model/element/tableGlass.glb" position={[0.30, 0, -5.50]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/cabinetTelevision.glb" position={[0.20, 0.0, -6.75]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/televisionModern.glb" position={[0.60, 0.3, -6.85]} rotation={[0, 0, 0]} />

            <Furniture url="/model/element/tableRound.glb" position={[2.30, 0.30, -4.25]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/chairCushion.glb" position={[2.40, 0.0, -4.55]} rotation={[0, Math.PI * 2 / 4, 0]} />
            <Furniture url="/model/element/chairCushion.glb" position={[2.90, 0.0, -4.75]} rotation={[0, - Math.PI * 2 / 4, 0]} />
            
            <Furniture url="/model/element/chairCushion.glb" position={[2.55, 0.0, -5]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/chairCushion.glb" position={[2.75, 0.0, -4.35]} rotation={[0, Math.PI, 0]} />
            
            <Furniture url="/model/element/kitchenFridge.glb" position={[5.45, 0.0, -4.30]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/kitchenCabinet.glb" position={[5.95, 0.0, -4.46]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/kitchenCabinet.glb" position={[5.88, 0.0, -4.46]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/kitchenCabinet.glb" position={[5.50, 0.0, -4.85]} rotation={[0, - Math.PI / 2, 0]} />
            <Furniture url="/model/element/kitchenCabinet.glb" position={[5.50, 0.0, -4.46 ]} rotation={[0, - Math.PI / 2, 0]} />
            <Furniture url="/model/element/kitchenStove.glb" position={[5.50, 0.0, -5.27]} rotation={[0, - Math.PI / 2, 0]} />
            <Furniture url="/model/element/kitchenSink.glb" position={[5.50, 0.0, -5.70]} rotation={[0, - Math.PI / 2, 0]} />
            <Furniture url="/model/element/kitchenCabinet.glb" position={[5.50, 0.0, -6.12]} rotation={[0, - Math.PI / 2, 0]} />
            <Furniture url="/model/element/kitchenCabinet.glb" position={[5.50, 0.0, -5.66]} rotation={[0,  0 , 0]} />
            <Furniture url="/model/element/kitchenCabinet.glb" position={[5.10, 0.0, -5.66]} rotation={[0,  0 , 0]} />

            <Furniture url="/model/element/kitchenCoffeeMachine.glb" position={[5.2, 0.42, -5.68]} rotation={[0,  0 , 0]} />
            <Furniture url="/model/element/toaster.glb" position={[5.8, 0.42, -4.65]} rotation={[0,  - Math.PI / 2 , 0]} />
            <Furniture url="/model/element/trashcan.glb" position={[4.8, 0.05, -6.8]} rotation={[0, - Math.PI * 2 / 8 , 0]} />

            {/* Bath Room */}
            <Furniture url="/model/element/showerRound.glb" position={[6.61, 0.0, -0.63]} rotation={[0, Math.PI, 0]} />
            <Furniture url="/model/element/bathroomSinkSquare.glb" position={[6.90, -0.1, -2.44]} rotation={[0, 0, 0]} />
            <Furniture url="/model/element/toilet.Glb" position={[7.95, 0.1, -1]} rotation={[0, - Math.PI / 2, 0]} />

            {/* Others */}
            <Furniture url="/model/element/rugSquare.glb" position={[5.05, 0.05, 0]} rotation={[0,0,0]} />

            <Furniture
                url="/model/element/lampSquareCeiling.glb"
                position={[1.5, 1.03, -1.5]}
                rotation={[0, 0, 0]}
                lightChannel="chambre"
                lightOffset={[0, -0.15, 0]}
                lightType="point"
                lightShowFixture={false}
                lightColor="#ffdca8"
                lightIntensity={2}
            />
            <Furniture
                url="/model/element/lampSquareCeiling.glb"
                position={[3.5, 1.03, -1.5]}
                rotation={[0, 0, 0]}
                lightChannel="chambre"
                lightOffset={[0, -0.15, 0]}
                lightType="point"
                lightShowFixture={false}
                lightColor="#ffdca8"
                lightIntensity={2}
            />

            <LightSwitch
                channels={["chambre"]}
                position={[4.945, 0.5, -2.0]}
                rotation={[0, - Math.PI/ 2, 0]}
                scale={[0.25, 0.25, 0.25]}
            />

            <Furniture
                url="/model/element/lampSquareCeiling.glb"
                position={[5.45, 1.03, -1.5]}
                rotation={[0, 0, 0]}
                lightChannel="entree"
                lightOffset={[0, -0.15, 0]}
                lightType="point"
                lightShowFixture={false}
                lightColor="#ffdca8"
                lightIntensity={2}
            />

            <LightSwitch
                channels={["entree"]}
                position={[5.003, 0.5, -2.0]}
                rotation={[0, Math.PI/ 2, 0]}
                scale={[0.25, 0.25, 0.25]}
            />
            <LightSwitch
                channels={["entree"]}
                position={[5.1, 0.5, -0.005]}
                rotation={[0, Math.PI, 0]}
                scale={[0.25, 0.25, 0.25]}
            />

            <Furniture
                url="/model/element/lampSquareCeiling.glb"
                position={[1.5, 1.03, -5]}
                rotation={[0, 0, 0]}
                lightChannel="living"
                lightOffset={[0, -0.15, 0]}
                lightType="point"
                lightShowFixture={false}
                lightColor="#ffdca8"
                lightIntensity={2}
            />
            <Furniture
                url="/model/element/lampSquareCeiling.glb"
                position={[3.5, 1.03, -5]}
                rotation={[0, 0, 0]}
                lightChannel="living"
                lightOffset={[0, -0.15, 0]}
                lightType="point"
                lightShowFixture={false}
                lightColor="#ffdca8"
                lightIntensity={2}
            />

            <LightSwitch
                channels={["living"]}
                position={[4.945, 0.5, -3.005]}
                rotation={[0, Math.PI, 0]}
                scale={[0.25, 0.25, 0.25]}
            />

            <Furniture
                url="/model/element/lampSquareCeiling.glb"
                position={[7, 1.03, -1.5]}
                rotation={[0, 0, 0]}
                lightChannel="entree"
                lightOffset={[0, -0.15, 0]}
                lightType="point"
                lightShowFixture={false}
                lightColor="#ffdca8"
                lightIntensity={2}
            />

            <LightSwitch
                channels={["entree"]}
                position={[6.055, 0.5, -2.0]}
                rotation={[0, Math.PI/ 2, 0]}
                scale={[0.25, 0.25, 0.25]}
            />
            

            
        </>
    )
}
