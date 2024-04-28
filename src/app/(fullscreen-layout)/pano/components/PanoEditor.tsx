import { formatView } from '@/components/PanoControls/utils'

import { Menu, MenuItem } from '@mui/material'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'
import { Spherical, Vector3 } from 'three'

import type { PerspectiveCamera } from 'three'

function screen2View({
  x: rx,
  y: ry,
  canvas,
  camera,
}: {
  x: number
  y: number
  canvas: HTMLElement
  camera: PerspectiveCamera
}) {
  const rect = canvas.getBoundingClientRect()
  const x = ((rx - rect.left) / rect.width) * 2 - 1
  const y = (-(ry - rect.top) / rect.height) * 2 + 1
  const worldV3 = new Vector3(x, y, -1).unproject(camera)
  const spherical = new Spherical().setFromVector3(worldV3)
  return formatView({
    h: Math.round((spherical.theta / Math.PI) * 180),
    v: Math.round((spherical.phi / Math.PI) * 180),
    fov: Math.round(camera.fov),
  })
}

export function PanoEditor() {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
  } | null>(null)
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const domElement = useThree((state) => state.gl.domElement)

  const curView = useMemo(() => {
    // 此处只是为了将 contextMenu 设为依赖
    if (contextMenu && !contextMenu) {
      throw new Error('never')
    }
    return screen2View({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      camera,
      canvas: domElement,
    })
  }, [camera, domElement, contextMenu])

  const mouseView = useMemo(() => {
    if (!contextMenu) {
      return null
    }
    return screen2View({
      x: contextMenu.mouseX,
      y: contextMenu.mouseY,
      camera,
      canvas: domElement,
    })
  }, [camera, contextMenu, domElement])

  const handleClose = () => setContextMenu(null)

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      setContextMenu({
        mouseX: e.clientX,
        mouseY: e.clientY,
      })
    }

    domElement.addEventListener('contextmenu', onContextMenu)
    return () => {
      domElement.removeEventListener('contextmenu', onContextMenu)
    }
  }, [camera, domElement])

  return (
    <Html>
      <Menu
        open={!!contextMenu}
        onClose={handleClose}
        anchorReference='anchorPosition'
        transformOrigin={{
          horizontal: 'center',
          vertical: 'center',
        }}
        anchorPosition={{
          top: (contextMenu?.mouseY ?? 0) - 18,
          left: contextMenu?.mouseX ?? 0,
        }}
      >
        <CopyToClipboard
          text={`"h": ${curView.h},\n"v": ${curView.v},\n"fov": ${curView.fov}`}
          onCopy={() => toast.success('复制成功')}
        >
          <MenuItem onClick={handleClose}>复制【相机】信息</MenuItem>
        </CopyToClipboard>

        <CopyToClipboard
          text={`"h": ${mouseView?.h},\n"v": ${mouseView?.v},\n"fov": ${mouseView?.fov}`}
          onCopy={() => toast.success('复制成功')}
        >
          <MenuItem onClick={handleClose}>复制【鼠标】信息</MenuItem>
        </CopyToClipboard>
      </Menu>
    </Html>
  )
}
