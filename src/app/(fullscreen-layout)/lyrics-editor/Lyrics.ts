import { clamp } from 'lodash-es'

export const lyricTypeMap = {
  ar: '艺术家/演唱者',
  ti: '歌曲标题',
  al: '专辑名称',
  au: '作曲',
  by: '作词',
  offset: '时间偏移',
  length: '歌曲长度',
  re: '制作LRC的程序',
  ve: 'LRC版本',
}

export type LyricType = 'lyric' | keyof typeof lyricTypeMap | (string & {})

export class LyricItem {
  type: LyricType = 'lyric'

  /**
   * sec
   */
  time = 0

  value = ''

  constructor(
    s:
      | string
      | {
          type: LyricType
          value: string
          time?: number
        }
  ) {
    if (typeof s === 'string') {
      this.fromString(s)
    } else {
      this.type = s.type
      this.value = s.value
      if (typeof s.time === 'number') {
        this.time = s.time
      }
    }
  }

  fromString(s: string) {
    this.type = 'lyric'
    // [mm:ss.xx] 其中 xx 是百分之一秒
    let match = s.trim().match(/^\[(\d+):(\d+)(\.\d+)?\]\s*(.*)$/)
    if (match) {
      const [, min, sec, xx = '.0', text] = match
      this.time =
        parseInt(min) * 60 + parseInt(sec) + parseFloat(xx.padEnd(4, '0'))
      this.value = text
      return
    }
    // [al:xxx]
    match = s.trim().match(/^\[(\w+):(.*)\]$/)
    if (match) {
      const [, type, value] = match
      this.type = type.toLowerCase()
      this.value = value
      return
    }
    this.value = s
  }

  offset(offset: number) {
    if (this.type !== 'lyric') {
      return
    }
    this.time = Math.max(0, this.time + offset)
  }

  toString() {
    if (this.type === 'lyric') {
      const min = Math.floor(this.time / 60)
      const sec = Math.floor(this.time % 60)
      const xx = Math.floor((this.time % 1) * 100)
      return `[${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${xx.toString().padStart(2, '0')}] ${this.value}`
    }
    return `[${this.type}:${this.value}]`
  }
}

export class Lyrics {
  meta: LyricItem[] = []

  items: LyricItem[] = []

  /**
   * sec
   */
  duration = 0

  insertMeta(n: number, { type, value }: { type: LyricType; value: string }) {
    this.meta.splice(
      n,
      0,
      new LyricItem({
        type,
        value,
      })
    )
  }

  insertLyric(inputN: number, { value }: { value: string }) {
    const n = clamp(inputN, 0, this.items.length)
    const prevLyricTime = this.items[n - 1]?.time ?? 0
    const nextLyricTime = this.items[n]?.time ?? prevLyricTime + 2
    this.items.splice(
      n,
      0,
      new LyricItem({
        type: 'lyric',
        value,
        time: (prevLyricTime + nextLyricTime) / 2,
      })
    )
  }

  push({ type, value }: { type: LyricType; value: string }) {
    if (type === 'lyric') {
      const n = this.items.length
      this.insertLyric(n, { value })
    } else {
      const n = this.meta.length
      this.insertMeta(n, { type, value })
    }
  }
}

/**
 * type === lyric 排后面;
 * time 升序;
 * type 不同则按字母序排
 */
export function sortLyricItems(a: LyricItem, b: LyricItem) {
  if (a.type === b.type) {
    return a.time - b.time
  }
  if (a.type === 'lyric') {
    return 1
  }
  if (b.type === 'lyric') {
    return -1
  }
  return a.type.localeCompare(b.type)
}
