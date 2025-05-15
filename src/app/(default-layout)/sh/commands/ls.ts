import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { resolvePath } from '../utils/path'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Ls extends ShSimpleCallableCommand {
  usage = 'ls [options]... [path]'

  description = 'list directory contents'

  options = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'show this help message and exit',
    },
  ]

  override async execute() {
    this.normalizeOptions({
      withSimpleHelp: true,
      withValidate: true,
    })
    const { fileSystem } = this.terminal
    const targetPath = resolvePath(fileSystem.context.path, this.args[0] ?? '')
    const dir = fileSystem.getDirOrThrow(targetPath)
    const children = await dir.getChildren()
    this.terminal.log(...children)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'ls'
  }
}
