import { LyricItem, sortLyricItems } from '../Lyrics'

import { customConfirm } from '@/utils/customConfirm'
import { generateUseAudio } from '@/utils/media/useAudio'

import { withStatic } from '@zimi/utils'
import { create } from 'zustand'
import { clamp } from 'lodash-es'
import toast from 'react-hot-toast'

import type { LyricType } from '../Lyrics'

const useRawLyricsEditor = create(() => ({
  audioUrl: '',
  audioFile: null as File | null,
  lrcContent: '',
  lrcItems: [] as LyricItem[],
}))

/**
 * 注意，这里直接修改了 LyricItem 的值，在 react 中不推荐这样做，
 * 万一之后出现了 bug，记得检查这里
 */
function formatLrcItems(lrcItems: LyricItem[]) {
  const sortedItems = lrcItems.sort(sortLyricItems)
  const offsetItem = sortedItems.find((item) => item.type === 'offset')
  if (offsetItem) {
    toast('检测到歌词内容中存在 offset 标签，已自动调整歌词时间')
    const offset = parseInt(offsetItem.value) / 1000
    sortedItems.forEach((item) => {
      item.offset(-offset)
    })
  }
  return sortedItems.filter((item) => item.type !== 'offset')
}

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
        lrcItems: formatLrcItems(
          newText
            .split('\n')
            .filter(Boolean)
            .map((s) => new LyricItem(s))
        ),
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
  insertMeta(n: number, { type, value }: { type: LyricType; value: string }) {
    useRawLyricsEditor.setState((s) => ({
      lrcItems: formatLrcItems([
        ...s.lrcItems.slice(0, n),
        new LyricItem({
          type,
          value,
        }),
        ...s.lrcItems.slice(n),
      ]),
    }))
  },
  insertLrc(inputN: number, { value, time }: { value: string; time?: number }) {
    const { lrcItems } = useRawLyricsEditor.getState()
    const n = clamp(inputN, 0, lrcItems.length)
    const newTime = time ?? lrcItems[n - 1]?.time ?? 0
    useRawLyricsEditor.setState((s) => ({
      lrcItems: formatLrcItems([
        ...s.lrcItems.slice(0, n),
        new LyricItem({
          type: 'lyric',
          value,
          time: newTime,
        }),
        ...s.lrcItems.slice(n),
      ]),
    }))
  },
  updateItem(n: number, newItem: LyricItem) {
    useRawLyricsEditor.setState((s) => ({
      lrcItems: formatLrcItems(
        s.lrcItems.map((item, idx) => (idx === n ? newItem : item))
      ),
    }))
  },
  deleteLrcItem(n: number) {
    useRawLyricsEditor.setState((s) => ({
      lrcItems: s.lrcItems.filter((_, idx) => idx !== n),
    }))
  },
})

export const [useLyricsEditorAudio, LyricsEditorAudioPlayer] =
  generateUseAudio()
