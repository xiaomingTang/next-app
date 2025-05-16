import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Mv extends ShSimpleCallableCommand {
  usage = 'mv [OPTION]... <old_path> <new_path>'

  description = 'Move or rename a file or directory'

  options: ShSimpleCallableCommandOptions[] = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'Show help message',
      type: 'boolean',
    },
  ]

  override async execute() {
    this.normalizeOptionsAndArgs({
      withSimpleHelp: true,
    })
    const [oldPath, newPath] = this.pathsRequired(this.args[0], this.args[1])
    await this.vt.fileSystem.move(oldPath, newPath)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'mv'
  }
}
