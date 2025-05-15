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

import { Terminal } from '@xterm/xterm'

import type { ITerminal } from '@xterm/xterm/src/browser/Types'

type TerminalWithCore = Terminal & {
  _core: ITerminal
}

async function loadFFmpegAndLog(terminal: TerminalWithCore) {
  for (let i = 0; i < FFMPEG_SOURCES.length; i += 1) {
    const source = FFMPEG_SOURCES[i]
    terminal.write(`正在加载 ffmpeg [源 ${i + 1}]...\r\n`)
    try {
      await loadFFmpeg(source)
      terminal.write(`ffmpeg 加载已完成\r\n`)
      terminal.write('欢迎使用 FFmpeg 命令行工具\r\n')
      terminal.write('输入 help 查看帮助\r\n')
      terminal.write('\r\n/ > ')
      break
    } catch (_) {
      terminal.write(`ffmpeg 加载失败\r\n`)
      if (i === FFMPEG_SOURCES.length - 1) {
        terminal.write('所有源加载失败，请检查网络连接\r\n')
      }
    }
  }
}

function geneTerm() {
  let loadingFlag = 0
  let storedTerm: TerminalWithCore | null = null
  let command = ''
  let storedVirtualTerminal: ShTerminal | null = null

  const getTerm = () => {
    if (!storedTerm) {
      storedTerm = new Terminal({
        cursorBlink: true,
      }) as TerminalWithCore
    }
    return storedTerm
  }

  const initTerm = async (container: HTMLElement) => {
    const term = getTerm()
    term.open(container)
    // @xterm/addon-fit ssr 下有问题
    const res = await import('@xterm/addon-fit')
    const fitAddon = new res.FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()
  }

  const getVirtualTerminal = () => {
    if (!storedVirtualTerminal) {
      const ffmpeg = getFFmpeg()
      const fileSystem = new FFmpegFileSystem({
        ffmpeg,
      })
      storedVirtualTerminal = new ShTerminal({ fileSystem, xterm: getTerm() })
      storedVirtualTerminal.registerCommand('cat', Cat)
      storedVirtualTerminal.registerCommand('cd', Cd)
      storedVirtualTerminal.registerCommand('clear', Clear)
      storedVirtualTerminal.registerCommand('echo', Echo)
      storedVirtualTerminal.registerCommand('help', Help)
      storedVirtualTerminal.registerCommand('edit', Edit)
      storedVirtualTerminal.registerCommand('ffmpeg', FFmpegCmd)
      storedVirtualTerminal.registerCommand('ls', Ls)
      storedVirtualTerminal.registerCommand('mkdir', Mkdir)
      storedVirtualTerminal.registerCommand('pwd', Pwd)
      storedVirtualTerminal.registerCommand('rm', Rm)
      storedVirtualTerminal.registerCommand('touch', Touch)
      storedVirtualTerminal.registerCommand('vi', Vi)
      storedVirtualTerminal.registerCommand('vim', Vim)
      void loadFFmpegAndLog(getTerm())
      ffmpeg.on('log', (data) => {
        storedVirtualTerminal?.xterm.write(`[ffmpeg] ${data.message}\r\n`)
      })
    }
    return storedVirtualTerminal
  }

  const getTermPrefix = () => {
    const vt = getVirtualTerminal()
    return `${vt.fileSystem.context.path} > `
  }

  const prompt = () => {
    const term = getTerm()
    command = ''
    term.write(`\r\n${getTermPrefix()}`)
  }

  return {
    get isLoading() {
      return loadingFlag > 0
    },
    get virtualTerminal() {
      return getVirtualTerminal()
    },
    get term() {
      return getTerm()
    },
    get command() {
      return command
    },
    set command(value: string) {
      command = value
    },
    get ffmpeg() {
      return getFFmpeg()
    },
    get termPrefix() {
      return getTermPrefix()
    },
    initTerm,
    prompt,
    loading: () => {
      loadingFlag += 1
      return () => {
        loadingFlag -= 1
      }
    },
  }
}

export const sharedTerm = geneTerm()
