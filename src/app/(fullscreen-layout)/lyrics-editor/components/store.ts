import { customConfirm } from '@/utils/customConfirm'

import { withStatic } from '@zimi/utils'
import { create } from 'zustand'

const useRawLyricsEditor = create(() => ({
  audioFile: null as File | null,
  lrcFile: null as File | null,
}))

export const useLyricsEditor = withStatic(useRawLyricsEditor, {
  async setFile(f: File, type: 'audioFile' | 'lrcFile') {
    const prevFile = useRawLyricsEditor.getState()[type]
    if (!prevFile) {
      useRawLyricsEditor.setState({ [type]: f })
      return
    }
    const res = await customConfirm(
      `是否使用新的${type === 'audioFile' ? '音频' : '歌词'}文件？`,
      'SLIGHT'
    )
    if (res) {
      useRawLyricsEditor.setState({ [type]: f })
    }
  },
})
