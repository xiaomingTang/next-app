import { useLyricsEditor, useLyricsEditorAudio } from './store'

import { LyricItem } from '../Lyrics'

import { useElementSize } from '@/hooks/useElementSize'
import { STYLE } from '@/config'
import { useListen } from '@/hooks/useListen'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

import { useEffect, useRef, useState } from 'react'
import {
  alpha,
  Box,
  colors,
  styled,
  useEventCallback,
  useTheme,
} from '@mui/material'
import { clamp, noop } from 'lodash-es'
import useSWR from 'swr'

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

function TimeSlice({
  curItem: item,
  nextItem,
  duration,
  index,
  containerWidth,
  scalar,
  offset,
}: {
  curItem: LyricItem
  nextItem?: LyricItem
  duration: number
  index: number
  containerWidth: number
  scalar: number
  offset: number
}) {
  const endTime = nextItem?.time ?? duration
  const rawWidth = (containerWidth * (endTime - item.time)) / duration
  const [isDragging, setIsDragging] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  const lastXRef = useRef(0)
  const onDragEndRef = useEventCallback((x: number) => {
    // 2 个
    const GAP = 0.5
    const deltaTime = (x / (containerWidth * scalar)) * duration
    if (deltaTime === 0) {
      return
    }
    const ft = (t: number) => {
      return clamp(t, 0, duration)
    }
    if (deltaTime < 0) {
      useLyricsEditor.setState((prev) => {
        const newItems = [...prev.lrcItems]
        let tempItem = new LyricItem({
          type: item.type,
          value: item.value,
          time: ft(item.time + deltaTime),
        })
        newItems[index] = tempItem
        for (let i = index - 1; i > 0; i -= 1) {
          const curItem = newItems[i]
          if (curItem.time > tempItem.time - GAP) {
            newItems[i] = new LyricItem({
              type: curItem.type,
              value: curItem.value,
              time: ft(tempItem.time - GAP),
            })
            tempItem = newItems[i]
          } else {
            break
          }
        }
        return {
          ...prev,
          lrcItems: newItems,
        }
      })
      return
    }
    useLyricsEditor.setState((prev) => {
      const newItems = [...prev.lrcItems]
      let tempItem = new LyricItem({
        type: item.type,
        value: item.value,
        time: ft(item.time + deltaTime),
      })
      newItems[index] = tempItem
      for (let i = index + 1; i < newItems.length - 1; i += 1) {
        const curItem = newItems[i]
        if (curItem.time < tempItem.time + GAP) {
          newItems[i] = new LyricItem({
            type: curItem.type,
            value: curItem.value,
            time: ft(tempItem.time + GAP),
          })
          tempItem = newItems[i]
        } else {
          break
        }
      }
      return {
        ...prev,
        lrcItems: newItems,
      }
    })
  })

  // 拖拽
  useEffect(() => {
    if (!isDragging) {
      return noop
    }
    const onMouseMove = (e: MouseEvent) => {
      const movementX = e.clientX - lastXRef.current
      lastXRef.current = e.clientX
      setTranslateX((prev) => prev + movementX)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [isDragging])

  // 释放鼠标
  useEffect(() => {
    const onMouseUp = () => {
      if (isDragging) {
        onDragEndRef(translateX)
        setIsDragging(false)
        setTranslateX(0)
      }
    }
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, onDragEndRef, translateX])

  return (
    <Box
      key={[item.type, item.time, item.value, index].join('-')}
      sx={{
        position: 'absolute',
        height: '100%',
        borderLeft: '1px solid',
        borderRight: '1px solid',
        borderColor: colors.grey[400],
      }}
      style={{
        width: rawWidth * scalar,
        left: (item.time / duration) * containerWidth * scalar + offset,
      }}
      onDoubleClick={() => {
        useLyricsEditorAudio.getState().controls.seek(item.time)
      }}
    >
      <IndicatorContainer
        sx={{
          zIndex: isDragging ? 1 : 0,
          width: '15px',
          left: '-8px',
          [`&:hover`]: {
            backgroundColor: alpha(colors.blue[500], 0.2),
            [`& > .indicator-inner`]: {
              backgroundColor: colors.blue[500],
            },
          },
        }}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setIsDragging(true)
          lastXRef.current = e.clientX
        }}
      >
        <IndicatorInner
          className='indicator-inner'
          sx={{ backgroundColor: 'transparent' }}
        />
      </IndicatorContainer>
    </Box>
  )
}

function getChannelData(f: File, channel = 0) {
  return new Promise<Float32Array>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)()
      void audioContext.decodeAudioData(
        reader.result as ArrayBuffer,
        (buffer) => {
          const channelData = buffer.getChannelData(channel)
          resolve(channelData)
        }
      )
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(f)
  })
}

const MAX_SCALAR = 20

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioUrl = useLyricsEditor((s) => s.audioUrl)
  const audioFile = useLyricsEditor((s) => s.audioFile)
  const [delayedOffset, delayedScalar] = useDebouncedValue([offset, scalar], {
    delay: 300,
    deps: [offset, scalar],
  })
  const { data: channelData } = useSWR(['getChannelData', audioUrl], () => {
    if (!audioFile) {
      return null
    }
    return getChannelData(audioFile)
  })

  // ui 左右拖动
  useEffect(() => {
    if (action !== 'drag') {
      return noop
    }
    const onMouseUp = () => {
      setAction(null)
    }
    const onMouseMove = (e: MouseEvent) => {
      const movementX = e.clientX - lastXForDragRef.current
      lastXForDragRef.current = e.clientX
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
      const movementX = e.clientX - lastXForTimeRef.current
      lastXForTimeRef.current = e.clientX
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

  // 判断当前指针是否处于屏幕中可见，如果不可见，改变 offset 使其可见
  useListen(curTime, () => {
    if (isSettingTime) {
      return
    }
    const left = (size.width * scalar * curTime) / duration + offset
    const delta = 24
    if (left > 1024 - delta) {
      setOffset((prev) =>
        clamp(prev - size.width + 2 * delta, -size.width * (scalar - 1), 0)
      )
    }
  })

  // 绘制音频波形图
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !channelData) {
      return
    }
    const canvasWidth = canvas.clientWidth
    const canvasHeight = canvas.clientHeight
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#1876D2'

    const count = Math.floor(channelData.length / delayedScalar)
    const startIndex = Math.floor(
      (-delayedOffset / (size.width * delayedScalar)) * channelData.length
    )
    const step = Math.floor(count / (canvasWidth / 2))
    for (let i = 0; i < canvasWidth; i += 2) {
      const j = Math.floor((i * count) / canvasWidth)
      const slices = channelData.slice(startIndex + j, startIndex + j + step)
      const max = Math.max(...slices) * 0.9
      ctx.fillRect(i, ((1 - max) / 2) * canvasHeight, 1, max * canvasHeight)
    }
  }, [channelData, size, delayedOffset, delayedScalar])

  if (duration <= 0) {
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
        flexShrink: 0,
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onMouseDown={(e) => {
        setAction('drag')
        lastXForDragRef.current = e.clientX
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
        const newScalar = clamp(prevScalar - e.deltaY / 1000, 1, MAX_SCALAR)
        setScalar(newScalar)
        if (newScalar !== prevScalar) {
          const left = (e.currentTarget as HTMLElement).getBoundingClientRect()
            .x
          const x = e.clientX - left
          setOffset((prevOffset) => {
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
          border: '1px solid',
          borderColor: theme.palette.grey[400],
          overflowX: 'hidden',
        }}
      >
        {lrcItems.map((item, idx) => (
          <TimeSlice
            key={idx}
            index={idx}
            curItem={item}
            nextItem={lrcItems[idx + 1]}
            duration={duration}
            containerWidth={size.width}
            scalar={scalar}
            offset={offset}
          />
        ))}
      </Box>
      <Box
        component='canvas'
        ref={canvasRef}
        sx={{
          width: '100%',
          height: '75px',
        }}
      />
      <IndicatorContainer
        style={{
          transform: `translateX(${((isSettingTime ? tempTime : curTime) / duration) * size.width * scalar + offset}px)`,
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          lastXForTimeRef.current = e.clientX
          setTempTime(curTime)
          setIsSettingTime(true)
        }}
      >
        <IndicatorInner />
      </IndicatorContainer>
    </Box>
  )
}
