import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Pwd extends ShSimpleCallableCommand {
  usage = 'pwd [OPTION]...'

  description = 'Print the current working directory'

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
    this.vt.log(fileSystem.context.path)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'pwd'
  }
}
