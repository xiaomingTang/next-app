import { FFmpeg } from '@ffmpeg/ffmpeg'

let storedFFmpeg: FFmpeg | null = null

export function getFFmpeg() {
  if (storedFFmpeg) {
    return storedFFmpeg
  }
  storedFFmpeg = new FFmpeg()
  // TODO: 管理 log
  storedFFmpeg.on('log', (data) => {
    console.log('[ffmpeg]: ', data.message)
  })
  return storedFFmpeg
}
