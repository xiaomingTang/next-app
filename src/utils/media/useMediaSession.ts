import { useEffect } from 'react'
import { noop } from 'lodash-es'

import type { AudioStore } from './useAudio'

export function useMediaMetadata({ title }: { title: string }) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return noop
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
    })
    return () => {
      navigator.mediaSession.metadata = null
    }
  }, [title])
}

export function useMediaSessionAction({
  controls,
}: {
  controls: AudioStore['controls']
}) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return noop
    }
    const actions: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', controls.play],
      ['pause', controls.pause],
      [
        'nexttrack',
        () => {
          controls.next()
          void controls.play()
        },
      ],
      [
        'previoustrack',
        () => {
          controls.prev()
          void controls.play()
        },
      ],
      [
        'seekbackward',
        (detail) => {
          controls.seekBackward(detail.seekOffset ?? 0)
        },
      ],
      [
        'seekforward',
        (detail) => {
          controls.seekForward(detail.seekOffset ?? 0)
        },
      ],
      [
        'seekto',
        (detail) => {
          controls.seek(detail.seekTime ?? 0)
        },
      ],
      [
        'stop',
        () => {
          controls.seek(0)
          controls.pause()
        },
      ],
    ]
    actions.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch (_) {
        console.warn(
          `The media session action "${action}" is not supported yet.`
        )
      }
    })
    return () => {
      actions.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch (_) {
          console.warn(
            `The media session action "${action}" is not supported yet.`
          )
        }
      })
    }
  }, [controls])
}
