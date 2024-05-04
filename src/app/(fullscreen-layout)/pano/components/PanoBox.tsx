import { Sphere, useTexture } from '@react-three/drei'
import { BackSide, MeshBasicMaterial } from 'three'
import { useEffect, useMemo } from 'react'
import { useEventCallback } from '@mui/material'
import { noop } from 'lodash-es'

import type { SphereGeometry } from 'three'
import type { ShapeProps } from '@react-three/drei'

interface PanoBoxProps
  extends Omit<
    ShapeProps<typeof SphereGeometry>,
    'args' | 'scale' | 'material'
  > {
  src: string
  radius?: number
  onLoad?: () => void
}

export function PanoBox({
  src,
  radius = 1,
  onLoad = noop,
  ...props
}: PanoBoxProps) {
  const tex = useTexture(src)
  const mat = useMemo(
    () =>
      new MeshBasicMaterial({
        map: tex,
        side: BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [tex]
  )
  const memoedOnLoad = useEventCallback(onLoad)

  useEffect(() => {
    memoedOnLoad()
  }, [memoedOnLoad])

  return (
    <Sphere
      key={`${radius}-${src}`}
      args={[1, 128, 128]}
      scale={[-radius, radius, radius]}
      material={mat}
      {...props}
    />
  )
}
