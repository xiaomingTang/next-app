import { EPS, PI_2, getRotationFrom, updateCamera } from './utils'

import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { MouseFormatter, TouchFormatter } from '@zimi/interact'
import { clamp } from 'lodash-es'
import { useEventCallback } from '@mui/material'

import type { PerspectiveCamera } from 'three'
import type { InteractEvents } from '@zimi/interact'

interface ChangeEvents {
  zoom: {
    /**
     * in degrees, EPS ~ (180 - EPS)
     */
    fov: number
  }
  rotate: {
    /**
     * in degrees, 0 ~ 360
     */
    h: number
    /**
     * in degrees, EPS ~ (180 - EPS)
     */
    v: number
  }
}

type OnZoom = (
  nextState: ChangeEvents['zoom'],
  prevState: ChangeEvents['zoom']
) => ChangeEvents['zoom']

type OnRotate = (
  nextState: ChangeEvents['rotate'],
  prevState: ChangeEvents['rotate']
) => ChangeEvents['rotate']

function useFormatter({
  formatter,
  onZoom,
  onRotate,
}: {
  formatter: MouseFormatter | TouchFormatter
  onZoom: OnZoom
  onRotate: OnRotate
}) {
  const canvasSize = useThree((state) => state.size)
  const element = useThree((state) => state.gl.domElement)
  const camera = useThree((state) => state.camera as PerspectiveCamera)

  useEffect(() => {
    formatter.attach(element)

    const onScale = (e: InteractEvents['scale'][0]) => {
      const newState = onZoom(
        {
          fov: clamp(camera.fov / e.ratio, EPS, 180 - EPS),
        },
        {
          fov: camera.fov,
        }
      )
      updateCamera(camera, newState)
    }

    const onMove = (e: InteractEvents['move'][0]) => {
      const prevState = getRotationFrom(camera)
      const ratio = ((camera.fov / 180) * Math.PI) / canvasSize.height
      const newState = onRotate(
        {
          h: (((prevState.h + e.x * ratio) % PI_2) + PI_2) % PI_2,
          v: clamp(prevState.v - e.y * ratio, EPS, Math.PI - EPS),
        },
        prevState
      )
      updateCamera(camera, newState)
    }

    formatter.addListener('scale', onScale)
    formatter.addListener('move', onMove)

    return () => {
      formatter.detach()
      formatter.removeListener('scale', onScale)
      formatter.removeListener('move', onMove)
    }
  }, [
    formatter,
    camera,
    element,
    canvasSize.width,
    canvasSize.height,
    onZoom,
    onRotate,
  ])
}

function defaultOnRotate(state: ChangeEvents['rotate']) {
  return state
}

function defaultOnZoom(state: ChangeEvents['zoom']) {
  return {
    ...state,
    fov: clamp(state.fov, 30, 150),
  }
}

export interface PanoControlsProps {
  onZoom?: OnZoom
  onRotate?: OnRotate
  initialState?: {
    /**
     * in degrees, 0 ~ 360
     */
    h?: number
    /**
     * in degrees, EPS ~ (180 - EPS)
     */
    v?: number
    /**
     * in degrees, EPS ~ (180 - EPS)
     */
    fov?: number
  }
}

/**
 * 你需要自行将相机的位置移动到全景的正中心
 */
export function PanoControls({
  onZoom = defaultOnZoom,
  onRotate = defaultOnRotate,
  initialState,
}: PanoControlsProps) {
  const camera = useThree((state) => state.camera as PerspectiveCamera)
  const touchFormatter = useMemo(
    () =>
      new TouchFormatter({
        enableRotate: false,
      }),
    []
  )
  const mouseFormatter = useMemo(
    () =>
      new MouseFormatter({
        enableRotate: false,
        disabledWhenFiresTouchEvents: true,
      }),
    []
  )
  const memoedOnZoom = useEventCallback(onZoom)
  const memoedOnRotate = useEventCallback(onRotate)

  useEffect(() => {
    updateCamera(camera, {
      h: initialState?.h ?? 0,
      v: initialState?.v ?? Math.PI / 2,
      fov: initialState?.fov ?? 60,
    })
  }, [camera, initialState?.h, initialState?.v, initialState?.fov])

  useFormatter({
    formatter: touchFormatter,
    onZoom: memoedOnZoom,
    onRotate: memoedOnRotate,
  })
  useFormatter({
    formatter: mouseFormatter,
    onZoom: memoedOnZoom,
    onRotate: memoedOnRotate,
  })

  return <></>
}
