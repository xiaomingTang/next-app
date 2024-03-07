import { useSyncExternalStore } from 'react'

function getSnapshot() {
  return navigator.onLine
}

function subscribe(callback: (e: Event) => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function useIsOnline() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
