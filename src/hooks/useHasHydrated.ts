import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/material'
import { useState } from 'react'

export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEnhancedEffect(() => {
    setHasHydrated(true)
  }, [])

  return hasHydrated
}
