import { useLyricsEditor, useLyricsEditorAudio } from './store'

import { useElementSize } from '@/hooks/useElementSize'
import { STYLE } from '@/config'

import { useEffect, useRef, useState } from 'react'
import { alpha, Box, colors, styled, useTheme } from '@mui/material'
import { clamp, noop } from 'lodash-es'

const IndicatorContainer = styled(Box)({
  position: 'absolute',
  width: '15px',
  height: '100%',
  left: '-7.5px',
  cursor: 'ew-resize',
  backgroundColor: 'transparent',
  [`&:hover`]: {
    backgroundColor: alpha(colors.red[500], 0.2),
  },
})

const IndicatorInner = styled(Box)({
  width: '1px',
  margin: 'auto',
  height: '100%',
  backgroundColor: colors.red[500],
})

export function Timeline() {
  const theme = useTheme()
  const duration = useLyricsEditorAudio((s) => s.state.duration)
  const curTime = useLyricsEditorAudio((s) => s.state.time)
  const { lrcItems } = useLyricsEditor()
  const [scalar, setScalar] = useState(1)
  // 偏移 px
  const [offset, setOffset] = useState(0)
  const [size, _, setElem] = useElementSize()
  const [action, setAction] = useState<'drag' | 'scale' | null>(null)
  const [isSettingTime, setIsSettingTime] = useState(false)
  const [tempTime, setTempTime] = useState(0)
  const lastXForDragRef = useRef(0)
  const lastXForTimeRef = useRef(0)

  // ui 左右拖动
  useEffect(() => {
    if (action !== 'drag') {
      return noop
    }
    const onMouseUp = () => {
      setAction(null)
    }
    const onMouseMove = (e: MouseEvent) => {
      const movementX = e.screenX - lastXForDragRef.current
      lastXForDragRef.current = e.screenX
      setOffset((prev) =>
        clamp(prev + movementX, -size.width * (scalar - 1), 0)
      )
    }
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [action, scalar, size.width])

  // 拖拽进度条(onMouseUp)
  useEffect(() => {
    if (!isSettingTime) {
      return noop
    }
    const onMouseUp = () => {
      useLyricsEditorAudio.getState().controls.seek(tempTime)
      setIsSettingTime(false)
    }
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isSettingTime, tempTime])

  // 拖拽进度条(onMouseMove)
  useEffect(() => {
    if (!isSettingTime) {
      return noop
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isSettingTime) {
        return
      }
      const duration = useLyricsEditorAudio.getState().state.duration
      const movementX = e.screenX - lastXForTimeRef.current
      lastXForTimeRef.current = e.screenX
      setTempTime((prev) => {
        const delta = (movementX / size.width / scalar) * duration
        return clamp(prev + delta, 0, duration)
      })
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [isSettingTime, scalar, size.width])

  if (duration <= 0 || lrcItems.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: STYLE.width.desktop,
          height: '30%',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: STYLE.width.desktop,
        height: '30%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onMouseDown={(e) => {
        setAction('drag')
        lastXForDragRef.current = e.screenX
      }}
      onWheel={(e) => {
        if (e.shiftKey) {
          setOffset((prev) =>
            clamp(
              prev - e.deltaX * scalar * 0.02,
              -size.width * (scalar - 1),
              0
            )
          )
          return
        }
        const prevScalar = scalar
        const newScalar = clamp(prevScalar - e.deltaY / 1000, 1, 10)
        setScalar(newScalar)
        if (newScalar !== prevScalar) {
          const left = (e.currentTarget as HTMLElement).getBoundingClientRect()
            .x
          setOffset((prevOffset) => {
            const x = e.clientX - left
            const x0 = (x - prevOffset) / prevScalar
            return clamp(
              prevOffset + x0 * (prevScalar - newScalar),
              -size.width * (newScalar - 1),
              0
            )
          })
        }
      }}
    >
      <Box
        ref={setElem}
        sx={{
          position: 'relative',
          width: '100%',
          height: '50px',
          flexBasis: '50px',
          flexShrink: 0,
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: theme.palette.grey[400],
          overflowX: 'hidden',
        }}
      >
        {lrcItems.map((item, idx) => {
          const nextItem = lrcItems[idx + 1]
          const endTime = nextItem ? nextItem.time : duration
          const rawWidth = (size.width * (endTime - item.time)) / duration
          return (
            <Box
              key={[item.type, item.time, item.value, idx].join('-')}
              sx={{
                position: 'absolute',
                height: '100%',
                borderLeft: '1px solid',
                borderRight: '1px solid',
                borderColor: theme.palette.grey[400],
              }}
              style={{
                width: rawWidth * scalar,
                left: (item.time / duration) * size.width * scalar + offset,
              }}
            />
          )
        })}
      </Box>
      <Box
        component='canvas'
        sx={{
          width: '100%',
          height: '0%',
          flexGrow: 1,
        }}
      />
      <IndicatorContainer
        style={{
          transform: `translateX(${((isSettingTime ? tempTime : curTime) / duration) * size.width * scalar + offset}px)`,
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          lastXForTimeRef.current = e.screenX
          setTempTime(curTime)
          setIsSettingTime(true)
        }}
      >
        <IndicatorInner />
      </IndicatorContainer>
    </Box>
  )
}
