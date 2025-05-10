import { FFmpeg } from '@ffmpeg/ffmpeg'

let storedFFmpeg: FFmpeg | null = null

export function getFFmpeg() {
  storedFFmpeg = storedFFmpeg || new FFmpeg()
  return storedFFmpeg
}
