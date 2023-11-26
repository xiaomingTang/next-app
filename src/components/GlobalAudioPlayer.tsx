'use client'

import { useMediaLoading } from '@/hooks/useMediaLoading'
import { useListen } from '@/hooks/useListen'

import { create } from 'zustand'
import { useAudio as useReactUseAudio } from 'react-use'
import { useMemo } from 'react'

import type { CustomMP3 } from '@prisma/client'

type UseAudioRet = ReturnType<typeof useReactUseAudio>

export const useAudio = create<{
  activeMp3?: CustomMP3
  audio: UseAudioRet[0]
  state: UseAudioRet[1]
  controls: UseAudioRet[2] & {
    switch: (mp3: CustomMP3) => void
    next: () => void
    prev: () => void
  }
  ref?: UseAudioRet[3]
  loading: boolean
}>(() => ({
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
    switch: () => undefined,
    next: () => undefined,
    prev: () => undefined,
  },
  ref: undefined,
  loading: false,
}))

export function GlobalAudioPlayer() {
  const { loading, setMedia } = useMediaLoading()
  const activeMp3 = useAudio((state) => state.activeMp3)
  const props: Parameters<typeof useReactUseAudio>[0] = useMemo(
    () => ({
      src: activeMp3?.mp3 ?? '',
      loop: true,
    }),
    [activeMp3]
  )

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
        switch: (mp3) => {
          useAudio.setState({
            activeMp3: mp3,
          })
        },
        next: () => {
          const { mp3s } = globalThis
          if (mp3s.length === 0) {
            return
          }
          const activeIndex = mp3s.findIndex(
            (item) => item.hash === activeMp3?.hash
          )
          useAudio.setState({
            activeMp3: mp3s[(activeIndex + 1 + mp3s.length) % mp3s.length],
          })
        },
        prev: () => {
          const { mp3s } = globalThis
          if (mp3s.length === 0) {
            return
          }
          const activeIndex = mp3s.findIndex(
            (item) => item.hash === activeMp3?.hash
          )
          useAudio.setState({
            activeMp3: mp3s[(activeIndex - 1 + mp3s.length) % mp3s.length],
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

  return <>{audio}</>
}
