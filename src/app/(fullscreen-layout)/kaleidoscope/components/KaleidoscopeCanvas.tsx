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

type Pos = [number, number]

function sameParity(a: number, b: number) {
  return Math.abs(a % 2) === Math.abs(b % 2)
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
    // local position in the grid
    let lastPos: Pos = [0, 0]
    let lastArea: Pos = [0, 0]
    const getPos = (e: PointerLikeEvent): Pos => {
      const { clientX, clientY } = getSingleEvent(e)
      return [clientX - rect.left, clientY - rect.top]
    }
    const globalToLocal = (
      x: number,
      y: number
    ): {
      pos: Pos
      area: Pos
    } => {
      const { width, height } = rect
      const halfWidth = width / 2
      const halfHeight = height / 2
      const localX =
        x >= halfWidth
          ? (x - halfWidth) % gridSize
          : gridSize - ((halfWidth - x) % gridSize)
      const localY =
        y >= halfHeight
          ? (y - halfHeight) % gridSize
          : gridSize - ((halfHeight - y) % gridSize)
      // fix: 应当始终进位
      const DET = 0.000000001
      const areaX =
        x >= halfWidth
          ? Math.floor((x - halfWidth) / gridSize)
          : -Math.ceil((halfWidth + DET - x) / gridSize)
      const areaY =
        y >= halfHeight
          ? Math.floor((y - halfHeight) / gridSize)
          : -Math.ceil((halfHeight + DET - y) / gridSize)
      return {
        pos: [localX, localY],
        area: [areaX, areaY],
      }
    }
    const localToGlobal = (
      x: number,
      y: number,
      xn: number,
      yn: number
    ): Pos => {
      const { width, height } = rect
      const halfWidth = width / 2
      const halfHeight = height / 2
      const globalX = halfWidth + x + xn * gridSize
      const globalY = halfHeight + y + yn * gridSize
      return [globalX, globalY]
    }

    const onStart = (e: PointerLikeEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) {
        return
      }
      initCanvasSize(canvas)
      isDrawing = true
      rect = canvas.getBoundingClientRect()
      ;({ pos: lastPos, area: lastArea } = globalToLocal(...getPos(e)))
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
    }

    const onEnd = () => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!isDrawing || !ctx) {
        return
      }
      isDrawing = false
    }

    // startPos 和 endPos 都是 local position
    const draw = (startPos: Pos, endPos: Pos, startArea: Pos) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) {
        return
      }
      const xnMax = Math.ceil(rect.width / 2 / gridSize)
      const ynMax = Math.ceil(rect.height / 2 / gridSize)
      for (let xn = -xnMax; xn < xnMax; xn += 1) {
        const lastX = sameParity(xn, startArea[0])
          ? startPos[0]
          : gridSize - startPos[0]
        const curX = sameParity(xn, startArea[0])
          ? endPos[0]
          : gridSize - endPos[0]
        for (let yn = -ynMax; yn < ynMax; yn += 1) {
          const lastY = sameParity(yn, startArea[1])
            ? startPos[1]
            : gridSize - startPos[1]
          const curY = sameParity(yn, startArea[1])
            ? endPos[1]
            : gridSize - endPos[1]
          const prevGlobalPos = localToGlobal(lastX, lastY, xn, yn)
          const curGlobalPos = localToGlobal(curX, curY, xn, yn)
          ctx.beginPath()
          ctx.moveTo(...prevGlobalPos)
          ctx.quadraticCurveTo(...prevGlobalPos, ...curGlobalPos)
          ctx.stroke()
        }
      }
    }

    const onMove = (e: PointerLikeEvent) => {
      if (!isDrawing) {
        return
      }
      const { pos: curPos, area: curArea } = globalToLocal(...getPos(e))
      if (curArea[0] === lastArea[0] && curArea[1] === lastArea[1]) {
        draw(lastPos, curPos, curArea)
        lastPos = curPos
        lastArea = curArea
        return
      }
      const startArea: Pos = [
        Math.min(lastArea[0], curArea[0]),
        Math.min(lastArea[1], curArea[1]),
      ]
      const startPos: Pos = [
        lastPos[0] + (lastArea[0] - startArea[0]) * gridSize,
        lastPos[1] + (lastArea[1] - startArea[1]) * gridSize,
      ]
      const endPos: Pos = [
        curPos[0] + (curArea[0] - startArea[0]) * gridSize,
        curPos[1] + (curArea[1] - startArea[1]) * gridSize,
      ]
      draw(startPos, endPos, startArea)

      lastPos = curPos
      lastArea = curArea
    }

    return { onStart, onMove, onEnd }
  }, [gridSize, strokeColor, strokeWidth])

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
