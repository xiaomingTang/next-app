import 'server-only'

import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

import type { ChildProcessWithoutNullStreams } from 'child_process'

function noop() {}

function random(n: number) {
  return Math.random()
    .toString(36)
    .substring(2, n + 2)
}

export interface TtsOption {
  /**
   * 文本内容
   */
  text: string
  /**
   * 语音名
   */
  voice: string
  output: string
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

export async function rawTts(option: TtsOption) {
  // 调用系统 edge-tts
  const {
    text,
    voice,
    rate,
    volume,
    pitch,
    output,
    abortController,
    timeoutMs,
  } = option
  const cmds = ['--voice', voice, '--text', text, '--write-media', output]
  if (rate) {
    cmds.push(`--rate=${rate}`)
  }
  if (volume) {
    cmds.push(`--volume=${volume}`)
  }
  if (pitch) {
    cmds.push(`--pitch=${pitch}`)
  }

  const dirname = path.dirname(output)
  try {
    await fs.mkdir(dirname, { recursive: true })
  } catch (_err) {
    throw new Error(`Failed to create output directory: ${dirname}`)
  }

  const res = spawn('edge-tts', cmds, {
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
          new Error(`edge-tts timeout after ${timeoutMs}ms`)
        )
      } else {
        res.kill('SIGTERM')
      }
    }, timeoutMs)
  }

  return new Promise<void>((resolve, reject) => {
    res.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`edge-tts exited with code ${code}`))
      }
      resolve()
    })

    res.on('error', reject)

    res.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(`edge-tts exited with code ${code}`))
      }
      resolve()
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
  options: Omit<TtsOption, 'output' | 'abortController'>[]
  output: string
  timeoutMs: number
}

export async function rawTtsMerge(config: TtsMergeOption) {
  const { options, output, timeoutMs } = config
  const abortController = new AbortController()
  if (options.length === 0) {
    throw new Error('No options provided for ttsMerge')
  }

  const timer = setTimeout(() => {
    abortController.abort(new Error(`ttsMerge timeout after ${timeoutMs}ms`))
  }, timeoutMs)

  if (options.length === 1) {
    // 如果只有一个选项，直接调用 rawTts
    const singleOption = options[0]
    return rawTts({
      ...singleOption,
      output,
      abortController,
      timeoutMs,
    }).finally(() => {
      clearTimeout(timer)
    })
  }

  const optionsWithOutput = options.map((opt, i) => ({
    ...opt,
    output: `${output}.tmp-${random(8)}-${i}`,
    abortController,
  }))
  const promises = optionsWithOutput.map((opt) => rawTts(opt))

  let ffmpegProcess: ChildProcessWithoutNullStreams | null = null

  return Promise.all(promises)
    .then(
      () =>
        new Promise<void>((resolve, reject) => {
          const ffmpegCmd = optionsWithOutput
            .map((opt) => ['-i', opt.output])
            .flat()
          ffmpegCmd.push(
            '-filter_complex',
            `concat=n=${optionsWithOutput.length}:v=0:a=1`,
            '-y',
            output
          )
          ffmpegProcess = spawn('ffmpeg', ffmpegCmd, {
            signal: abortController.signal,
          })
          ffmpegProcess.on('close', (code) => {
            if (code !== 0) {
              return reject(new Error(`ffmpeg exited with code ${code}`))
            }
            resolve()
          })
          ffmpegProcess.on('error', reject)
          ffmpegProcess.stdout.on('data', (data) => {
            console.log(`[ffmpeg]: ${data}`)
          })
          ffmpegProcess.stderr.on('data', (data) => {
            console.error(`[ffmpeg error]: ${data}`)
          })
        })
    )
    .catch(async (err) => {
      await fs.unlink(output).catch(noop)
      throw err
    })
    .finally(() => {
      clearTimeout(timer)
      ffmpegProcess?.stdout.destroy()
      ffmpegProcess?.stderr.destroy()
      return Promise.allSettled(
        optionsWithOutput.map((opt) => fs.unlink(opt.output).catch(noop))
      )
    })
}
