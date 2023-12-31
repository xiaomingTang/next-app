'use client'

import { useLevelPosition } from './usePosition'

import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'

import { Alert, Box } from '@mui/material'
import { blue, red } from '@mui/material/colors'
import { useMemo } from 'react'

function isNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

export function LevelBall() {
  const w = 2
  // 圆直径为 d, svg size 为 2d
  const d = 80
  const { beta } = useDeviceOrientation()
  const { x, y } = useLevelPosition()
  const ux = useMemo(() => {
    if (x < 0.25) {
      return 1
    }
    if (x < 0.5) {
      return -1
    }
    if (x < 0.75) {
      return 1
    }
    return -1
  }, [x])
  const uy = useMemo(() => {
    if (y < 0.25) {
      return 1
    }
    if (y < 0.5) {
      return -1
    }
    if (y < 0.75) {
      return 1
    }
    return -1
  }, [y])

  return (
    <>
      <Box
        component='svg'
        viewBox={`0 0 ${d * 2} ${d * 2}`}
        sx={{
          position: 'absolute',
          width: d * 2,
          height: d * 2,
          transform: 'translate(-50%,-50%)',
          fill: 'none',
          stroke: blue[600],
          strokeWidth: w,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fontSize: 16,
        }}
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
        }}
      >
        {/* 准心圆 */}
        <circle
          cx={d}
          cy={d}
          r={d * 0.5}
          style={{
            fill: blue[600],
            fillOpacity: 0.2,
          }}
        />
        {/* 准心水平线 */}
        <line key='h' x1={d * 0.5} y1={d} x2={d * 1.5} y2={d} />
        {/* 准心竖直线 */}
        <line key='v' x1={d} y1={d * 0.5} x2={d} y2={d * 1.5} />
        <g
          style={{
            strokeWidth: 1,
          }}
        >
          {/* x 偏转角 */}
          <text
            x={d + (d * 0.5 + 4) * ux}
            y={Math.abs(y - 0.5) < 0.1 ? d + uy * 12 : d}
            stroke={Math.abs(x - 0.5) < 5 / 180 ? blue[600] : red[600]}
            textAnchor={ux > 0 ? 'start' : 'end'}
            // dominantBaseline 需要设置到 text 上, safari 不会从父节点继承该属性
            dominantBaseline='central'
          >
            {Math.abs(Math.round(x * 1800) / 10 - 90).toFixed(1)}°
          </text>
          {/* y 偏转角 */}
          <text
            x={Math.abs(x - 0.5) < 0.1 ? d + ux * 12 : d}
            y={d + (d * 0.5 + 16) * uy}
            stroke={Math.abs(y - 0.5) < 5 / 180 ? blue[600] : red[600]}
            textAnchor='middle'
            // dominantBaseline 需要设置到 text 上, safari 不会从父节点继承该属性
            dominantBaseline='central'
          >
            {Math.abs(Math.round(y * 1800) / 10 - 90).toFixed(1)}°
          </text>
        </g>
      </Box>
      {!isNumber(beta) && (
        <Alert
          severity='warning'
          sx={{
            position: 'absolute',
            zIndex: 1,
            top: 0,
            left: 0,
            width: '100%',
          }}
        >
          正在检测陀螺仪
        </Alert>
      )}
    </>
  )
}
