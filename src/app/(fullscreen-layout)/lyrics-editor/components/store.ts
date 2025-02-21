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
    const res = await fetch(url)
    const blob = await res.blob()
    useRawLyricsEditor.setState({ audioFile: new File([blob], 'audio.mp3') })
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
  resetTimeline(lyricIndex = 0, dir: 'forward' | 'backward' = 'forward') {
    const allItems = useRawLyricsEditor.getState().lrcItems
    const metaItems = allItems.filter((item) => item.type !== 'lyric')
    const lyricItems = allItems.filter((item) => item.type === 'lyric')
    const curItem = lyricItems[lyricIndex]
    if (!curItem) {
      throw new Error('当前歌词项有误')
    }
    const fullDuration = useLyricsEditorAudio.getState().state.duration
    let duration: number
    if (dir === 'forward') {
      duration = fullDuration - (curItem.time ?? fullDuration)
    } else {
      duration = curItem.time ?? 0
    }
    if (!duration || duration <= 0) {
      throw new Error('剩余时间有误')
    }
    if (lyricItems.length === 0) {
      throw new Error('未检测到歌词内容')
    }
    if (dir === 'forward') {
      const timeStep = duration / (lyricItems.length - lyricIndex)
      useRawLyricsEditor.setState({
        lrcItems: formatLrcItems([
          ...metaItems,
          ...lyricItems.map((item, idx) => {
            if (idx <= lyricIndex) {
              return item
            }
            const newItem = new LyricItem(item)
            newItem.time = curItem.time + timeStep * (idx - lyricIndex)
            return newItem
          }),
        ]),
      })
    } else {
      const timeStep = duration / lyricIndex
      useRawLyricsEditor.setState({
        lrcItems: formatLrcItems([
          ...metaItems,
          ...lyricItems.map((item, idx) => {
            if (idx >= lyricIndex) {
              return item
            }
            const newItem = new LyricItem(item)
            newItem.time = timeStep * idx
            return newItem
          }),
        ]),
      })
    }
  },
  saveLrc() {
    const items = useLyricsEditor
      .getState()
      .lrcItems.map((item) => item.toString())
    if (items.length === 0) {
      throw new Error('未检测到歌词内容')
    }
    const lrc = items.join('\n')
    const blob = new Blob([lrc], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lyrics.lrc'
    a.click()
  },
})

export const [useLyricsEditorAudio, LyricsEditorAudioPlayer] =
  generateUseAudio()
