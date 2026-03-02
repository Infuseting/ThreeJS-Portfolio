'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { World } from '@/components/World'
import { Player } from '@/components/Player'
import { Sky } from '@react-three/drei'

export default function Scene() {
  return (
    <Canvas shadows camera={{ fov: 45 }}>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={1.5} />
      <pointLight castShadow intensity={2} position={[100, 100, 100]} />
      
      <Physics gravity={[0, -30, 0]}>
        <World />
        <Player />
      </Physics>
    </Canvas>
  )
}
