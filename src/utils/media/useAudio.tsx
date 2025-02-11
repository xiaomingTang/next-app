import { remainder } from '../math'
import { numberFormat } from '../numberFormat'

import { sleepMs } from '@/utils/time'
import { useDelayedValue } from '@/hooks/useDelayedValue'
import { useListen } from '@/hooks/useListen'
import { useMediaLoading } from '@/hooks/useMediaLoading'

import { create } from 'zustand'
import { useAudio as useReactUseAudio } from 'react-use'
import { memo } from 'react'
import { clamp } from 'lodash-es'

type UseAudioRet = ReturnType<typeof useReactUseAudio>

export interface AudioStore {
  src?: string | null
  playList: string[]
  audio: UseAudioRet[0]
  state: UseAudioRet[1]
  controls: UseAudioRet[2] & {
    togglePlay: () => Promise<void>
    switchTo: (src: string) => void
    switchToIndex: (n: number) => void
    next: () => void
    prev: () => void
    /**
     * @param offset seconds
     */
    seekBackward: (offset: number) => void
    /**
     * @param offset seconds
     */
    seekForward: (offset: number) => void
  }
  ref?: UseAudioRet[3]
  loading: boolean
}

const DEFAULT_AUDIO_SRC = '/static/medias/empty.mp3'

const defaultAudioStore: AudioStore = {
  src: DEFAULT_AUDIO_SRC,
  playList: [],
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
    seekBackward: () => undefined,
    seekForward: () => undefined,
  },
  ref: undefined,
  loading: false,
}

function reactUseAudioProps(src?: string | null) {
  return {
    src: src || DEFAULT_AUDIO_SRC,
  } satisfies Parameters<typeof useReactUseAudio>[0]
}

export function generateUseAudio() {
  const useAudio = create(() => defaultAudioStore)

  function AudioPlayer() {
    const src = useAudio((state) => state.src)
    const { loading, setMedia } = useMediaLoading()
    // fix: react-use 第一次获取到的 state.duration 为空（以及由此导致的 controls.seek() 跳不到特定的时间节点）
    const props =
      useDelayedValue(async () => reactUseAudioProps(src), [src]) ??
      reactUseAudioProps(null)
    const [audio, state, controls, ref] = useReactUseAudio(props)

    useListen(state, () => {
      useAudio.setState({ state })
    })

    // 由于 react-use 的 useAudio 会在 state 变化时返回新的 audio, state, controls, ref, 浪费性能
    // 所以此处强行仅监听 src 变化, 以减少不必要的渲染
    useListen(props.src, () => {
      setMedia(ref?.current)
      useAudio.setState({
        loading,
        ref,
        audio,
        controls: {
          ...controls,

          // 由于此处的依赖仅为 props.src, state 被缓存,
          // 而 seek 依赖于 state.duration,
          // 因此需要在此处重新定义 seek, 从 useAudio.getState() 获取最新的 state
          seek: (time) => {
            const el = ref.current
            const { state } = useAudio.getState()
            if (!el || state.duration === undefined) {
              return
            }
            el.currentTime = clamp(time, 0, state.duration)
          },
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
          switchTo: (src) => {
            useAudio.setState({
              src,
            })
          },
          switchToIndex: (n) => {
            const { playList } = useAudio.getState()
            if (playList.length === 0) {
              return
            }
            useAudio.setState({
              src: playList[remainder(n, playList.length)],
            })
          },
          next: () => {
            const { playList } = useAudio.getState()
            if (playList.length === 0) {
              return
            }
            const activeIndex = playList.findIndex((item) => item === src)
            useAudio.setState({
              src: playList[remainder(activeIndex + 1, playList.length)],
            })
          },
          prev: () => {
            const { playList } = useAudio.getState()
            if (playList.length === 0) {
              return
            }
            const activeIndex = playList.findIndex((item) => item === src)
            useAudio.setState({
              src: playList[remainder(activeIndex - 1, playList.length)],
            })
          },
          seekBackward: (offset) => {
            const { time: curTime } = useAudio.getState().state
            const nextTime = curTime - numberFormat(offset, 10)
            useAudio.getState().controls.seek(nextTime)
          },
          seekForward: (offset) => {
            const { time: curTime } = useAudio.getState().state
            const nextTime = curTime + numberFormat(offset, 10)
            useAudio.getState().controls.seek(nextTime)
          },
        },
      })
    })

    return <>{audio}</>
  }

  return [useAudio, memo(AudioPlayer)] as const
}
