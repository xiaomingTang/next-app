import 'client-only'

import { useState, useEffect } from 'react'

export function useNowDate(intervalMs = 500) {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDate(new Date())
    }, intervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [intervalMs]) // 空数组表示仅在组件挂载时运行一次

  return date
}

export function useNow(intervalMs = 500) {
  const [timestamp, setTimestamp] = useState(Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimestamp(Date.now())
    }, intervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [intervalMs]) // 空数组表示仅在组件挂载时运行一次

  return timestamp
}
