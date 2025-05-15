'use client'

import '@xterm/xterm/css/xterm.css'

import { sharedTerm } from '../term-provider'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { toError } from '@/errors/utils'
import { SilentError } from '@/errors/SilentError'

import { Box } from '@mui/material'
import { useEffect, useRef } from 'react'
import stringWidth from 'string-width'

export function FFmpegRoot() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    void sharedTerm.initTerm(containerRef.current)
  }, [])

  useEffect(() => {
    const { term, virtualTerminal } = sharedTerm
    term.onData((e) => {
      // 必须要放到 onData 里
      const { command, isLoading, ffmpeg, termPrefix } = sharedTerm
      if (!ffmpeg.loaded) {
        return
      }
      if (isLoading) {
        return
      }
      // Ctrl+C
      if (e === '\u0003') {
        term.write('^C')
        sharedTerm.prompt()
        return
      }
      // Backspace (DEL)
      if (e === '\u007F') {
        // Do not delete the prompt
        const commandStrArr = Array.from(command)
        const lastChar = commandStrArr[commandStrArr.length - 1]
        if (lastChar === undefined) {
          return
        }
        sharedTerm.command = commandStrArr
          .slice(0, commandStrArr.length - 1)
          .join('')

        if (lastChar !== '\n') {
          let offset = stringWidth(lastChar)
          while (offset > 0) {
            // 光标退格
            term.write('\b \b')
            offset -= 1
          }
        } else {
          const lines = sharedTerm.command.split(/\r\n|\r|\n/g)
          let offset = stringWidth(lines[lines.length - 1])
          if (lines.length <= 1) {
            offset += stringWidth(termPrefix)
          }
          // 上移一行
          term.write('\x1b[1A')
          // 向右移动到行尾
          term.write(`\x1b[${offset}C`)
        }

        return
      }
      // Enter
      if (e === '\r') {
        const loaded = sharedTerm.loading()
        term.write(`\r\n`)
        void virtualTerminal
          .executeCommand(command)
          .then(() => {
            term.write(`\r\n`)
          })
          .catch((e) => {
            const err = toError(e)
            if (SilentError.isSilentError(err)) {
              return
            }
            term.write(err.message)
            term.write(`\r\n`)
          })
          .finally(() => {
            loaded()
            sharedTerm.prompt()
          })
        return
      }
      const lines = e.split(/\r\n|\r|\n/g)
      if (lines.length > 1) {
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i]
          if (i === 0) {
            term.write(`${line}\r\n`)
            sharedTerm.command += `${line}\n`
          } else if (i === lines.length - 1) {
            // 最后一行不需要换行
            term.write(`${line}`)
            sharedTerm.command += `${line}`
          } else {
            term.write(`${line}\r\n`)
            sharedTerm.command += `${line}\n`
          }
        }
        return
      }
      if (
        (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7e)) ||
        e >= '\u00a0'
      ) {
        sharedTerm.command += e
        term.write(e)
      }
    })
  }, [])

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
        ref={containerRef}
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
            textDecorationStyle: 'solid',
            [`&:hover`]: {
              color: 'primary.main',
            },
          },
        }}
      />
    </Box>
  )
}
