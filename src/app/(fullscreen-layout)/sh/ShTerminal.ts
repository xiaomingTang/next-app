import { ShDir, ShFile } from './ShAsset'
import { ansi, linkAddon } from './utils/ansi'
import { XtermSpinner } from './XtermSpinner'

import type { Terminal } from '@xterm/xterm'
import type { ShFileSystem } from './ShFileSystem'
import type { ShCallableCommandConstructor } from './ShCallableCommand'

export class ShTerminal {
  get prefix() {
    const prefixStr = ` ${linkAddon.dir(this.fileSystem.context.path)} > `
    return ansi.bgBlack(prefixStr) + ' '
  }

  command = ''

  spinner: XtermSpinner

  commands: Record<string, ShCallableCommandConstructor> = {}

  private _xtermBuilder: () => Terminal

  private _xterm: Terminal | null = null

  get xterm() {
    if (!this._xterm) {
      this._xterm = this._xtermBuilder()
    }
    return this._xterm
  }

  private _fileSystemBuilder: () => ShFileSystem

  private _fileSystem: ShFileSystem | null = null

  get fileSystem() {
    if (!this._fileSystem) {
      this._fileSystem = this._fileSystemBuilder()
    }
    return this._fileSystem
  }

  constructor(props: {
    xtermBuilder: () => Terminal
    fileSystemBuilder: () => ShFileSystem
  }) {
    this._xtermBuilder = props.xtermBuilder
    this._fileSystemBuilder = props.fileSystemBuilder
    this.spinner = new XtermSpinner(this.xterm)
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

  dispose() {
    this._xterm = null
  }
}
