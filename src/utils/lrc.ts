interface LRCEntry {
  /**
   * seconds
   */
  timestamp: number
  text: string
}

interface LRCMetadata {
  /**
   * 艺术家/演唱者
   */
  ar?: string
  /**
   * 歌曲标题
   */
  ti?: string
  /**
   * 专辑名称
   */
  al?: string
  /**
   * 作曲
   */
  au?: string
  /**
   * 作词
   */
  by?: string
  /**
   * 时间偏移 (注意, offset 已经应用到了 lrcData 上)
   */
  offset?: string
  /**
   * 歌曲长度
   */
  length?: string
  /**
   * 制作LRC的程序
   */
  re?: string
  /**
   * LRC版本
   */
  ve?: string
  // 添加其他可能的 meta 信息
}

interface LRCResult {
  metadata: LRCMetadata
  lrcData: LRCEntry[]
}

export function parseLRC(lrcText: string): LRCResult {
  const lines = lrcText.split('\n')
  const lrcData: LRCEntry[] = []
  // 默认偏移为0 (注意 offset 单位是 ms)
  let offset = 0
  const metadata: LRCMetadata = {}

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const matchMeta = line.match(/\[([a-z]+):(.+)\]/i)
    if (matchMeta) {
      const key = matchMeta[1].toLowerCase()
      const value = matchMeta[2].trim()

      // 处理 offset 元数据
      if (key === 'offset') {
        // [offset:+/- 表示整体时间戳调整，以毫秒为单位，+ 向上调整时间，- 向下调整时间，即正值使歌词更早出现，负值使其更晚出现]
        offset = parseFloat(value)
      }

      metadata[key as keyof LRCMetadata] = value
    } else {
      const match = line.match(/\[(\d+:\d+\.\d+)\](.*)/)
      if (match) {
        const time = match[1]
        const text = match[2].trim()
        const [minutes, seconds] = time.split(':').map(parseFloat)
        const timestamp: number = minutes * 60 + seconds - offset / 1000
        lrcData.push({ timestamp, text })
      }
    }
  }

  return { metadata, lrcData }
}
