'use client'

import { createSsrStore } from './ssrStore/createSsrStore'
import { createJsonStorage } from './ssrStore/createJsonStorage'

import { useMediaLoading } from '@/hooks/useMediaLoading'
import { useListen } from '@/hooks/useListen'
import { remainder } from '@/utils/math'
import { sleepMs } from '@/utils/time'
import { getMP3s } from '@/app/admin/customMP3/server'
import { SA } from '@/errors/utils'

import { useAudio as useReactUseAudio } from 'react-use'
import { useEffect, useMemo } from 'react'
import { noop } from 'lodash-es'
import useSWR from 'swr'

import type { CustomMP3 } from '@prisma/client'

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

export const useAudio = createSsrStore(() => defaultAudioStore, {
  name: 'audioPlayer',
  storage: createJsonStorage({
    partialKeys: ['activeMP3', 'settings', 'mp3s'],
  }),
})

export function GlobalAudioPlayer() {
  const { data: rawMp3s } = useSWR('getMP3s', () => getMP3s({}).then(SA.decode))
  const { loading, setMedia } = useMediaLoading()
  const activeMP3 = useAudio((state) => state.activeMP3)
  const mp3s = useAudio((state) => state.mp3s)
  const props: Parameters<typeof useReactUseAudio>[0] = useMemo(
    () => ({
      src: activeMP3?.mp3 ?? '',
    }),
    [activeMP3]
  )

  const [audio, state, controls, ref] = useReactUseAudio(props)

  useListen(rawMp3s, () => {
    useAudio.setState({ mp3s: rawMp3s ?? [] })
  })
  useListen(audio, () => {
    useAudio.setState({ audio })
  })
  useListen(state, () => {
    useAudio.setState({ state })
  })
  useListen(controls, () => {
    useAudio.setState({
      controls: {
        ...controls,
        play: async () => {
          await sleepMs(0)
          return controls.play()
        },
        togglePlay: async () => {
          const { state: audioState, controls: audioControls } =
            useAudio.getState()
          if (audioState.paused) {
            return audioControls.play()
          }
          return audioControls.pause()
        },
        switchTo: (mp3) => {
          useAudio.setState({
            activeMP3: mp3,
          })
        },
        switchToIndex: (n) => {
          if (mp3s.length === 0) {
            return
          }
          useAudio.setState({
            activeMP3: mp3s[remainder(n, mp3s.length)],
          })
        },
        next: () => {
          if (mp3s.length === 0) {
            return
          }
          const activeIndex = mp3s.findIndex(
            (item) => item.hash === activeMP3?.hash
          )
          useAudio.setState({
            activeMP3: mp3s[remainder(activeIndex + 1, mp3s.length)],
          })
        },
        prev: () => {
          if (mp3s.length === 0) {
            return
          }
          const activeIndex = mp3s.findIndex(
            (item) => item.hash === activeMP3?.hash
          )
          useAudio.setState({
            activeMP3: mp3s[remainder(activeIndex - 1, mp3s.length)],
          })
        },
      },
    })
  })
  useListen(ref, () => {
    useAudio.setState({ ref })
    setMedia(ref?.current)
  })

  useListen(loading, () => {
    useAudio.setState({ loading })
  })

  useEffect(() => {
    const audioElem = ref.current
    if (!audioElem) {
      return noop
    }
    const handleEnded = () => {
      const {
        controls: audioControls,
        settings: { repeatMode },
        activeMP3: mp3,
      } = useAudio.getState()
      const hasNext = mp3 !== mp3s[mp3s.length - 1]
      switch (repeatMode) {
        case 'Pause-when-Finished':
          break
        case 'Repeat-Single':
          void audioControls.play()
          break
        case 'Repeat-Playlist':
          audioControls.next()
          void audioControls.play()
          break
        case 'Play-in-Order': {
          if (!hasNext) {
            break
          }
          audioControls.next()
          void audioControls.play()
          break
        }
        default:
          break
      }
    }

    // 添加 ended 事件监听
    audioElem.addEventListener('ended', handleEnded)

    // 在组件卸载时清除事件监听
    return () => {
      audioElem.removeEventListener('ended', handleEnded)
    }
  }, [mp3s, ref])

  useEffect(() => {
    if (!activeMP3 || !state.playing) {
      return noop
    }
    const prevTitle = document.title
    document.title = `🎵 ${activeMP3.name} | ${prevTitle}`
    return () => {
      document.title = prevTitle
    }
  }, [activeMP3, state.playing])

  return <>{audio}</>
}
