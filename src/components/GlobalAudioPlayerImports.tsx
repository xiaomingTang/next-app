'use client'

import { useAudio } from './useAudio'

import { useMediaLoading } from '@/hooks/useMediaLoading'
import { useListen } from '@/hooks/useListen'
import { remainder } from '@/utils/math'
import { sleepMs } from '@/utils/time'
import { useDelayedValue } from '@/hooks/useDelayedValue'

import { useAudio as useReactUseAudio } from 'react-use'
import { useEffect } from 'react'
import { noop } from 'lodash-es'

function reactUseAudioProps(src?: string) {
  return {
    src: src || '/static/medias/empty.mp3',
  } satisfies Parameters<typeof useReactUseAudio>[0]
}

export function GlobalAudioPlayer() {
  const { loading, setMedia } = useMediaLoading()
  const activeMP3 = useAudio((state) => state.activeMP3)
  const mp3s = useAudio((state) => state.mp3s)
  // fix: react-use 第一次获取到的 state.duration 为空（以及由此导致的 controls.seek() 跳不到特定的时间节点）
  const props =
    useDelayedValue(
      async () => reactUseAudioProps(activeMP3?.mp3),
      [activeMP3]
    ) ?? reactUseAudioProps()

  const [audio, state, controls, ref] = useReactUseAudio(props)

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

  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeMP3) {
      return noop
    }
    navigator.mediaSession.playbackState = state.playing ? 'playing' : 'paused'
    return () => {
      navigator.mediaSession.playbackState = 'none'
    }
  }, [activeMP3, state.playing, state.time])

  useEffect(() => {
    if (!('mediaSession' in navigator) || !activeMP3) {
      return
    }
    try {
      navigator.mediaSession.setPositionState({
        // bug: https://issues.chromium.org/issues/40287871
        // bug 描述: 'position' 设置无效, 干脆隐藏进度条算了
        duration: 0,
      })
    } catch (_) {
      console.warn(`not supported: "setPositionState"`)
    }
  }, [activeMP3, state.duration])

  return <>{audio}</>
}
