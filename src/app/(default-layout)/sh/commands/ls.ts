import { CallableCommand } from '../utils/command'

import type { CallableCommandProps } from '../utils/command'

export class Ls extends CallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const children = await fileSystem.context.getChildren()
    this.terminal.log(...children)
  }

  constructor(props: CallableCommandProps) {
    super(props)
    this.name = 'ls'
  }
}
