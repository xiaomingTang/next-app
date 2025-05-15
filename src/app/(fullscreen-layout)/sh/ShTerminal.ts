import { parseCommand } from './utils/command'
import { ShDir, ShFile } from './ShAsset'

import { toError } from '@/errors/utils'
import { SilentError } from '@/errors/SilentError'

import type { Terminal } from '@xterm/xterm'
import type { ShFileSystem } from './ShFileSystem'
import type { ShCallableCommandConstructor } from './ShCallableCommand'

export class ShTerminal {
  xterm: Terminal

  commands: Record<string, ShCallableCommandConstructor> = {}

  fileSystem: ShFileSystem

  constructor(props: { fileSystem: ShFileSystem; xterm: Terminal }) {
    this.xterm = props.xterm
    this.fileSystem = props.fileSystem
  }

  log(...args: (ShFile | ShDir | string)[]) {
    const { xterm } = this
    args.forEach((arg) => {
      if (typeof arg === 'string') {
        xterm.write(arg.endsWith('\n') ? arg : `${arg} `)
        return
      }
      if (ShFile.isFile(arg)) {
        xterm.write(`${arg.name}\t`)
        return
      }
      if (ShDir.isDir(arg)) {
        xterm.write(`${arg.name}/\t`)
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
