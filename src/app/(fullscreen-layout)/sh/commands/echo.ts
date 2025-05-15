import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Echo extends ShSimpleCallableCommand {
  usage = 'echo [MSG]...'

  description = 'Print the message to the terminal'

  override async execute() {
    this.terminal.log(this.rawCommand.slice(5).trim())
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'echo'
  }
}
