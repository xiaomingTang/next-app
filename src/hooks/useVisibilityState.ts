import { useSyncExternalStore } from 'react'

type EventCallback = (e: Event) => void

function subscribe(callback: EventCallback) {
  window.addEventListener('visibilitychange', callback)
  return () => {
    window.removeEventListener('visibilitychange', callback)
  }
}

function getSnapshot() {
  return document.visibilityState
}

function getServerSnapshot(): DocumentVisibilityState {
  return 'visible'
}

export function useVisibilityState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
