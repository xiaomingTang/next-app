import { parseCommand } from './utils/command'
import { ShDir, ShFile } from './ShAsset'
import { ansi, linkAddon } from './utils/link'

import { toError } from '@/errors/utils'
import { SilentError } from '@/errors/SilentError'

import stringWidth from 'string-width'

import type { Terminal } from '@xterm/xterm'
import type { ShFileSystem } from './ShFileSystem'
import type { ShCallableCommandConstructor } from './ShCallableCommand'

export class ShTerminal {
  get prefix() {
    const prefixStr = ` ${linkAddon.dir(this.fileSystem.context.path)} > `
    return ansi.bgBlack(prefixStr) + ' '
  }

  command = ''

  xterm: Terminal

  commands: Record<string, ShCallableCommandConstructor> = {}

  fileSystem: ShFileSystem

  constructor(props: { fileSystem: ShFileSystem; xterm: Terminal }) {
    this.xterm = props.xterm
    this.fileSystem = props.fileSystem
  }

  prompt = () => {
    this.command = ''
    this.xterm.write(`\r\n${this.prefix}`)
  }

  log(...args: (ShFile | ShDir | string)[]) {
    const { xterm } = this
    args.forEach((arg) => {
      if (typeof arg === 'string') {
        xterm.write(arg.endsWith('\n') ? arg : `${arg} `)
        return
      }
      if (ShFile.isFile(arg)) {
        xterm.write(`${linkAddon.file(arg.name, arg.path)}\t`)
        return
      }
      if (ShDir.isDir(arg)) {
        const txt = arg.name ? `${arg.name}/` : arg.path
        xterm.write(`${linkAddon.dir(txt, arg.path)}\t`)
        return
      }
    })
  }

  debug(...args: unknown[]) {
    console.debug('[sh]: ', ...args)
  }

  registerCommand(name: string, c: ShCallableCommandConstructor) {
    this.commands[name] = c
  }

  async executeCommand(cmd: string) {
    if (!cmd.trim()) {
      throw new SilentError('Empty command')
    }
    this.debug('execute: ', cmd)
    const { name, args, env } = parseCommand(cmd)
    this.debug('parsed: ', { name, args, env })
    const CommandClass = this.commands[name]
    if (!CommandClass) {
      throw new Error(`Command not found: ${name}`)
    }
    // TODO: 实现 pipe
    const commandInstance = new CommandClass({
      rawCommand: cmd,
      name,
      args,
      env,
      vt: this,
    })
    try {
      await commandInstance.execute()
    } catch (e) {
      const err = toError(e)
      err.message = `[sh error] [${commandInstance.name}]: ${err.message}`
      throw err
    }
  }

  /**
   * 删除最后一个字符
   */
  backspace() {
    const commandStrArr = Array.from(this.command)
    const lastChar = commandStrArr[commandStrArr.length - 1]
    if (lastChar === undefined) {
      return
    }
    this.command = commandStrArr.slice(0, commandStrArr.length - 1).join('')

    if (lastChar !== '\n') {
      this.xterm.write('\b \b'.repeat(stringWidth(lastChar)))
    } else {
      const lines = this.command.split(/\r\n|\r|\n/g)
      // 新的最后一行的长度
      let offset = stringWidth(lines[lines.length - 1])
      if (lines.length <= 1) {
        offset += stringWidth(this.prefix)
      }
      // 上移一行
      this.xterm.write('\x1b[1A')
      // 向右移动到行尾
      this.xterm.write(`\x1b[${offset}C`)
    }
  }

  /**
   * 删除最后一个单词，
   * 如果最后有若干个空格，则删除这些空格
   */
  backspaceWord() {
    const endSpaceCount = this.command.match(/\s*$/)?.[0].length ?? 0
    if (endSpaceCount > 0) {
      for (let i = 0; i < endSpaceCount; i += 1) {
        this.backspace()
      }
      return
    }
    const commandStrArr = Array.from(this.command)
    const lastSpaceReversedIndex = commandStrArr
      .reverse()
      .findIndex((c) => c === ' ')
    const lastWord = commandStrArr.slice(
      lastSpaceReversedIndex === -1
        ? 0
        : commandStrArr.length - lastSpaceReversedIndex
    )
    if (lastWord.length === 0) {
      return
    }
    Array.from(lastWord).forEach(() => {
      this.backspace()
    })
  }
}
