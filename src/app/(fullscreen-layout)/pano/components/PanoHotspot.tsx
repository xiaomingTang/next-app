import { usePanoStore } from './store'
import { screen2View } from './PanoEditor'

import { ImageWithState } from '@/components/ImageWithState'
import { cat } from '@/errors/catchAndToast'
import { useLoading } from '@/hooks/useLoading'

import {
  Box,
  ButtonBase,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { Html } from '@react-three/drei'
import { useGesture } from '@use-gesture/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ExactClickChecker } from '@zimi/utils'
import { useThree } from '@react-three/fiber'
import { TextureLoader, type PerspectiveCamera } from 'three'

import type { Pano } from './type'

const iconMap: Record<Pano.Hotspot['type'], string> = {
  POSITION: '/static/pano/preset/hotspot-position.png',
  DECORATION: '/static/pano/preset/hotspot-decoration.png',
}

export function PanoHotspot({
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
  const r = 12
  const y = r * Math.cos((hotspot.v / 180) * Math.PI)
  const mr = r * Math.sin((hotspot.v / 180) * Math.PI)
  const x = mr * Math.sin((hotspot.h / 180) * Math.PI)
  const z = mr * Math.cos((hotspot.h / 180) * Math.PI)
  const [isDragging, setIsDragging] = useState(false)
  const timerRef = useRef(-1)
  const clickChecker = useMemo(() => new ExactClickChecker(), [])
  const [loading, withLoading] = useLoading()

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
      void usePanoStore.setCurPos(curPos.name)
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
      zIndexRange={[899, 0]}
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
        onPointerUp={cat(
          withLoading(async () => {
            if (!clickChecker.checkIsClick()) {
              return
            }
            if (loading) {
              return
            }
            if (hotspot.type === 'POSITION') {
              await usePanoStore.setCurPos(hotspot.target)
              return
            }
            if (hotspot.type === 'DECORATION') {
              if (curDec?.name === hotspot.target) {
                usePanoStore.setCurDec(null)
              } else {
                usePanoStore.setCurDec(hotspot.target)
              }
            }
          })
        )}
        sx={{
          position: 'relative',
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
          width={64}
          height={64}
          style={{ width: '64px', height: '64px', pointerEvents: 'none' }}
        />
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              top: '32px',
              left: '32px',
              transform: 'translate(-50%,-50%)',
            }}
          >
            <CircularProgress size='24px' />
          </Box>
        )}
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
                onClick={cat(
                  withLoading(async () => {
                    if (loading) {
                      return
                    }
                    const decName = curDec.name
                    const nextEnabledDecs = { ...enabledDecs }
                    if (nextEnabledDecs[decName] === pat.name) {
                      delete nextEnabledDecs[decName]
                    } else {
                      await new TextureLoader().loadAsync(pat.standard)
                      nextEnabledDecs[decName] = pat.name
                    }
                    usePanoStore.setState({
                      enabledDecs: nextEnabledDecs,
                    })
                  })
                )}
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
