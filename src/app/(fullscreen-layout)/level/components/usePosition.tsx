import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'
import { remainder } from '@/utils/math'

import { useMemo } from 'react'
import { useOrientation } from 'react-use'

function isNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

export function useLevelPosition() {
  const { angle } = useOrientation()
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

  return {
    x,
    y,
  }
}
