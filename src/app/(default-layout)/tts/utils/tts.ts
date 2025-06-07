import 'server-only'

import { mergeSRT } from './mergeSRT'

import Boom from '@hapi/boom'

import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

import type { ChildProcessWithoutNullStreams } from 'child_process'

export interface TtsOption {
  /**
   * 文本内容
   */
  text: string
  /**
   * 语音名
   */
  voice: string
  basename: string
  /**
   * 语速
   */
  rate?: string
  /**
   * 音量
   */
  volume?: string
  /**
   * 音调
   */
  pitch?: string
  abortController?: AbortController
  timeoutMs?: number
}

interface TtsOutput {
  dirname: string
  basename: string
  audio: string
  srt: string
}

function unlinkTtsOutput(paths: TtsOutput) {
  return Promise.allSettled([fs.unlink(paths.audio), fs.unlink(paths.srt)])
}

async function ensureTtsTempPaths(basename: string): Promise<TtsOutput> {
  const dirname = path.resolve('./tmp')
  try {
    await fs.mkdir(dirname, { recursive: true })
  } catch (_err) {
    throw Boom.badRequest(`Failed to create tmp directory: ${dirname}`)
  }

  return {
    dirname,
    basename,
    audio: `${dirname}/${basename}.mp3`,
    srt: `${dirname}/${basename}.srt`,
  }
}

export async function rawTts(option: TtsOption) {
  // 调用系统 edge-tts
  const {
    text,
    voice,
    rate,
    volume,
    pitch,
    basename,
    abortController,
    timeoutMs,
  } = option

  const paths = await ensureTtsTempPaths(basename)
  const ttsParams = [
    '--voice',
    voice,
    '--text',
    text,
    '--write-media',
    paths.audio,
    '--write-subtitles',
    paths.srt,
  ]
  if (rate) {
    ttsParams.push(`--rate=${rate}`)
  }
  if (volume) {
    ttsParams.push(`--volume=${volume}`)
  }
  if (pitch) {
    ttsParams.push(`--pitch=${pitch}`)
  }

  const res = spawn('edge-tts', ttsParams, {
    signal: abortController?.signal,
  })

  res.stdout.on('data', (data) => {
    console.log(`[tts]: ${data}`)
  })

  res.stderr.on('data', (data) => {
    console.error(`[tts error]: ${data}`)
  })

  let timer: NodeJS.Timeout | null = null

  if (timeoutMs) {
    timer = setTimeout(() => {
      if (abortController) {
        abortController.abort(
          Boom.badRequest(`edge-tts timeout after ${timeoutMs}ms`)
        )
      } else {
        res.kill('SIGTERM')
      }
    }, timeoutMs)
  }

  return new Promise<TtsOutput>((resolve, reject) => {
    res.on('close', (code) => {
      if (code !== 0) {
        return reject(Boom.badRequest(`edge-tts exited with code ${code}`))
      }
      resolve(paths)
    })

    res.on('error', (err) => {
      reject(err.cause ?? err)
    })

    res.on('exit', (code) => {
      if (code !== 0) {
        return reject(Boom.badRequest(`edge-tts exited with code ${code}`))
      }
      resolve(paths)
    })
  }).finally(() => {
    if (timer) {
      clearTimeout(timer)
    }
    res.stdout.destroy()
    res.stderr.destroy()
  })
}

export interface TtsMergeOption {
  options: Omit<TtsOption, 'abortController' | 'basename'>[]
  basename: string
  timeoutMs: number
}

export async function rawTtsMerge(config: TtsMergeOption) {
  const { options, basename, timeoutMs } = config
  const abortController = new AbortController()
  if (options.length === 0) {
    throw Boom.badRequest('No options provided for ttsMerge')
  }

  const timer = setTimeout(() => {
    abortController.abort(
      Boom.badRequest(`merge tts timeout after ${timeoutMs}ms`)
    )
  }, timeoutMs)

  if (options.length === 1) {
    // 如果只有一个选项，直接调用 rawTts
    const singleOption = options[0]
    return rawTts({
      ...singleOption,
      basename,
      abortController,
      timeoutMs,
    }).finally(() => {
      clearTimeout(timer)
    })
  }

  let ffmpegProcess: ChildProcessWithoutNullStreams | null = null

  const paths = await ensureTtsTempPaths(basename)
  const outputs = await Promise.all(
    options.map((opt, i) =>
      rawTts({
        ...opt,
        basename: `${basename}-${i}`,
      })
    )
  )

  // merge srt 失败就失败了
  await mergeSRT(
    outputs.map(({ srt }) => srt),
    paths.srt
  ).catch(() => {
    console.warn(`Failed to merge SRT files ${paths.srt}.`)
    paths.srt = ''
  })

  return new Promise<TtsOutput>((resolve, reject) => {
    const audios = outputs.map(({ audio }) => audio)
    const inputArgs = audios.flatMap((file) => ['-i', file])
    const concatInputs = audios.map((_, i) => `[${i}:a]`).join('')
    const filterComplex = `${concatInputs}concat=n=${audios.length}:v=0:a=1[out]`

    const ffmpegParams = [
      ...inputArgs,
      '-filter_complex',
      filterComplex,
      '-map',
      '[out]',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '128k',
      '-y',
      paths.audio,
    ]

    ffmpegProcess = spawn('ffmpeg', ffmpegParams, {
      signal: abortController.signal,
    })
    ffmpegProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(Boom.badRequest(`ffmpeg exited with code ${code}`))
      }
      resolve(paths)
    })
    ffmpegProcess.on('error', (err) => {
      reject(err.cause ?? err)
    })
    ffmpegProcess.stdout.on('data', (data) => {
      console.log(`[ffmpeg]: ${data}`)
    })
    ffmpegProcess.stderr.on('data', (data) => {
      console.error(`[ffmpeg error]: ${data}`)
    })
  })
    .catch(async (err) => {
      await unlinkTtsOutput(paths)
      throw err
    })
    .finally(() => {
      clearTimeout(timer)
      ffmpegProcess?.stdout.destroy()
      ffmpegProcess?.stderr.destroy()
      return Promise.allSettled(outputs.map((opt) => unlinkTtsOutput(opt)))
    })
}
