'use client'

import '@xterm/xterm/css/xterm.css'

import { sharedTerm } from './TermProvider'

import { getFFmpeg } from '../../to-gif/getFFmpeg'
import { resolvePath } from '../utils/path'
import { ansi } from '../utils/link'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { useGlobalFileCatcherHandler } from '@/layout/components/useGlobalFileCatcherHandler'
import { cat } from '@/errors/catchAndToast'
import { dedup } from '@/utils/array'

import { Box } from '@mui/material'

export function FFmpegRoot() {
  useGlobalFileCatcherHandler.useUpdateHintText('载入文件')

  useGlobalFileCatcherHandler.useUpdateHandler(
    cat(async (files) => {
      const ffmpeg = getFFmpeg()
      if (!ffmpeg.loaded) {
        throw new Error('稍等片刻，FFmpeg 正在加载中...')
      }
      sharedTerm.xterm.write(`\r\n正在载入文件...`)
      sharedTerm.termSpinner.start()
      let dedupedCount = files.length
      let succeed = false
      try {
        const dedupedFiles = dedup(files, (f) => f.name)
        dedupedCount = dedupedFiles.length
        const contextPath = sharedTerm.vt.fileSystem.context.path
        await Promise.all(
          dedupedFiles.map(async (f) => {
            const uint8Array = new Uint8Array(await f.arrayBuffer())
            const p = resolvePath(contextPath, f.name)
            await ffmpeg.writeFile(p, uint8Array)
          })
        )
        succeed = true
      } finally {
        sharedTerm.termSpinner.end()
        if (succeed) {
          sharedTerm.xterm.write(`\r\n完成载入 ${dedupedCount} 个文件`)
          if (files.length > dedupedCount) {
            sharedTerm.xterm.write(
              `（${files.length - dedupedCount} 个${ansi.bold('同名文件')}被忽略）`
            )
          }
        } else {
          sharedTerm.xterm.write(`\r\n载入失败`)
        }
        sharedTerm.vt.prompt()
      }
    })
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <DefaultHeaderShim />
      <Box
        ref={sharedTerm.initTerm.bind(sharedTerm)}
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          overflow: 'hidden',
          [`& .xterm`]: {
            width: '100%',
            height: '100%',
            padding: '8px',
          },
          [`& .xterm-underline-5`]: {
            textDecoration: 'none',
            [`&:hover`]: {
              color: 'primary.main',
            },
          },
        }}
      />
    </Box>
  )
}
