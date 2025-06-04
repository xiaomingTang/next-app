import { withStatic } from '@zimi/utils'
import { create } from 'zustand'

type AudioPlayerState = {
  src: string | null
  loading: boolean
  error: boolean
  paused: boolean
  duration: number
}

let sharedAudio: HTMLAudioElement | null = null

function getAudio() {
  if (typeof window === 'undefined') {
    return {} as HTMLAudioElement
  }
  if (!sharedAudio) {
    sharedAudio = new Audio()
    sharedAudio.preload = 'auto'
    sharedAudio.autoplay = false
  }
  return sharedAudio
}

const useRawAudioPlayer = create<AudioPlayerState>((set) => {
  const audio = getAudio()
  audio.onpause = () => set({ paused: true })
  audio.onplay = () => set({ loading: true, paused: false })
  audio.onplaying = () => set({ loading: false, error: false, paused: false })
  audio.onerror = () => set({ error: true })
  audio.onended = () => {
    set({ paused: true })
  }

  return {
    src: null,
    loading: false,
    error: false,
    paused: true,
    duration: 0,
  }
})

export const useAudioPlayer = withStatic(useRawAudioPlayer, {
  play: async (src: string) => {
    const audio = getAudio()
    if (audio.src === src && !audio.paused) {
      return
    }
    audio.pause()

    audio.src = src
    useRawAudioPlayer.setState({ src, error: false })
    return audio.play().catch((err) => {
      console.error('Audio play error:', err)
      useRawAudioPlayer.setState({ error: true })
      throw err
    })
  },

  pause: () => getAudio().pause(),

  resume: async () => {
    useRawAudioPlayer.setState({ error: false })
    return getAudio()
      .play()
      .catch((err) => {
        console.error('Audio resume error:', err)
        useRawAudioPlayer.setState({ error: true })
        throw err
      })
  },

  stop: () => {
    const audio = getAudio()
    audio.pause()
    audio.currentTime = 0
  },

  seek: (time: number) => {
    getAudio().currentTime = time
  },
})
