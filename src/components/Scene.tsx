'use client'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Bedroom } from '@/components/Bedroom'
import { Player } from '@/components/Player'
import { Sky, Environment } from '@react-three/drei'

export default function Scene() {
  return (
    <Canvas shadows camera={{ fov: 45 }}>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={1.5} />
      <pointLight castShadow intensity={2} position={[10, 10, 10]} />
      <Environment preset="apartment" />
      
      <Physics gravity={[0, -30, 0]}>
        <Bedroom />
        <Player />
      </Physics>
    </Canvas>
  )
}
