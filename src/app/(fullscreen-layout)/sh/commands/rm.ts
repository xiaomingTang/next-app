import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Rm extends ShSimpleCallableCommand {
  usage = 'rm [OPTION]... <path>'

  description = 'Remove a file or directory'

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
    const { fileSystem } = this.vt
    const [path] = this.pathsRequired(this.args[0])
    // TODO: 支持传入 recursive 参数
    await fileSystem.delete(path)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'rm'
  }
}
