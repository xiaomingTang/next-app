import { ShDir, ShFile } from './ShAsset'
import { ansi, linkAddon } from './utils/link'
import { TerminalSpinner } from './utils/loading'

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

  spinner: TerminalSpinner

  commands: Record<string, ShCallableCommandConstructor> = {}

  fileSystem: ShFileSystem

  constructor(props: { fileSystem: ShFileSystem; xterm: Terminal }) {
    this.xterm = props.xterm
    this.fileSystem = props.fileSystem
    this.spinner = new TerminalSpinner(this.xterm)
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
}
