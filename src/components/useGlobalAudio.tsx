'use client'

import { createSsrStore } from './ssrStore/createSsrStore'
import { createJsonStorage } from './ssrStore/createJsonStorage'

import { useListen } from '@/hooks/useListen'
import { getMP3s } from '@/app/admin/customMP3/server'
import { SA } from '@/errors/utils'
import { numberFormat } from '@/utils/numberFormat'

import { useEffect } from 'react'
import { clamp, noop } from 'lodash-es'
import useSWR from 'swr'

import type { useAudio as useReactUseAudio } from 'react-use'
import type { CustomMP3 } from '@/generated-prisma-client'

export type RepeatMode =
  | 'Repeat-Playlist'
  | 'Repeat-Single'
  | 'Play-in-Order'
  | 'Pause-when-Finished'

type UseAudioRet = ReturnType<typeof useReactUseAudio>

interface AudioStore {
  mp3s: CustomMP3[]
  activeMP3?: CustomMP3
  audio: UseAudioRet[0]
  state: UseAudioRet[1]
  controls: UseAudioRet[2] & {
    togglePlay: () => Promise<void>
    switchTo: (mp3: CustomMP3) => void
    switchToIndex: (n: number) => void
    next: () => void
    prev: () => void
  }
  ref?: UseAudioRet[3]
  loading: boolean
  settings: {
    repeatMode: RepeatMode
  }
}

const defaultAudioStore: AudioStore = {
  mp3s: [],
  audio: <></>,
  state: {
    buffered: [],
    duration: 0,
    muted: true,
    paused: true,
    playing: false,
    time: 0,
    volume: 0,
  },
  controls: {
    play: async () => undefined,
    pause: () => undefined,
    seek: () => undefined,
    volume: () => undefined,
    mute: () => undefined,
    unmute: () => undefined,
    togglePlay: async () => undefined,
    switchTo: () => undefined,
    switchToIndex: () => undefined,
    next: () => undefined,
    prev: () => undefined,
  },
  ref: undefined,
  loading: false,
  settings: {
    repeatMode: 'Repeat-Playlist',
  },
}

export const useGlobalAudio = createSsrStore(() => defaultAudioStore, {
  name: 'audioPlayer',
  storage: createJsonStorage({
    partialKeys: ['activeMP3', 'settings', 'mp3s'],
  }),
})

export function useInitGlobalAudio() {
  const { data: rawMp3s } = useSWR('getMP3s', () => getMP3s({}).then(SA.decode))
  const activeMP3 = useGlobalAudio((state) => state.activeMP3)
  const mp3s = useGlobalAudio((state) => state.mp3s)

  useListen(rawMp3s, () => {
    useGlobalAudio.setState({ mp3s: rawMp3s ?? [] })
  })

  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeMP3) {
      return noop
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeMP3.name,
    })
    const actions: [MediaSessionAction, MediaSessionActionHandler][] = [
      [
        'play',
        () => {
          void useGlobalAudio.getState().controls.play()
        },
      ],
      [
        'pause',
        () => {
          useGlobalAudio.getState().controls.pause()
        },
      ],
      [
        'nexttrack',
        () => {
          useGlobalAudio.getState().controls.next()
          void useGlobalAudio.getState().controls.play()
        },
      ],
      [
        'previoustrack',
        () => {
          useGlobalAudio.getState().controls.prev()
          void useGlobalAudio.getState().controls.play()
        },
      ],
      [
        'seekbackward',
        (detail) => {
          const { time: curTime, duration } = useGlobalAudio.getState().state
          const nextTime = curTime - numberFormat(detail.seekOffset, 10)
          useGlobalAudio.getState().controls.seek(clamp(nextTime, 0, duration))
        },
      ],
      [
        'seekforward',
        (detail) => {
          const { time: curTime, duration } = useGlobalAudio.getState().state
          const nextTime = curTime + numberFormat(detail.seekOffset, 10)
          useGlobalAudio.getState().controls.seek(clamp(nextTime, 0, duration))
        },
      ],
      [
        'seekto',
        (detail) => {
          const { time: curTime, duration } = useGlobalAudio.getState().state
          const nextTime = numberFormat(detail.seekTime, curTime + 10)
          useGlobalAudio.getState().controls.seek(clamp(nextTime, 0, duration))
        },
      ],
      [
        'stop',
        () => {
          useGlobalAudio.getState().controls.seek(0)
          useGlobalAudio.getState().controls.pause()
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
  }, [activeMP3, mp3s])
}
