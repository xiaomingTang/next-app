'use client'

import { PanoCameraStatus } from './PanoCameraStatus'
import { PanoEditor } from './PanoEditor'
import { PanoScene } from './PanoScene'

import { Canvas } from '@react-three/fiber'

const EDIT_MODE = true

export function Pano() {
  return (
    <Canvas
      linear
      camera={{
        position: [0, 0, 0],
      }}
    >
      <PanoScene />
      {EDIT_MODE && (
        <>
          <PanoCameraStatus />
          <PanoEditor />
        </>
      )}
    </Canvas>
  )
}
