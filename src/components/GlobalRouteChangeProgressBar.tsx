'use client'

import { Fade, LinearProgress } from '@mui/material'
import router from 'next/router'
import { useEffect, useState } from 'react'

/**
 * 艹了 next.js 不抛出 events 了...
 */
export function GlobalRouteChangeProgressBar() {
  const [isRouteChanging, setIsRouteChanging] = useState(false)

  // 更新 isRouteChanging
  useEffect(() => {
    const onRouteChangeStart = () => {
      setIsRouteChanging(true)
    }

    const onRouteChangeComplete = () => {
      setIsRouteChanging(false)
    }

    router.events.on('routeChangeStart', onRouteChangeStart)
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart)
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])

  return (
    <Fade
      in={isRouteChanging}
      unmountOnExit
      style={{
        transitionDelay: isRouteChanging ? '750ms' : '0ms',
      }}
    >
      <LinearProgress
        color='primary'
        className='fixed z-infinity top-0 left-0 w-full pointer-events-none'
        sx={{ height: 3 }}
      />
    </Fade>
  )
}
