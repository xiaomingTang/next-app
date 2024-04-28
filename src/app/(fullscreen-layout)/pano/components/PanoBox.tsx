import { Sphere, useTexture } from '@react-three/drei'
import { BackSide, MeshBasicMaterial } from 'three'
import { useSpringValue } from '@react-spring/three'
import { useEffect, useMemo } from 'react'

import type { SphereGeometry } from 'three'
import type { ShapeProps } from '@react-three/drei'

interface PanoBoxProps
  extends Omit<
    ShapeProps<typeof SphereGeometry>,
    'args' | 'scale' | 'material'
  > {
  src: string
  isActive: boolean
  radius?: number
}

export function PanoBox({ src, isActive, radius = 1, ...props }: PanoBoxProps) {
  const tex = useTexture(src)
  const mat = useMemo(
    () =>
      new MeshBasicMaterial({
        map: tex,
        side: BackSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [tex]
  )
  const opacity = useSpringValue(0, {
    config: {
      duration: 300,
    },
  })

  useEffect(() => {
    void opacity.start(isActive ? 1 : 0, {
      onChange: () => {
        mat.opacity = opacity.get()
        mat.needsUpdate = true
      },
    })
  }, [isActive, mat, opacity])

  return (
    <Sphere
      args={[1, 128, 128]}
      scale={[-radius, radius, radius]}
      material={mat}
      {...props}
    />
  )
}
