import { FFmpegFileSystem } from './FFmpegFileSystem'

import { ShTerminal } from '../ShTerminal'
import { FFMPEG_SOURCES, getFFmpeg, loadFFmpeg } from '../../to-gif/getFFmpeg'
import {
  linkAddon,
  XT_CMD_PREFIX,
  XT_DIR_PREFIX,
  XT_FILE_PREFIX,
} from '../utils/ansi'
import { terminate } from '../plugins/terminate'
import { backspace, backspaceWord } from '../plugins/backspace'
import { commandCompletion, pathCompletion } from '../plugins/completion'
import { history } from '../plugins/history'
import { textInput } from '../plugins/textInput'
import { excute } from '../plugins/excute'
import { commands } from '../commands'

import { noop } from 'lodash-es'
import { Terminal } from '@xterm/xterm'

import type { ShFileSystem } from '../ShFileSystem'

async function applyFitAddon(xterm: Terminal) {
  // @xterm/addon-fit ssr 下有问题
  const { FitAddon } = await import('@xterm/addon-fit')
  const fitAddon = new FitAddon()
  xterm.loadAddon(fitAddon)
  fitAddon.fit()
}

async function loadFFmpegAndLog(vt: FFmpegTerminal) {
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

export class FFmpegTerminal extends ShTerminal {
  commands = Object.fromEntries(commands)

  constructor(props: {
    fileSystemBuilder: () => ShFileSystem
    xtermBuilder: () => Terminal
  }) {
    super(props)
  }

  initTerm(container?: HTMLElement | null) {
    if (!container) {
      return noop
    }
    const ffmpeg = getFFmpeg()
    ffmpeg.on('log', (data) => {
      this.xterm.write(`[ffmpeg] ${data.message}\r\n`)
    })
    void loadFFmpegAndLog(this)

    const { xterm, spinner } = this
    xterm.open(container)
    void applyFitAddon(xterm)

    xterm.options.linkHandler = {
      activate: this.onLinkActivate,
      hover: noop,
      leave: noop,
      allowNonHttpProtocols: true,
    }

    xterm.onData(async (e) => {
      if (!ffmpeg.loaded) {
        return
      }
      terminate(e, this)
      if (spinner.loading) {
        return
      }
      backspace(e, this)
      backspaceWord(e, this)
      commandCompletion(e, this)
      await pathCompletion(e, this)
      history(e, this)
      textInput(e, this)
      await excute(e, this)
    })

    return () => {
      this.dispose()
    }
  }

  onLinkActivate = (e: MouseEvent, uri: string) => {
    const { xterm } = this
    const prefix = uri.slice(0, uri.indexOf('://')) + '://'
    if (prefix === 'http://' || prefix === 'https://') {
      window.open(uri, '_blank')
      return
    }
    const isValidLink = [XT_FILE_PREFIX, XT_DIR_PREFIX, XT_CMD_PREFIX].includes(
      prefix
    )
    if (!isValidLink) {
      return
    }
    if (this.command.trim()) {
      this.prompt()
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
  }
}

export const sharedTerm = new FFmpegTerminal({
  xtermBuilder: () =>
    new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: `Menlo, Monaco, Consolas, 'Andale Mono', 'Ubuntu Mono', 'Courier New', monospace`,
    }),
  fileSystemBuilder: () => {
    const ffmpeg = getFFmpeg()
    return new FFmpegFileSystem({
      ffmpeg,
    })
  },
})
