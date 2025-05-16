import { useEventCallback } from '@mui/material'
import { useEffect } from 'react'

export function useKeyDown(
  callback: (e: KeyboardEvent) => void | Promise<void>
) {
  const callbackRef = useEventCallback(callback)

  useEffect(() => {
    window.addEventListener('keydown', callbackRef)
    return () => {
      window.removeEventListener('keydown', callbackRef)
    }
  }, [callbackRef])
}

export function useKeyUp(callback: (e: KeyboardEvent) => void | Promise<void>) {
  const callbackRef = useEventCallback(callback)

  useEffect(() => {
    window.addEventListener('keyup', callbackRef)
    return () => {
      window.removeEventListener('keyup', callbackRef)
    }
  }, [callbackRef])
}

export function useKeyPress(
  callback: (e: KeyboardEvent) => void | Promise<void>
) {
  const callbackRef = useEventCallback(callback)

  useEffect(() => {
    window.addEventListener('keypress', callbackRef)
    return () => {
      window.removeEventListener('keypress', callbackRef)
    }
  }, [callbackRef])
}

export function isCtrlAnd(key: string, e: KeyboardEvent) {
  return (
    (e.ctrlKey || e.metaKey) &&
    e.key === key &&
    !e.isComposing &&
    !e.defaultPrevented
  )
}

export function isInputting(e: KeyboardEvent) {
  return (e.target as HTMLElement)?.tagName?.match(/input|textarea/i)
}

export function isButton(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (!target) {
    return false
  }
  return (
    target.tagName?.match(/button/i) || target.getAttribute('role') === 'button'
  )
}
