import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Mkdir extends ShSimpleCallableCommand {
  usage = 'mkdir [OPTION]... <dir>'

  description = 'Create a new directory'

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
    await fileSystem.createDir(path)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'mkdir'
  }
}
