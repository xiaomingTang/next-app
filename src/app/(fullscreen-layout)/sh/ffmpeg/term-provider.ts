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

import { Terminal } from '@xterm/xterm'

import type { ITerminal } from '@xterm/xterm/src/browser/Types'

type TerminalWithCore = Terminal & {
  _core: ITerminal
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
    term.write('Welcome to FFmpeg Terminal!')
    sharedTerm.prompt()
    // @xterm/addon-fit ssr 下有问题
    const res = await import('@xterm/addon-fit')
    const fitAddon = new res.FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()
  }

  const getVirtualTerminal = () => {
    if (!storedVirtualTerminal) {
      const fileSystem = new FFmpegFileSystem({
        ffmpeg: getFFmpeg(),
      })
      storedVirtualTerminal = new ShTerminal({ fileSystem, xterm: getTerm() })
      void loadFFmpeg(FFMPEG_SOURCES[0])
      storedVirtualTerminal.registerCommand('cat', Cat)
      storedVirtualTerminal.registerCommand('cd', Cd)
      storedVirtualTerminal.registerCommand('echo', Echo)
      storedVirtualTerminal.registerCommand('ls', Ls)
      storedVirtualTerminal.registerCommand('mkdir', Mkdir)
      storedVirtualTerminal.registerCommand('pwd', Pwd)
      storedVirtualTerminal.registerCommand('rm', Rm)
      storedVirtualTerminal.registerCommand('touch', Touch)
    }
    return storedVirtualTerminal
  }

  const prompt = () => {
    const term = getTerm()
    command = ''
    term.write('\r\n$ ')
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
