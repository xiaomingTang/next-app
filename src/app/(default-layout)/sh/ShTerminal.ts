import { parseCommand } from './utils/command'

import { toError } from '@/errors/utils'

import { Terminal } from '@xterm/xterm'

import type { ShFileSystem } from './ShFileSystem'
import type { ShCallableCommandConstructor } from './ShCallableCommand'

export class ShTerminal {
  xterm: Terminal

  commands: Record<string, ShCallableCommandConstructor> = {}

  fileSystem: ShFileSystem

  constructor(fileSystem: ShFileSystem) {
    this.xterm = new Terminal()
    this.fileSystem = fileSystem
  }

  log(...args: unknown[]) {
    this.xterm.writeln(args.join(' '))
  }

  debug(...args: unknown[]) {
    console.debug('[sh]: ', ...args)
  }

  registerCommand(name: string, c: ShCallableCommandConstructor) {
    this.commands[name] = c
  }

  async executeCommand(cmd: string) {
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
      terminal: this,
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
