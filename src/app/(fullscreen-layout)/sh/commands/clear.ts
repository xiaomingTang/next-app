import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShSimpleCallableCommandOptions } from '../ShSimpleCallableCommand'
import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Clear extends ShSimpleCallableCommand {
  usage = 'clear [options]...'

  description = 'clear the terminal screen'

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
    this.terminal.xterm.clear()
    this.terminal.log('')
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'ls'
  }
}
