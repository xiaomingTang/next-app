import { CallableCommand } from '../utils/command'

import type { CallableCommandProps } from '../utils/command'

export class Pwd extends CallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    this.terminal.log(context)
  }

  constructor(props: CallableCommandProps) {
    super(props)
    this.name = 'pwd'
  }
}
