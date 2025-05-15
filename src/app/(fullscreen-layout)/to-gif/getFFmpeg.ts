import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

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

export interface FFmpegSource {
  name: 'unpkg' | 'jsDelivr' | '本站'
  coreURL: string
  wasmURL: string
}

export const FFMPEG_SOURCES: FFmpegSource[] = [
  {
    name: 'unpkg',
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm',
  },
  {
    name: 'jsDelivr',
    coreURL:
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.min.js',
    wasmURL:
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm',
  },
  {
    name: '本站',
    coreURL:
      'https://cdn.16px.cc/public/static/@ffmpeg/core@0.12.10/ffmpeg-core.min.js',
    wasmURL:
      'https://cdn.16px.cc/public/static/@ffmpeg/core@0.12.10/ffmpeg-core.wasm',
  },
]

export async function loadFFmpeg(source: FFmpegSource) {
  const ffmpeg = getFFmpeg()
  if (ffmpeg.loaded) {
    return
  }
  await ffmpeg.load({
    coreURL: await toBlobURL(source.coreURL, 'text/javascript'),
    wasmURL: await toBlobURL(source.wasmURL, 'application/wasm'),
  })
}
