import { LyricItem, sortLyricItems } from '../Lyrics'

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
export function formatLrcItems(lrcItems: LyricItem[]) {
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
      const newText = await f.text()
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
    const url = URL.createObjectURL(f)
    useLyricsEditorAudio.setState({ src: url })
    useRawLyricsEditor.setState({
      audioFile: f,
      audioUrl: url,
    })
  },
  async setAudioUrl(url: string) {
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
    const curTime = lrcItems[n - 1]?.time ?? 0
    const nextTime = lrcItems[n]?.time ?? curTime
    const newTime = time ?? (nextTime + curTime) / 2
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
  resetTimeline() {
    const duration = useLyricsEditorAudio.getState().state.duration
    if (duration === 0) {
      throw new Error('音频未加载完成')
    }
    const allItems = useRawLyricsEditor.getState().lrcItems
    const metaItems = allItems.filter((item) => item.type !== 'lyric')
    const lyricItems = allItems.filter((item) => item.type === 'lyric')
    if (lyricItems.length === 0) {
      throw new Error('未检测到歌词内容')
    }
    const timeStep = duration / lyricItems.length
    useRawLyricsEditor.setState({
      lrcItems: formatLrcItems([
        ...metaItems,
        ...lyricItems.map((item, idx) => {
          const newItem = new LyricItem(item)
          newItem.time = timeStep * idx
          return newItem
        }),
      ]),
    })
  },
})

export const [useLyricsEditorAudio, LyricsEditorAudioPlayer] =
  generateUseAudio()
