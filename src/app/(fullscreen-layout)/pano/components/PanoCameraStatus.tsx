import { getRotationFrom } from '@/app/(fullscreen-layout)/pano/components/PanoControls/utils'
import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useState } from 'react'

import type { PerspectiveCamera } from 'three'

export function PanoCameraStatus() {
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const [cameraState, setCameraState] = useState({ h: 0, v: 0, fov: 90 })

  useFrame(() => {
    const { h, v } = getRotationFrom(camera)
    const { fov } = camera
    setCameraState({
      h,
      v,
      fov,
    })
  })

  return (
    <Html
      style={{
        width: '150px',
        position: 'absolute',
        top: '16px',
        left: '16px',
      }}
    >
      <DefaultHeaderShim />
      <div
        style={{
          padding: '8px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          borderRadius: '6px',
        }}
      >
        <div>h: {Math.round(cameraState.h)}</div>
        <div>v: {Math.round(cameraState.v)}</div>
        <div>fov: {Math.round(cameraState.fov)}</div>
      </div>
    </Html>
  )
}
