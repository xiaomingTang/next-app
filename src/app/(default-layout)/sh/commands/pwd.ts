import { ShCallableCommand } from '../ShCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Pwd extends ShCallableCommand {
  override async execute() {
    const { fileSystem } = this.terminal
    const { context } = fileSystem
    this.terminal.log(context)
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'pwd'
  }
}
