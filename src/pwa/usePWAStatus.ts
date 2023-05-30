import { noop } from 'lodash-es'
import { useEffect, useState } from 'react'

let init = false

export default function usePWAStatus() {
  const [hasNewVersion, setHasNewVersion] = useState(false)
  const [isNewVersionInstalled, setIsNewVersionInstalled] = useState(false)
  useEffect(() => {
    if (init) {
      return noop
    }
    if (!navigator.serviceWorker) {
      console.error('serviceWorker not supported')
      return noop
    }
    // https://web.dev/service-workers-registration/#improving-the-boilerplate
    const onLoad = () => {
      // 注册 service worker 并记录是否加载新版本
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              setHasNewVersion(true)
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' ||
                  newWorker.state === 'activated'
                ) {
                  if (navigator.serviceWorker.controller) {
                    setIsNewVersionInstalled(true)
                  }
                }
              })
            }
          })
        })
        .catch((registrationError) => {
          console.error('SW registration failed: ', registrationError)
        })
    }
    init = true
    window.addEventListener('load', onLoad)
    return () => {
      window.removeEventListener('load', onLoad)
    }
  }, [])

  return {
    hasNewVersion,
    isNewVersionInstalled,
  }
}
