import { parseCommand } from './utils/command'

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

  registerCommand(name: string, c: ShCallableCommandConstructor) {
    this.commands[name] = c
  }

  async executeCommand(cmd: string) {
    const { name, args, env } = parseCommand(cmd)
    const CommandClass = this.commands[name]
    if (!CommandClass) {
      throw new Error(`Command not found: ${name}`)
    }
    // TODO: 实现 pipe
    const commandInstance = new CommandClass({
      name,
      args,
      env,
      terminal: this,
    })
    await commandInstance.execute()
  }
}
