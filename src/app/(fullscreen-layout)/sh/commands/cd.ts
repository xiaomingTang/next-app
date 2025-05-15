import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Cd extends ShSimpleCallableCommand {
  usage = 'cd [OPTION]... <file>'

  description = 'Change the current working directory'

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
    const { fileSystem } = this.terminal
    fileSystem.context = await fileSystem.getDirOrThrow(this.args[0])
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'cd'
  }
}
