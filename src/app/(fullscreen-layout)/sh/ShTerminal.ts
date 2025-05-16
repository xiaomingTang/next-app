import { parseCommand } from './utils/command'
import { ShDir, ShFile } from './ShAsset'
import { applyAnsiStyle, linkAddon } from './utils/link'

import { toError } from '@/errors/utils'
import { SilentError } from '@/errors/SilentError'

import ansiStyles from 'ansi-styles'

import type { Terminal } from '@xterm/xterm'
import type { ShFileSystem } from './ShFileSystem'
import type { ShCallableCommandConstructor } from './ShCallableCommand'

export class ShTerminal {
  get prefix() {
    const prefixStr = ` ${linkAddon.dir(this.fileSystem.context.path)} > `
    return applyAnsiStyle(prefixStr, ansiStyles.bgBlack) + ' '
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
}
