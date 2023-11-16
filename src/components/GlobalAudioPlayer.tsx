'use client'

import { useMediaLoading } from '@/hooks/useMediaLoading'
import { useListen } from '@/hooks/useListen'

import { create } from 'zustand'
import { useAudio as useReactUseAudio } from 'react-use'

type UseAudioRet = ReturnType<typeof useReactUseAudio>

export const useAudio = create<{
  audio: UseAudioRet[0]
  state: UseAudioRet[1]
  controls: UseAudioRet[2]
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
  },
  ref: undefined,
  loading: false,
}))

const props = {
  src: 'https://next-app-storage-04a4aa9a124907-staging.s3.ap-northeast-2.amazonaws.com/public/2023-11-14/qgubmQojbIFy.mp3',
}

export function GlobalAudioPlayer() {
  const { loading, setMedia } = useMediaLoading()

  const [audio, state, controls, ref] = useReactUseAudio(props)

  useListen(audio, () => {
    useAudio.setState({ audio })
  })
  useListen(state, () => {
    useAudio.setState({ state })
  })
  useListen(controls, () => {
    useAudio.setState({ controls })
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
