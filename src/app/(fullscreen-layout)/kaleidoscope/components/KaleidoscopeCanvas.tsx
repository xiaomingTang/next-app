import { getSingleEvent } from '@/utils/pointerLike'

import { Box } from '@mui/material'
import { useMemo, useRef } from 'react'

import type { PointerLikeEvent } from '@/utils/pointerLike'
import type { BoxProps } from '@mui/material'

interface KaleidoscopeCanvasProps extends Omit<BoxProps<'canvas'>, 'ref'> {
  gridSize: number
  strokeWidth: number
  strokeColor: string
}

const defaultRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

function initCanvasSize(canvas: HTMLCanvasElement) {
  if (
    canvas.width !== canvas.clientWidth ||
    canvas.height !== canvas.clientHeight
  ) {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
  }
}

export function KaleidoscopeCanvas({
  strokeWidth,
  strokeColor,
  gridSize,
  ...props
}: KaleidoscopeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { onStart, onMove, onEnd } = useMemo(() => {
    let isDrawing = false
    let rect = defaultRect
    let lastPos: [number, number] | null = null
    const getPos = (e: PointerLikeEvent) => {
      const { clientX, clientY } = getSingleEvent(e)
      return [clientX - rect.left, clientY - rect.top]
    }

    const onStart = (e: PointerLikeEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) {
        return
      }
      isDrawing = true
      lastPos = null
      initCanvasSize(canvas)
      rect = canvas.getBoundingClientRect()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.beginPath()
      const [x, y] = getPos(e)
      ctx.moveTo(x, y)
    }

    const onMove = (e: PointerLikeEvent) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!isDrawing || !ctx) {
        return
      }
      const [x, y] = getPos(e)

      if (lastPos) {
        ctx.quadraticCurveTo(lastPos[0], lastPos[1], x, y)
      } else {
        ctx.lineTo(x, y)
      }

      ctx.stroke()
      lastPos = [x, y]
    }

    const onEnd = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!isDrawing || !ctx) {
        return
      }
      isDrawing = false
    }
    return { onStart, onMove, onEnd }
  }, [strokeColor, strokeWidth])

  return (
    <Box
      component='canvas'
      ref={canvasRef}
      {...props}
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
    />
  )
}
