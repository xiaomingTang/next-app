import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Ls extends ShSimpleCallableCommand {
  usage = 'ls [options]... [path]'

  description = 'list directory contents'

  options: ShSimpleCallableCommandOptions[] = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'show this help message and exit',
      type: 'boolean',
    },
  ]

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const { fileSystem } = this.vt
    const [path] = this.pathsRequired(this.args[0] || '.')
    const children = await fileSystem.listDir(path)
    this.vt.log(...children)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'ls'
  }
}
