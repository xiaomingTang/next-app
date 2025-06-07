import fs from 'fs/promises'

// 时间戳格式：00:00:01,000
function parseTimestamp(ts: string): number {
  const [h, m, sMs] = ts.split(':')
  const [s, ms] = sMs.split(',')
  return (
    parseInt(h) * 3600000 +
    parseInt(m) * 60000 +
    parseInt(s) * 1000 +
    parseInt(ms)
  )
}

function formatTimestamp(ms: number): string {
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0')
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  const msStr = String(ms % 1000).padStart(3, '0')
  return `${h}:${m}:${s},${msStr}`
}

export async function mergeSRT(filePaths: string[], outputPath: string) {
  let output = ''
  let subtitleIndex = 1
  let timeOffset = 0

  for (const filePath of filePaths) {
    const content = await fs.readFile(filePath, 'utf-8')
    const blocks = content.split(/\r?\n\r?\n/)

    let maxEndTime = 0

    for (const block of blocks) {
      const lines = block.split(/\r?\n/).filter(Boolean)
      if (lines.length < 2) {
        continue
      }

      const timeLine = lines[1]
      const [startRaw, endRaw] = timeLine.split(' --> ')
      const start = parseTimestamp(startRaw)
      const end = parseTimestamp(endRaw)

      // 更新时间戳并重写
      const startAdjusted = formatTimestamp(start + timeOffset)
      const endAdjusted = formatTimestamp(end + timeOffset)
      const updatedTimeLine = `${startAdjusted} --> ${endAdjusted}`

      output += `${subtitleIndex}\n${updatedTimeLine}\n${lines.slice(2).join('\n')}\n\n`

      subtitleIndex += 1

      if (end + timeOffset > maxEndTime) {
        maxEndTime = end + timeOffset
      }
    }

    // 下一轮偏移量从当前文件的最大结束时间开始
    timeOffset = maxEndTime
  }

  await fs.writeFile(outputPath, output.trim() + '\n', 'utf-8')
}
