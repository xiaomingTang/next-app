import { resolvePath } from '../utils/path'
import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cd extends ShSimpleCallableCommand {
  usage = 'cd [OPTION]... <file>'

  description = 'Change the current working directory'

  options = [
    {
      shortName: 'h',
      longName: 'help',
      description: 'Show help message',
    },
  ]

  override async execute() {
    this.normalizeOptions({
      withSimpleHelp: true,
      withValidate: true,
    })
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    const targetPath = resolvePath(context.path, this.args[0])
    fileSystem.context = fileSystem.getDirOrThrow(targetPath)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cd'
  }
}
