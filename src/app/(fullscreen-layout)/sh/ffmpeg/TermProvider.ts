import { FFmpegFileSystem } from './FFmpegFileSystem'

import { ShTerminal } from '../ShTerminal'
import { FFMPEG_SOURCES, getFFmpeg, loadFFmpeg } from '../../to-gif/getFFmpeg'
import { Ls } from '../commands/ls'
import { Cd } from '../commands/cd'
import { Pwd } from '../commands/pwd'
import { Cat } from '../commands/cat'
import { Mkdir } from '../commands/mkdir'
import { Touch } from '../commands/touch'
import { Echo } from '../commands/echo'
import { Rm } from '../commands/rm'
import { Vi } from '../commands/vi'
import { Vim } from '../commands/vim'
import { Edit } from '../commands/edit'
import { Help } from '../commands/help'
import { FFmpegCmd } from '../commands/ffmpeg'
import { Clear } from '../commands/clear'
import {
  linkAddon,
  XT_CMD_PREFIX,
  XT_DIR_PREFIX,
  XT_FILE_PREFIX,
} from '../utils/link'
import { TerminalSpinner } from '../utils/loading'
import { Upload } from '../commands/upload'

import { toError } from '@/errors/utils'
import { SilentError } from '@/errors/SilentError'

import { Terminal } from '@xterm/xterm'
import { noop } from 'lodash-es'
import stringWidth from 'string-width'

import type { ITerminal } from '@xterm/xterm/src/browser/Types'

type TerminalWithCore = Terminal & {
  _core: ITerminal
}

export class TermProvider {
  private _xterm: TerminalWithCore | null = null

  get xterm() {
    if (!this._xterm) {
      this._xterm = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: `Menlo, Monaco, Consolas, 'Andale Mono', 'Ubuntu Mono', 'Courier New', monospace`,
      }) as TerminalWithCore
      // prefetch
      void import('@xterm/addon-fit')
    }
    return this._xterm
  }

  private _termSpinner: TerminalSpinner | null = null

  get termSpinner() {
    if (!this._termSpinner) {
      this._termSpinner = new TerminalSpinner(this.xterm)
    }
    return this._termSpinner
  }

  private _vt: ShTerminal | null = null

  get vt() {
    if (!this._vt) {
      const ffmpeg = getFFmpeg()
      const fileSystem = new FFmpegFileSystem({
        ffmpeg,
      })
      const { xterm } = this
      const _vt = new ShTerminal({ fileSystem, xterm })
      _vt.registerCommand('cat', Cat)
      _vt.registerCommand('cd', Cd)
      _vt.registerCommand('clear', Clear)
      _vt.registerCommand('echo', Echo)
      _vt.registerCommand('help', Help)
      _vt.registerCommand('edit', Edit)
      _vt.registerCommand('ffmpeg', FFmpegCmd)
      _vt.registerCommand('ls', Ls)
      _vt.registerCommand('mkdir', Mkdir)
      _vt.registerCommand('pwd', Pwd)
      _vt.registerCommand('rm', Rm)
      _vt.registerCommand('touch', Touch)
      _vt.registerCommand('upload', Upload)
      _vt.registerCommand('vi', Vi)
      _vt.registerCommand('vim', Vim)
      this._vt = _vt
      ffmpeg.on('log', (data) => {
        this.xterm.write(`[ffmpeg] ${data.message}\r\n`)
      })
      void TermProvider.loadFFmpegAndLog(_vt)
    }
    return this._vt
  }

  initTerm(container?: HTMLElement | null) {
    if (!container) {
      return noop
    }
    const { xterm, vt, termSpinner } = this
    xterm.open(container)
    void TermProvider.toUseFitAddon(xterm)

    xterm.options.linkHandler = {
      activate: (_e, uri) => {
        const prefix = uri.slice(0, uri.indexOf('://')) + '://'
        if (prefix === 'http://' || prefix === 'https://') {
          window.open(uri, '_blank')
          return
        }
        const isValidLink = [
          XT_FILE_PREFIX,
          XT_DIR_PREFIX,
          XT_CMD_PREFIX,
        ].includes(prefix)
        if (!isValidLink) {
          return
        }
        switch (prefix) {
          case XT_FILE_PREFIX:
            xterm.input(`edit ${uri.slice(XT_FILE_PREFIX.length)}`)
            xterm.input('\r')
            break
          case XT_DIR_PREFIX:
            xterm.input(`cd ${uri.slice(XT_DIR_PREFIX.length)}`)
            xterm.input('\r')
            break
          case XT_CMD_PREFIX:
            xterm.input(uri.slice(XT_CMD_PREFIX.length))
            xterm.input('\r')
            break
        }
      },
      hover: noop,
      leave: noop,
      allowNonHttpProtocols: true,
    }

    const ffmpeg = getFFmpeg()

    xterm.onData((e) => {
      if (!ffmpeg.loaded) {
        return
      }
      if (termSpinner.loading) {
        return
      }
      // Ctrl+C
      if (e === '\u0003') {
        xterm.write('^C')
        vt.prompt()
        return
      }
      // Backspace (DEL)
      if (e === '\u007F') {
        // Do not delete the prompt
        const commandStrArr = Array.from(vt.command)
        const lastChar = commandStrArr[commandStrArr.length - 1]
        if (lastChar === undefined) {
          return
        }
        vt.command = commandStrArr.slice(0, commandStrArr.length - 1).join('')

        if (lastChar !== '\n') {
          xterm.write('\b \b'.repeat(stringWidth(lastChar)))
        } else {
          const lines = vt.command.split(/\r\n|\r|\n/g)
          let offset = stringWidth(lines[lines.length - 1])
          if (lines.length <= 1) {
            offset += stringWidth(vt.prefix)
          }
          // 上移一行
          xterm.write('\x1b[1A')
          // 向右移动到行尾
          xterm.write(`\x1b[${offset}C`)
        }

        return
      }
      // Enter
      if (e === '\r') {
        termSpinner.start()
        xterm.write(`\r\n`)
        void vt
          .executeCommand(vt.command)
          .then(() => {
            termSpinner.end()
            xterm.write(`\r\n`)
          })
          .catch((e) => {
            termSpinner.end()
            const err = toError(e)
            if (SilentError.isSilentError(err)) {
              return
            }
            xterm.write(err.message)
            xterm.write(`\r\n`)
          })
          .finally(() => {
            vt.prompt()
          })
        return
      }
      const lines = e.split(/\r\n|\r|\n/g)
      if (lines.length > 1) {
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i]
          if (i === 0) {
            xterm.write(`${line}\r\n`)
            vt.command += `${line}\n`
          } else if (i === lines.length - 1) {
            // 最后一行不需要换行
            xterm.write(`${line}`)
            vt.command += `${line}`
          } else {
            xterm.write(`${line}\r\n`)
            vt.command += `${line}\n`
          }
        }
        return
      }
      if (
        (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7e)) ||
        e >= '\u00a0'
      ) {
        vt.command += e
        xterm.write(e)
      }
    })
    return () => {
      this.vt.prompt()
    }
  }

  static async loadFFmpegAndLog(vt: ShTerminal) {
    const { xterm, prefix } = vt
    const spinner = new TerminalSpinner(xterm)
    for (let i = 0; i < FFMPEG_SOURCES.length; i += 1) {
      const source = FFMPEG_SOURCES[i]
      xterm.write(`正在加载 ffmpeg [源 ${i + 1}]...\r\n`)
      spinner.start()
      try {
        await loadFFmpeg(source)
        spinner.end()
        xterm.write(`ffmpeg 加载已完成\r\n`)
        xterm.write('欢迎使用 FFmpeg 命令行工具\r\n')
        xterm.write(
          `载入本地文件可以直接拖拽到页面，也可以调用 ${linkAddon.cmd('upload')} 命令\r\n`
        )
        xterm.write(`输入 ${linkAddon.cmd('help')} 查看帮助\r\n`)
        xterm.write(`\r\n${prefix}`)
        break
      } catch (_) {
        spinner.end()
        xterm.write(`ffmpeg 加载失败\r\n`)
        if (i === FFMPEG_SOURCES.length - 1) {
          xterm.write('所有源加载失败，请检查网络连接\r\n')
        }
      }
    }
  }

  static async toUseFitAddon(xterm: TerminalWithCore) {
    // @xterm/addon-fit ssr 下有问题
    const { FitAddon } = await import('@xterm/addon-fit')
    const fitAddon = new FitAddon()
    xterm.loadAddon(fitAddon)
    fitAddon.fit()
  }
}

export const sharedTerm = new TermProvider()
