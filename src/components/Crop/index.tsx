import { Corner } from './Corner'
import { CROP_BG, DASH_COLOR, type CropAlignmeng } from './constants'
import { Aside } from './Aside'

import { useListen } from '@/hooks/useListen'

import { Box, useEventCallback } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

export interface CropParams {
  x: number
  y: number
  w: number
  h: number
}

export interface CropProps {
  value: CropParams
  onChange?: (value: CropParams) => void
  onTempChange?: (value: CropParams) => void
  flagAlignment?: CropAlignmeng
}

export function Crop({
  flagAlignment = 'inside',
  value,
  onChange,
  onTempChange,
}: CropProps) {
  const [tempValue, setTempValue] = useState<CropParams>(value)
  const tempValueRef = useRef<CropParams>(tempValue)
  const dragHRef = useRef<'start' | 'end' | false>(false)
  const dragVRef = useRef<'start' | 'end' | false>(false)

  const onTempChangeRef = useEventCallback((newValue: CropParams) => {
    tempValueRef.current = newValue
    onTempChange?.(newValue)
  })

  const onChangeRef = useEventCallback((newValue: CropParams) => {
    tempValueRef.current = value
    setTempValue(value)
    // 必须先恢复 tempValue, 再调用 onChange
    onChange?.(newValue)
  })

  useListen(value, () => {
    tempValueRef.current = value
    setTempValue(value)
  })

  useEffect(() => {
    const onPointerUp = (e: PointerEvent) => {
      if (!dragHRef.current && !dragVRef.current) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      dragHRef.current = false
      dragVRef.current = false
      onChangeRef(tempValueRef.current)
    }
    document.addEventListener('pointerup', onPointerUp)
    return () => {
      document.removeEventListener('pointerup', onPointerUp)
    }
  }, [tempValueRef, onChangeRef])

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragHRef.current && !dragVRef.current) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      setTempValue(({ x, y, w, h }) => {
        const { movementX: dx, movementY: dy } = e
        const newValue = { x, y, w, h }
        if (dragHRef.current) {
          newValue.x = dragHRef.current === 'end' ? x : x + dx
          newValue.w = dragHRef.current === 'end' ? w + dx : w - dx
          if (newValue.w < 0) {
            newValue.x += newValue.w
            newValue.w = -newValue.w
            dragHRef.current = dragHRef.current === 'end' ? 'start' : 'end'
          }
        }
        if (dragVRef.current) {
          newValue.y = dragVRef.current === 'end' ? y : y + dy
          newValue.h = dragVRef.current === 'end' ? h + dy : h - dy
          if (newValue.h < 0) {
            newValue.y += newValue.h
            newValue.h = -newValue.h
            dragVRef.current = dragVRef.current === 'end' ? 'start' : 'end'
          }
        }
        onTempChangeRef?.(newValue)
        return newValue
      })
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [onTempChangeRef])

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          outline: `1px dashed ${DASH_COLOR}`,
          outlineOffset: '-1px',
          backgroundColor: CROP_BG,
          pointerEvents: 'none',
        }}
        style={{
          left: `${tempValue.x}px`,
          top: `${tempValue.y}px`,
          width: `${tempValue.w}px`,
          height: `${tempValue.h}px`,
        }}
      />
      <Corner
        alignmeng={flagAlignment}
        placement={{
          h: 'left',
          v: 'top',
        }}
        position={{ x: tempValue.x, y: tempValue.y }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = 'start'
          dragVRef.current = 'start'
        }}
      />
      <Corner
        alignmeng={flagAlignment}
        placement={{
          h: 'right',
          v: 'top',
        }}
        position={{ x: tempValue.x + tempValue.w, y: tempValue.y }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = 'end'
          dragVRef.current = 'start'
        }}
      />
      <Corner
        alignmeng={flagAlignment}
        placement={{
          h: 'left',
          v: 'bottom',
        }}
        position={{ x: tempValue.x, y: tempValue.y + tempValue.h }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = 'start'
          dragVRef.current = 'end'
        }}
      />
      <Corner
        alignmeng={flagAlignment}
        placement={{
          h: 'right',
          v: 'bottom',
        }}
        position={{
          x: tempValue.x + tempValue.w,
          y: tempValue.y + tempValue.h,
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = 'end'
          dragVRef.current = 'end'
        }}
      />
      <Aside
        alignmeng={flagAlignment}
        placement={{
          h: 'middle',
          v: 'top',
        }}
        position={{
          x: tempValue.x + tempValue.w / 2,
          y: tempValue.y,
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = false
          dragVRef.current = 'start'
        }}
      />
      <Aside
        alignmeng={flagAlignment}
        placement={{
          h: 'middle',
          v: 'bottom',
        }}
        position={{
          x: tempValue.x + tempValue.w / 2,
          y: tempValue.y + tempValue.h,
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = false
          dragVRef.current = 'end'
        }}
      />
      <Aside
        alignmeng={flagAlignment}
        placement={{
          h: 'left',
          v: 'middle',
        }}
        position={{
          x: tempValue.x,
          y: tempValue.y + tempValue.h / 2,
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = 'start'
          dragVRef.current = false
        }}
      />
      <Aside
        alignmeng={flagAlignment}
        placement={{
          h: 'right',
          v: 'middle',
        }}
        position={{
          x: tempValue.x + tempValue.w,
          y: tempValue.y + tempValue.h / 2,
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          dragHRef.current = 'end'
          dragVRef.current = false
        }}
      />
    </Box>
  )
}
