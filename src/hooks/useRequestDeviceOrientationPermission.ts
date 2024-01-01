import { useCallback, useEffect, useState } from 'react'

function getRequestPermission() {
  return (DeviceOrientationEvent as unknown as IosDeviceOrientationEvent)
    .requestPermission
}

export function useRequestDeviceOrientationPermission() {
  const [permissionState, setPermissionState] =
    useState<PermissionState>('prompt')

  const requestPermission = useCallback<
    () => Promise<PermissionState>
  >(async () => {
    const rawRequestPermission = getRequestPermission()
    if (!rawRequestPermission) {
      return 'prompt'
    }
    const state = await rawRequestPermission()
    setPermissionState(state)
    return state
  }, [])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  return {
    permissionState,
    requestPermission,
  }
}
