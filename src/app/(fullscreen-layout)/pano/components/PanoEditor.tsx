import { formatView } from '@/components/PanoControls/utils'

import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Spherical, Vector3 } from 'three'

import type { PerspectiveCamera } from 'three'

export function PanoEditor() {
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const domElement = useThree((state) => state.gl.domElement)

  useEffect(() => {
    const onDoubleClick = (e: MouseEvent) => {
      e.preventDefault()
      const rect = domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = (-(e.clientY - rect.top) / rect.height) * 2 + 1
      const worldV3 = new Vector3(x, y, -1).unproject(camera)
      const spherical = new Spherical()
      spherical.setFromVector3(worldV3)
      const config = formatView({
        x,
        y,
        h: Math.round((spherical.theta / Math.PI) * 180),
        v: Math.round((spherical.phi / Math.PI) * 180),
      })
      console.log(config)
    }

    domElement.addEventListener('contextmenu', onDoubleClick)
    return () => {
      domElement.removeEventListener('contextmenu', onDoubleClick)
    }
  }, [camera, domElement])

  return <></>
}
