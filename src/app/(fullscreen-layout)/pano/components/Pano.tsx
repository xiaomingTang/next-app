'use client'

import { PanoEditor } from './PanoEditor'
import { PanoScene } from './PanoScene'

import { Canvas } from '@react-three/fiber'

export function PanoIndex() {
  return (
    <Canvas
      linear
      camera={{
        position: [0, 0, 0],
      }}
    >
      <PanoScene />
      <PanoEditor />
    </Canvas>
  )
}
