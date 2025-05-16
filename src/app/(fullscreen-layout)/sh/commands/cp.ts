import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'
import { resolvePath } from '../utils/path'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cp extends ShSimpleCallableCommand {
  usage = 'cp [OPTION]... <old_path> <new_path>'

  description = 'Copy a file or directory'

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
    // TODO: 支持传入 recursive 选项
    await this.vt.fileSystem.copy(oldPath, newPath)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cp'
  }
}
