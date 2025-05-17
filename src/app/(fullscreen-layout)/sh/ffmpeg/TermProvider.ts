import { FFmpegFileSystem } from './FFmpegFileSystem'

import { ShTerminal } from '../ShTerminal'
import { FFMPEG_SOURCES, getFFmpeg, loadFFmpeg } from '../../to-gif/getFFmpeg'
import {
  linkAddon,
  XT_CMD_PREFIX,
  XT_DIR_PREFIX,
  XT_FILE_PREFIX,
} from '../utils/link'
import { commands } from '../commands'
import { commandCompletion, pathCompletion } from '../plugins/completion'
import { backspace, backspaceWord } from '../plugins/backspace'
import { terminate } from '../plugins/terminate'
import { history } from '../plugins/history'
import { textInput } from '../plugins/textInput'
import { excute } from '../plugins/excute'

import { Terminal } from '@xterm/xterm'
import { noop } from 'lodash-es'

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

  private _vt: ShTerminal | null = null

  get vt() {
    if (!this._vt) {
      const ffmpeg = getFFmpeg()
      const fileSystem = new FFmpegFileSystem({
        ffmpeg,
      })
      const { xterm } = this
      const _vt = new ShTerminal({ fileSystem, xterm })
      commands.forEach(([name, Command]) => {
        _vt.registerCommand(name, Command)
      })
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
    const { xterm, vt } = this
    const { spinner } = vt
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
        if (vt.command.trim()) {
          vt.prompt()
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

    xterm.onData(async (e) => {
      if (!ffmpeg.loaded) {
        return
      }
      terminate(e, vt)
      if (spinner.loading) {
        return
      }
      backspace(e, vt)
      backspaceWord(e, vt)
      commandCompletion(e, vt)
      await pathCompletion(e, vt)
      history(e, vt)
      textInput(e, vt)
      await excute(e, vt)
    })
    return () => {
      this.dispose()
    }
  }

  static async loadFFmpegAndLog(vt: ShTerminal) {
    const { xterm, prefix, spinner } = vt
    for (let i = 0; i < FFMPEG_SOURCES.length; i += 1) {
      const source = FFMPEG_SOURCES[i]
      const fn = spinner.withLoading(
        async () =>
          loadFFmpeg(source)
            .then(() => true)
            .catch(() => false),
        0
      )
      xterm.write(`正在加载 ffmpeg [${source.name} 源]...\r\n`)
      const res = await fn()
      if (res) {
        xterm.write(`ffmpeg 加载已完成\r\n`)
        xterm.write('欢迎使用 FFmpeg 命令行工具\r\n')
        xterm.write(
          `载入本地文件可以直接拖拽到页面，也可以调用 ${linkAddon.cmd('upload')} 命令\r\n`
        )
        xterm.write(`输入 ${linkAddon.cmd('help')} 查看帮助\r\n`)
        xterm.write(`\r\n${prefix}`)
        return
      } else {
        xterm.write(`加载失败\r\n`)
        if (i === FFMPEG_SOURCES.length - 1) {
          xterm.write('所有源加载失败，请检查网络连接\r\n')
          xterm.write(`\r\n${prefix}`)
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

  dispose() {
    this._xterm = null
    this._vt = null
  }
}

export const sharedTerm = new TermProvider()
