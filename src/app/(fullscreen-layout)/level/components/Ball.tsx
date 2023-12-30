'use client'

import { LevelLine } from './Line'

import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'
import { remainder } from '@/utils/math'

import { Alert, Box } from '@mui/material'
import { blue } from '@mui/material/colors'
import { useMemo } from 'react'
import { useOrientation } from 'react-use'

function isNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

export function LevelBall() {
  const { angle } = useOrientation()
  const size = 80
  const { beta, gamma } = useDeviceOrientation()
  const betaPercent = !isNumber(beta) ? 0.5 : remainder(beta + 90, 180) / 180
  const gammaPercent = !isNumber(gamma) ? 0.5 : remainder(gamma + 90, 180) / 180

  const x = useMemo(() => {
    switch (angle) {
      case 270:
        return 1 - betaPercent
      case 90:
        return betaPercent
      case 180:
        return 1 - gammaPercent
      default:
        return gammaPercent
    }
  }, [angle, betaPercent, gammaPercent])

  const y = useMemo(() => {
    switch (angle) {
      case 90:
        return 1 - gammaPercent
      case 270:
        return gammaPercent
      case 180:
        return 1 - betaPercent
      default:
        return betaPercent
    }
  }, [angle, betaPercent, gammaPercent])

  console.log({ x, y })

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          border: `1px solid ${blue[700]}`,
          borderRadius: '999px',
          transform: 'translate(-50%,-50%)',
        }}
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
        }}
      >
        <LevelLine
          key='h'
          orientation='horizontal'
          percentage={0.5}
          highlight
          color={blue}
        />
        <LevelLine
          key='v'
          orientation='vertical'
          percentage={0.5}
          highlight
          color={blue}
        />
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
