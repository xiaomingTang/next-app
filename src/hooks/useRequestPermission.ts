import { useEventCallback } from '@mui/material'
import { noop } from 'lodash-es'
import { useEffect, useState } from 'react'

type RequestPermissionFn = () => Promise<PermissionState>

export function useRequestPermission(
  getRequestPermission: () => RequestPermissionFn | undefined
) {
  const [permissionState, setPermissionState] =
    useState<PermissionState>('prompt')

  const requestPermission = useEventCallback(async () => {
    const requestPermission = getRequestPermission()
    if (!requestPermission) {
      throw new Error('requestPermission is not supported')
    }
    const state = await requestPermission()
    setPermissionState(state)
    return state
  })

  useEffect(() => {
    requestPermission().catch(noop)
  }, [requestPermission])

  return {
    permissionState,
    requestPermission,
  }
}
