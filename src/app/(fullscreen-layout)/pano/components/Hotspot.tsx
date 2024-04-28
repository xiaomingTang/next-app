import { usePanoStore } from './store'
import { screen2View } from './PanoEditor'

import { ImageWithState } from '@/components/ImageWithState'
import { cat } from '@/errors/catchAndToast'

import { ButtonBase, Stack, Typography, useTheme } from '@mui/material'
import { Html } from '@react-three/drei'
import { useGesture } from '@use-gesture/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ExactClickChecker } from '@zimi/utils'
import { useThree } from '@react-three/fiber'

import type { Pano } from './pano-config'
import type { PerspectiveCamera } from 'three'

const iconMap: Record<Pano.Hotspot['type'], string> = {
  POSITION: '/static/pano/preset/hotspot-position.png',
  DECORATION: '/static/pano/preset/hotspot-decoration.png',
}

export function Hotspot({
  hotspot,
  editable,
}: {
  hotspot: Pano.Hotspot
  editable?: boolean
}) {
  const [camera, canvas] = useThree(
    (state) => [state.camera as PerspectiveCamera, state.gl.domElement] as const
  )
  const theme = useTheme()
  const { curPos, curDec, enabledDecs } = usePanoStore()
  const y = Math.cos((hotspot.v / 180) * Math.PI)
  const x = Math.sin((hotspot.h / 180) * Math.PI)
  const z = Math.cos((hotspot.h / 180) * Math.PI)
  const [isDragging, setIsDragging] = useState(false)
  const timerRef = useRef(-1)
  const clickChecker = useMemo(() => new ExactClickChecker(), [])

  useEffect(() => clickChecker.bindEvents(), [clickChecker])

  const bind = useGesture({
    onDragStart() {
      timerRef.current = window.setTimeout(() => {
        setIsDragging(true)
      }, 300)
    },
    onDrag(state) {
      if (!isDragging) {
        return
      }
      const { h, v } = screen2View({
        x: state.xy[0],
        y: state.xy[1],
        camera,
        canvas,
      })
      usePanoStore.setState((pano) => {
        const newPos = pano.pano.positions.find(
          (item) => item.name === curPos.name
        )
        if (!newPos) {
          return
        }
        const tar = newPos.hotspots.find((item) => item.name === hotspot.name)
        if (!tar) {
          return
        }
        tar.h = Math.round(h * 10) / 10
        tar.v = Math.round(v * 10) / 10
      })
      usePanoStore.setCurPos(curPos.name)
    },
    onDragEnd() {
      window.clearTimeout(timerRef.current)
      setIsDragging(false)
    },
  })

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current)
    },
    []
  )

  return (
    <Html
      transform
      sprite
      distanceFactor={1}
      position={[x, y, z]}
      style={{
        userSelect: 'none',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <Stack
        direction='column'
        alignItems='center'
        {...(editable ? bind() : {})}
        onPointerUp={cat(() => {
          if (!clickChecker.checkIsClick()) {
            return
          }
          if (hotspot.type === 'POSITION') {
            usePanoStore.setCurPos(hotspot.target)
            return
          }
          if (hotspot.type === 'DECORATION') {
            if (curDec?.name === hotspot.target) {
              usePanoStore.setCurDec(null)
            } else {
              usePanoStore.setCurDec(hotspot.target)
            }
          }
        })}
        sx={{
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          pointerEvents: 'auto',
          opacity: isDragging ? 0.75 : 1,
          [`&:hover`]: {
            backgroundColor: 'rgba(0,0,0,0.15)',
            [`& p`]: {
              backgroundColor: 'transparent',
            },
          },
          [`&:active`]: {
            backgroundColor: 'rgba(0,0,0,0.1)',
            [`& p`]: {
              backgroundColor: 'transparent',
            },
          },
        }}
      >
        <ImageWithState
          src={iconMap[hotspot.type]}
          width={65}
          height={65}
          style={{ width: '65px', height: '65px', pointerEvents: 'none' }}
        />
        <Typography
          sx={{
            width: '100%',
            py: '4px',
            borderRadius: '4px',
            pointerEvents: 'none',
            fontSize: '14px',
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        >
          {hotspot.name}
        </Typography>
      </Stack>
      {hotspot.type === 'DECORATION' && hotspot.target === curDec?.name && (
        <Stack
          direction='row'
          spacing={1}
          useFlexGap
          flexWrap='wrap'
          justifyContent='center'
          alignItems='center'
          sx={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            width: '24em',
            transform: 'translate(-50%,100%)',
            pointerEvents: 'none',
          }}
        >
          {curDec.patterns.map((pat) => {
            const bg = pat.color ?? 'gray'
            const fg = theme.palette.getContrastText(bg)
            const isActive = enabledDecs[curDec.name] === pat.name
            return (
              <ButtonBase
                key={`${curDec.name}-${pat.name}`}
                sx={{
                  width: '4em',
                  height: '4em',
                  borderRadius: '4px',
                  backgroundColor: bg,
                  color: fg,
                  outline: isActive ? `1px solid ${fg}` : undefined,
                  pointerEvents: 'auto',
                }}
                onClick={() => {
                  usePanoStore.setState((state) => {
                    const decName = curDec.name
                    if (state.enabledDecs[decName] === pat.name) {
                      delete state.enabledDecs[decName]
                    } else {
                      state.enabledDecs[decName] = pat.name
                    }
                  })
                }}
              >
                <Typography
                  sx={{
                    fontSize: '12px',
                  }}
                >
                  {pat.name}
                </Typography>
              </ButtonBase>
            )
          })}
        </Stack>
      )}
    </Html>
  )
}
