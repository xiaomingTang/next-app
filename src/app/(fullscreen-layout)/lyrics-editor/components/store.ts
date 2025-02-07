import { customConfirm } from '@/utils/customConfirm'
import { generateUseAudio } from '@/utils/media/useAudio'

import { withStatic } from '@zimi/utils'
import { create } from 'zustand'

const useRawLyricsEditor = create(() => ({
  audioUrl: '',
  audioFile: null as File | null,
  lrcContent: '',
}))

export const useLyricsEditor = withStatic(useRawLyricsEditor, {
  async setFile(f: File, type: 'audio' | 'lrc') {
    if (type === 'lrc') {
      const prevText = useRawLyricsEditor.getState().lrcContent
      const newText = await f.text()
      if (
        prevText &&
        newText !== prevText &&
        !(await customConfirm('是否覆盖歌词文件？', 'SLIGHT'))
      ) {
        return
      }
      if (newText === prevText) {
        return
      }
      useRawLyricsEditor.setState({
        lrcContent: newText,
      })
      return
    }
    const prevFile = useRawLyricsEditor.getState().audioFile
    if (
      prevFile &&
      !(await customConfirm('是否使用新的音频文件？', 'SLIGHT'))
    ) {
      return
    }
    const url = URL.createObjectURL(f)
    useLyricsEditorAudio.setState({ src: url })
    useRawLyricsEditor.setState({
      audioFile: f,
      audioUrl: url,
    })
  },
  async setAudioUrl(url: string) {
    const prevUrl = useRawLyricsEditor.getState().audioUrl
    if (
      prevUrl &&
      prevUrl !== url &&
      !(await customConfirm('是否使用新的音频文件？', 'SLIGHT'))
    ) {
      return
    }
    if (prevUrl === url) {
      return
    }
    useLyricsEditorAudio.setState({ src: url })
    useRawLyricsEditor.setState({ audioUrl: url, audioFile: null })
  },
})

export const [useLyricsEditorAudio, LyricsEditorAudioPlayer] =
  generateUseAudio()
