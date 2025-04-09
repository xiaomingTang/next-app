import { usePanoStore } from '../store'

import { formatView } from '@F/pano/components/PanoControls/utils'
import { STYLE } from '@/config'
import { copyToClipboard } from '@/utils/copyToClipboard'

import { Menu, MenuItem } from '@mui/material'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { Spherical, Vector3 } from 'three'

import type { PerspectiveCamera } from 'three'

export function screen2View({
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
    h: (spherical.theta / Math.PI) * 180,
    v: (spherical.phi / Math.PI) * 180,
    fov: camera.fov,
  })
}

export function PanoEditorContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
  } | null>(null)
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const domElement = useThree((state) => state.gl.domElement)
  const pano = usePanoStore((state) => state.pano)

  const curView = useMemo(() => {
    // 此处只是为了将 contextMenu 设为依赖
    if (contextMenu && !contextMenu) {
      throw new Error('never')
    }
    const view = screen2View({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      camera,
      canvas: domElement,
    })
    return {
      h: Math.round(view.h * 10) / 10,
      v: Math.round(view.v * 10) / 10,
      fov: Math.round(view.fov * 10) / 10,
    }
  }, [camera, domElement, contextMenu])

  const mouseView = useMemo(() => {
    if (!contextMenu) {
      return null
    }
    const view = screen2View({
      x: contextMenu.mouseX,
      y: contextMenu.mouseY,
      camera,
      canvas: domElement,
    })
    return {
      h: Math.round(view.h),
      v: Math.round(view.v),
      fov: Math.round(view.fov),
    }
  }, [camera, contextMenu, domElement])

  const handleClose = () => setContextMenu(null)

  const geneCopyThenClose = (text: string) => () => {
    void copyToClipboard(text)
    handleClose()
  }

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
    <Html zIndexRange={[STYLE.zIndex.canvasHtml, 0]}>
      <Menu
        open={!!contextMenu}
        onClose={handleClose}
        anchorReference='anchorPosition'
        transformOrigin={{
          horizontal: 'center',
          vertical: 'center',
        }}
        anchorPosition={{
          top: contextMenu?.mouseY ?? 0,
          left: contextMenu?.mouseX ?? 0,
        }}
      >
        <MenuItem
          onClick={geneCopyThenClose(
            `"h": ${curView.h},\n"v": ${curView.v},\n"fov": ${curView.fov}`
          )}
        >
          复制【相机】信息
        </MenuItem>
        <MenuItem onClick={geneCopyThenClose(JSON.stringify(pano, null, 2))}>
          复制【全场景】信息
        </MenuItem>

        <MenuItem
          onClick={geneCopyThenClose(
            `"h": ${mouseView?.h},\n"v": ${mouseView?.v}`
          )}
        >
          复制【鼠标】信息
        </MenuItem>
      </Menu>
    </Html>
  )
}
