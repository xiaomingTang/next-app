import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Pwd extends ShSimpleCallableCommand {
  usage = 'pwd [OPTION]...'

  description = 'Print the current working directory'

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
    this.terminal.log(fileSystem.context)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'pwd'
  }
}
