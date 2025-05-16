import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Echo extends ShSimpleCallableCommand {
  override async execute() {
    this.vt.log(this.rawCommand.slice(5).trim())
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'echo'
  }
}
