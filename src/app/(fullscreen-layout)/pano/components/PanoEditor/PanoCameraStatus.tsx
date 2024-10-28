import { usePanoStore } from '../store'

import { getRotationFrom } from '@F/pano/components/PanoControls/utils'
import Anchor from '@/components/Anchor'
import { STYLE } from '@/config'
import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import { Button, Typography } from '@mui/material'
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
      h: Math.round(h * 10) / 10,
      v: Math.round(v * 10) / 10,
      fov: Math.round(fov * 10) / 10,
    })
  })

  return (
    <Html
      zIndexRange={[STYLE.zIndex.canvasHtml, 0]}
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
        <div>h: {cameraState.h}</div>
        <div>v: {cameraState.v}</div>
        <div>fov: {cameraState.fov}</div>
        <Button
          variant='contained'
          size='small'
          sx={{ width: '100%', mt: 1 }}
          onClick={() => {
            usePanoStore.setState((state) => {
              const curPos = state.pano.positions.find(
                (pos) => pos.name === state.curPos.name
              )
              if (!curPos) {
                return
              }
              curPos.view.h = cameraState.h
              curPos.view.v = cameraState.v
              curPos.view.fov = cameraState.fov
            })
          }}
        >
          设为初始视角
        </Button>
        <Typography
          sx={{
            mt: 1,
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          图源：
          <Anchor
            href='https://www.funmodifiedcar.cn/'
            underline
            title='深圳灵墨视界科技有限公司'
            bold={false}
            style={{
              color: 'inherit',
            }}
          >
            灵墨视界
          </Anchor>
        </Typography>
      </div>
    </Html>
  )
}
