import { useEffect, useState } from 'react'

interface DeviceOrientation {
  alpha: number | null
  beta: number | null
  gamma: number | null
}

const defaultDeviceOrientation: DeviceOrientation = {
  alpha: null,
  beta: null,
  gamma: null,
}

export function useDeviceOrientation() {
  const [deviceOrientation, setDeviceOrientation] = useState(
    defaultDeviceOrientation
  )

  useEffect(() => {
    const onDeviceOrientationChange = (e: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
      })
    }

    window.addEventListener('deviceorientation', onDeviceOrientationChange)

    return () => {
      window.removeEventListener('deviceorientation', onDeviceOrientationChange)
    }
  }, [])

  return deviceOrientation
}
