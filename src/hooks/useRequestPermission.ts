import { useEventCallback } from '@mui/material'
import { noop } from 'lodash-es'
import { useEffect, useState } from 'react'

export function useRequestPermission(
  rawRequestPermission?: () => Promise<PermissionState>
) {
  const [permissionState, setPermissionState] =
    useState<PermissionState>('prompt')

  const requestPermission = useEventCallback(async () => {
    if (!rawRequestPermission) {
      throw new Error('requestPermission is not supported')
    }
    const state = await rawRequestPermission()
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
