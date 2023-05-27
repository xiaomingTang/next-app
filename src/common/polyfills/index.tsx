'use client'

import { useEffect } from 'react'
import { throttle } from 'lodash-es'

function PolyfillVH() {
  useEffect(() => {
    const onResize = throttle(
      () => {
        const height = window.innerHeight
        document.documentElement.style.setProperty('--vh', `${height / 100}px`)
      },
      500,
      {
        leading: false,
        trailing: true,
      }
    )

    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <></>
}

export default function Polyfills() {
  return (
    <>
      <PolyfillVH />
    </>
  )
}
