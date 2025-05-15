import { ShCallableCommand } from '../ShCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Ls extends ShCallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const children = await fileSystem.context.getChildren()
    this.terminal.log(...children)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'ls'
  }
}
