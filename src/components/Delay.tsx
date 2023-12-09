'use client'

import { useEffect, useState } from 'react'

export function Delay({
  children,
  delayMs = 0,
}: {
  children: React.ReactNode | React.ReactNode[]
  delayMs?: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [delayMs])

  return visible ? children : null
}
