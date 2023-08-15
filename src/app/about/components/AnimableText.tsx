import { useEventCallback } from '@mui/material'
import { noop } from 'lodash-es'
import { useEffect, useState } from 'react'
import { useEvent } from 'react-use'

interface AnimableTextProps {
  children: string
}

export function AnimableText({ children }: AnimableTextProps) {
  const [animating, setAnimating] = useState(false)
  const [cursorPos, setCursorPos] = useState({
    clientX: -9999,
    clientY: -9999,
  })

  useEffect(() => {
    if (!animating) {
      return noop
    }
    const timer = window.setTimeout(() => {
      setAnimating(false)
    }, 500)
    return () => {
      window.clearTimeout(timer)
    }
  }, [animating])

  const onPointerDown = useEventCallback((e: PointerEvent) => {
    setCursorPos({
      clientX: e.clientX,
      clientY: e.clientY,
    })
  })

  useEvent('pointerdown', onPointerDown)

  return (
    <>
      {children.split('').map((s, i) => (
        <span
          key={i}
          style={{
            transform: `translate`,
          }}
        >
          {s}
        </span>
      ))}
    </>
  )
}
