import { ShSimpleCallableCommand } from '../ShSimpleCallableCommand'

import type { ShCallableCommandProps } from '../ShCallableCommand'

export class Clear extends ShSimpleCallableCommand {
  override async execute() {
    this.vt.xterm.clear()
    this.vt.log('')
  }

  constructor(props: ShCallableCommandProps) {
    super(props)
    this.name = 'clear'
  }
}
