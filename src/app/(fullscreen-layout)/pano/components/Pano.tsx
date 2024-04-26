'use client'

import { PanoControls } from '@/components/PanoControls'

import { Canvas } from '@react-three/fiber'
import { CubeCamera, Sphere, useTexture } from '@react-three/drei'
import { CubeReflectionMapping, DoubleSide } from 'three'
import { clamp } from 'lodash-es'

function SceneBox({ src, radius = 1 }: { src: string; radius?: number }) {
  const env = useTexture(src, (t) => {
    t.mapping = CubeReflectionMapping
    t.needsUpdate = true
  })

  return (
    <CubeCamera envMap={env}>
      {(texture) => (
        <Sphere args={[1, 128, 128]} scale={[-radius, radius, radius]}>
          <meshBasicMaterial
            map={texture}
            side={DoubleSide}
            toneMapped={false}
          />
        </Sphere>
      )}
    </CubeCamera>
  )
}

export function Pano() {
  return (
    <Canvas
      linear
      onCreated={({ camera }) => {
        camera.position.set(0, 0, 0)
        camera.updateProjectionMatrix()
      }}
    >
      <SceneBox radius={1.1} src='/static/images/car-thumb.jpg' />
      <SceneBox src='/static/images/car-4k.jpg' />
      <PanoControls
        initialState={{
          h: (-86 / 180) * Math.PI,
          v: (113 / 180) * Math.PI,
        }}
        onRotate={(nextState, prevState) => {
          const deltaH = nextState.h - prevState.h
          const deltaV = nextState.v - prevState.v
          return {
            ...nextState,
            h: prevState.h + 2 * deltaH,
            v: prevState.v + 1.5 * deltaV,
          }
        }}
        onZoom={(state) => ({
          ...state,
          fov: clamp(state.fov, 30, 120),
        })}
      />
    </Canvas>
  )
}
