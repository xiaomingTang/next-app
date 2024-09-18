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

function getServerSnapshot() {
  return true
}

export function useIsOnline() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
